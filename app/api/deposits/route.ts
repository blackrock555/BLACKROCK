import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/connect";
import { DepositRequest } from "@/lib/db/models";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { getTransactionLimits, isFeatureEnabled } from "@/lib/services/settings-service";
import { notifyDepositPending } from "@/lib/services/notification-service";
import { sendAdminNotification } from "@/lib/email/notification-service";
import { rateLimitAsync } from "@/lib/utils/rate-limiter";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting - 5 deposit requests per 10 minutes per user
    const rateLimitResult = await rateLimitAsync(`deposit:${session.user.id}`, {
      maxRequests: 5,
      windowMs: 10 * 60 * 1000, // 10 minutes
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many deposit requests. Please try again later." },
        { status: 429 }
      );
    }

    await connectDB();

    // Check if deposits are enabled
    const depositsEnabled = await isFeatureEnabled("depositsEnabled");
    if (!depositsEnabled) {
      return NextResponse.json(
        { error: "Deposits are currently disabled" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const amount = Number(formData.get("amount"));
    const network = formData.get("network") as string;
    const proof = formData.get("proof") as File;
    const txHash = formData.get("txHash") as string | null;

    // Get transaction limits from settings
    const limits = await getTransactionLimits();

    // Validate amount
    if (!amount || amount < limits.minDeposit) {
      return NextResponse.json(
        { error: `Minimum deposit is $${limits.minDeposit}` },
        { status: 400 }
      );
    }

    if (amount > limits.maxDeposit) {
      return NextResponse.json(
        { error: `Maximum deposit is $${limits.maxDeposit}` },
        { status: 400 }
      );
    }

    // Validate network
    if (!["erc20", "trc20", "bep20"].includes(network)) {
      return NextResponse.json({ error: "Invalid network" }, { status: 400 });
    }

    // Validate proof file
    if (!proof) {
      return NextResponse.json(
        { error: "Payment proof is required" },
        { status: 400 }
      );
    }

    // Check file type
    if (!ALLOWED_TYPES.includes(proof.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: JPEG, PNG, WEBP, PDF" },
        { status: 400 }
      );
    }

    // Check file size
    if (proof.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Upload proof to Cloudinary
    const bytes = await proof.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await uploadToCloudinary(buffer, {
      folder: 'deposits',
      userId: session.user.id,
      filename: `deposit_${Date.now()}`,
      resourceType: proof.type === 'application/pdf' ? 'raw' : 'image',
    });

    // Create deposit request
    const depositRequest = await DepositRequest.create({
      userId: session.user.id,
      amount,
      network,
      proofUrl: uploadResult.secure_url,
      cloudinaryId: uploadResult.public_id,
      txHash: txHash || undefined,
      status: "PENDING",
    });

    // Create notification for pending deposit
    await notifyDepositPending(session.user.id, amount, network);

    // Send admin notification (non-blocking)
    sendAdminNotification({
      type: 'NEW_DEPOSIT',
      userName: session.user.name || 'User',
      userEmail: session.user.email || '',
      amount,
      network,
    }).catch((err) => console.error('Admin notification error (non-blocking):', err));

    return NextResponse.json({
      success: true,
      depositId: depositRequest._id,
      message: "Deposit request submitted successfully. We will verify your payment within 24 hours.",
    });
  } catch (error) {
    console.error("Deposit error:", error);
    return NextResponse.json(
      { error: "Failed to process deposit request" },
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = Number(searchParams.get("limit")) || 10;
    const page = Number(searchParams.get("page")) || 1;

    const query: Record<string, unknown> = { userId: session.user.id };
    if (status) {
      query.status = status;
    }

    const deposits = await DepositRequest.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await DepositRequest.countDocuments(query);

    return NextResponse.json({
      deposits,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get deposits error:", error);
    return NextResponse.json(
      { error: "Failed to fetch deposits" },
      { status: 500 }
    );
  }
}
