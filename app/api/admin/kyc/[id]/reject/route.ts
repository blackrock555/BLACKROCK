import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/connect";
import { User, KYCRequest, AuditLog } from "@/lib/db/models";
import { notifyKYCRejected } from "@/lib/services/notification-service";
import mongoose from "mongoose";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const { reason } = await request.json();

    // Find the KYC request
    const kyc = await KYCRequest.findById(id);

    if (!kyc) {
      return NextResponse.json(
        { error: "KYC request not found" },
        { status: 404 }
      );
    }

    if (kyc.status !== "PENDING") {
      return NextResponse.json(
        { error: "KYC has already been processed" },
        { status: 400 }
      );
    }

    // Update KYC status
    kyc.status = "REJECTED";
    kyc.adminNote = reason;
    kyc.processedAt = new Date();
    kyc.processedBy = new mongoose.Types.ObjectId(session.user.id);
    await kyc.save();

    // Update user's KYC status
    await User.findByIdAndUpdate(kyc.userId, {
      $set: { kycStatus: "REJECTED" },
    });

    // Create audit log
    await AuditLog.create({
      action: "KYC_REJECTED",
      adminId: session.user.id,
      targetId: kyc.userId,
      entityType: "KYC",
      entityId: kyc._id,
      details: {
        fullName: kyc.fields.fullName,
        nationality: kyc.fields.nationality,
        reason,
      },
    });

    // Create in-app notification
    try {
      await notifyKYCRejected(kyc.userId.toString(), reason);
    } catch (notifyError) {
      console.error("Notification error (non-blocking):", notifyError);
    }

    return NextResponse.json({
      success: true,
      message: "KYC rejected",
    });
  } catch (error) {
    console.error("Reject KYC error:", error);
    return NextResponse.json(
      { error: "Failed to reject KYC" },
      { status: 500 }
    );
  }
}
