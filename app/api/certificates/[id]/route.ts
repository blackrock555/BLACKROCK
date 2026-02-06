import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/connect";
import { WithdrawalCertificate } from "@/lib/db/models";
import mongoose from "mongoose";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const userId = new mongoose.Types.ObjectId(session.user.id);

    // Find certificate by ID or certificate number
    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id, userId }
      : { certificateNumber: id, userId };

    const certificate = await WithdrawalCertificate.findOne(query)
      .populate("approvedBy", "name")
      .lean();

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      certificate: {
        id: certificate._id.toString(),
        certificateNumber: certificate.certificateNumber,
        userName: certificate.userName,
        amount: certificate.amount,
        network: certificate.network,
        toAddress: certificate.toAddress,
        issueDate: certificate.issueDate,
        status: certificate.status,
        qrCodeData: certificate.qrCodeData,
        approvedBy: (certificate.approvedBy as { name?: string })?.name || "Admin",
      },
    });
  } catch (error) {
    console.error("Get certificate error:", error);
    return NextResponse.json(
      { error: "Failed to fetch certificate" },
      { status: 500 }
    );
  }
}
