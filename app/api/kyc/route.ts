import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/connect";
import { User, KYCRequest } from "@/lib/db/models";
import { uploadToCloudinary } from "@/lib/cloudinary";

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Check if user already has pending or approved KYC
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.kycStatus === "APPROVED") {
      return NextResponse.json(
        { error: "KYC already approved" },
        { status: 400 }
      );
    }

    if (user.kycStatus === "PENDING") {
      return NextResponse.json(
        { error: "KYC already pending review" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const fullName = formData.get("fullName") as string;
    const dateOfBirth = formData.get("dateOfBirth") as string;
    const nationality = formData.get("nationality") as string;
    const address = formData.get("address") as string;
    const idType = formData.get("idType") as string;
    const idNumber = formData.get("idNumber") as string;
    const idFront = formData.get("idFront") as File;
    const idBack = formData.get("idBack") as File | null;
    const selfie = formData.get("selfie") as File;

    // Validate required fields
    if (!fullName || !dateOfBirth || !nationality || !address || !idType || !idNumber) {
      return NextResponse.json(
        { error: "All personal information fields are required" },
        { status: 400 }
      );
    }

    if (!idFront || !selfie) {
      return NextResponse.json(
        { error: "ID front and selfie documents are required" },
        { status: 400 }
      );
    }

    // Validate file types and sizes
    const filesToValidate = [idFront, selfie];
    if (idBack) filesToValidate.push(idBack);

    for (const file of filesToValidate) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type for ${file.name}. Allowed: JPEG, PNG, WEBP, PDF` },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `${file.name} is too large. Maximum size is 10MB` },
          { status: 400 }
        );
      }
    }

    // Upload files to Cloudinary
    const uploadFile = async (file: File, prefix: string) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const result = await uploadToCloudinary(buffer, {
        folder: 'kyc',
        userId: session.user.id,
        filename: `${prefix}_${Date.now()}`,
        resourceType: file.type === 'application/pdf' ? 'raw' : 'image',
      });
      return {
        public_id: result.public_id,
        url: result.secure_url,
      };
    };

    const [idFrontUpload, selfieUpload] = await Promise.all([
      uploadFile(idFront, 'id_front'),
      uploadFile(selfie, 'selfie'),
    ]);

    let idBackUpload = null;
    if (idBack) {
      idBackUpload = await uploadFile(idBack, 'id_back');
    }

    // Create KYC request
    const kycRequest = await KYCRequest.create({
      userId: session.user.id,
      fields: {
        fullName,
        dateOfBirth: new Date(dateOfBirth),
        nationality,
        address,
        idType,
        idNumber,
      },
      docsUrls: {
        idFront: idFrontUpload.url,
        idBack: idBackUpload?.url,
        selfie: selfieUpload.url,
      },
      cloudinaryIds: {
        idFront: idFrontUpload.public_id,
        idBack: idBackUpload?.public_id,
        selfie: selfieUpload.public_id,
      },
      status: "PENDING",
    });

    // Update user KYC status
    await User.findByIdAndUpdate(session.user.id, {
      $set: { kycStatus: "PENDING" },
    });

    return NextResponse.json({
      success: true,
      message: "KYC documents submitted successfully. We will review your application within 24-48 hours.",
      kycId: kycRequest._id,
    });
  } catch (error) {
    console.error("KYC submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit KYC documents. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const kycRequest = await KYCRequest.findOne({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    if (!kycRequest) {
      return NextResponse.json({ kycRequest: null });
    }

    return NextResponse.json({ kycRequest });
  } catch (error) {
    console.error("Get KYC error:", error);
    return NextResponse.json(
      { error: "Failed to fetch KYC status" },
      { status: 500 }
    );
  }
}
