import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/connect";
import { WithdrawalRequest, AuditLog } from "@/lib/db/models";
import { notifyWithdrawalRejected } from "@/lib/services/notification-service";
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

    // Find the withdrawal request
    const withdrawal = await WithdrawalRequest.findById(id);

    if (!withdrawal) {
      return NextResponse.json(
        { error: "Withdrawal request not found" },
        { status: 404 }
      );
    }

    if (withdrawal.status !== "PENDING") {
      return NextResponse.json(
        { error: "Withdrawal has already been processed" },
        { status: 400 }
      );
    }

    // Update withdrawal status (no balance change since we didn't deduct on request)
    withdrawal.status = "REJECTED";
    withdrawal.adminNote = reason;
    withdrawal.processedAt = new Date();
    withdrawal.processedBy = new mongoose.Types.ObjectId(session.user.id);
    await withdrawal.save();

    // Create audit log
    await AuditLog.create({
      action: "WITHDRAWAL_REJECTED",
      adminId: session.user.id,
      targetId: withdrawal.userId,
      entityType: "WITHDRAWAL",
      entityId: withdrawal._id,
      details: {
        amount: withdrawal.amount,
        network: withdrawal.network,
        reason,
      },
    });

    // Create in-app notification
    try {
      await notifyWithdrawalRejected(withdrawal.userId.toString(), withdrawal.amount, reason);
    } catch (notifyError) {
      console.error("Notification error (non-blocking):", notifyError);
    }

    return NextResponse.json({
      success: true,
      message: "Withdrawal rejected",
    });
  } catch (error) {
    console.error("Reject withdrawal error:", error);
    return NextResponse.json(
      { error: "Failed to reject withdrawal" },
      { status: 500 }
    );
  }
}
