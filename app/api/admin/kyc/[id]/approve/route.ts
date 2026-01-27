import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/connect";
import { User, KYCRequest, AuditLog } from "@/lib/db/models";
import { sendKYCApprovedEmail } from "@/lib/email/notification-service";
import { notifyKYCApproved } from "@/lib/services/notification-service";
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
    kyc.status = "APPROVED";
    kyc.processedAt = new Date();
    kyc.processedBy = new mongoose.Types.ObjectId(session.user.id);
    await kyc.save();

    // Update user's KYC status and get updated user
    const user = await User.findByIdAndUpdate(
      kyc.userId,
      { $set: { kycStatus: "APPROVED" } },
      { new: true }
    );

    // Create audit log
    await AuditLog.create({
      action: "KYC_APPROVED",
      adminId: session.user.id,
      targetId: kyc.userId,
      entityType: "KYC",
      entityId: kyc._id,
      details: {
        fullName: kyc.fields.fullName,
        nationality: kyc.fields.nationality,
      },
    });

    // Send KYC approval notification email and in-app notification
    if (user) {
      try {
        await sendKYCApprovedEmail({
          email: user.email,
          name: user.name,
        });
      } catch (emailError) {
        console.error("KYC approval email error (non-blocking):", emailError);
        // Don't fail the approval if email sending fails
      }

      // Create in-app notification
      try {
        await notifyKYCApproved(kyc.userId.toString());
      } catch (notifyError) {
        console.error("Notification error (non-blocking):", notifyError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "KYC approved successfully",
    });
  } catch (error) {
    console.error("Approve KYC error:", error);
    return NextResponse.json(
      { error: "Failed to approve KYC" },
      { status: 500 }
    );
  }
}
