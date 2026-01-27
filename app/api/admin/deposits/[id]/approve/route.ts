import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/connect";
import { User, DepositRequest, Transaction, AuditLog } from "@/lib/db/models";
import { processReferralReward, hasReferralRewardBeenProcessed } from "@/lib/services/referral-rewards";
import { sendDepositApprovedEmail } from "@/lib/email/notification-service";
import { notifyDepositApproved } from "@/lib/services/notification-service";
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

    // Find the deposit request
    const deposit = await DepositRequest.findById(id);

    if (!deposit) {
      return NextResponse.json(
        { error: "Deposit request not found" },
        { status: 404 }
      );
    }

    if (deposit.status !== "PENDING") {
      return NextResponse.json(
        { error: "Deposit has already been processed" },
        { status: 400 }
      );
    }

    // Update deposit status
    deposit.status = "APPROVED";
    deposit.processedAt = new Date();
    deposit.processedBy = new mongoose.Types.ObjectId(session.user.id);
    await deposit.save();

    // Credit user's balance and get updated user
    const user = await User.findByIdAndUpdate(
      deposit.userId,
      {
        $inc: {
          balance: deposit.amount,
          depositBalance: deposit.amount,
        },
      },
      { new: true }
    );

    // Create transaction record
    await Transaction.create({
      userId: deposit.userId,
      type: "DEPOSIT",
      amount: deposit.amount,
      status: "COMPLETED",
      metadata: {
        depositRequestId: deposit._id,
        network: deposit.network,
        txHash: deposit.txHash,
      },
    });

    // Create audit log
    await AuditLog.create({
      action: "DEPOSIT_APPROVED",
      adminId: session.user.id,
      targetId: deposit.userId,
      entityType: "DEPOSIT",
      entityId: deposit._id,
      details: {
        amount: deposit.amount,
        network: deposit.network,
      },
    });

    // Process referral reward for first deposit
    try {
      const hasReward = await hasReferralRewardBeenProcessed(deposit.userId.toString());
      if (!hasReward) {
        await processReferralReward(deposit.userId.toString());
      }
    } catch (referralError) {
      console.error("Referral reward error (non-blocking):", referralError);
      // Don't fail the deposit approval if referral fails
    }

    // Send deposit confirmation email and in-app notification
    if (user) {
      try {
        await sendDepositApprovedEmail({
          email: user.email,
          name: user.name,
          amount: deposit.amount,
        });
      } catch (emailError) {
        console.error("Deposit confirmation email error (non-blocking):", emailError);
        // Don't fail the approval if email sending fails
      }

      // Create in-app notification
      try {
        await notifyDepositApproved(deposit.userId.toString(), deposit.amount);
      } catch (notifyError) {
        console.error("Notification error (non-blocking):", notifyError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Deposit approved successfully",
    });
  } catch (error) {
    console.error("Approve deposit error:", error);
    return NextResponse.json(
      { error: "Failed to approve deposit" },
      { status: 500 }
    );
  }
}
