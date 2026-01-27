import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/connect";
import { User, WithdrawalRequest, Transaction, AuditLog } from "@/lib/db/models";
import { sendWithdrawalApprovedEmail } from "@/lib/email/notification-service";
import { notifyWithdrawalApproved } from "@/lib/services/notification-service";
import { generateWithdrawalCertificate } from "@/lib/services/certificate-generator";
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

    // Check user has sufficient balance
    const user = await User.findById(withdrawal.userId);
    if (!user || user.balance < withdrawal.amount) {
      return NextResponse.json(
        { error: "User has insufficient balance" },
        { status: 400 }
      );
    }

    // Update withdrawal status
    withdrawal.status = "APPROVED";
    withdrawal.processedAt = new Date();
    withdrawal.processedBy = new mongoose.Types.ObjectId(session.user.id);
    await withdrawal.save();

    // Deduct user's balance
    await User.findByIdAndUpdate(withdrawal.userId, {
      $inc: {
        balance: -withdrawal.amount,
      },
    });

    // Create transaction record
    await Transaction.create({
      userId: withdrawal.userId,
      type: "WITHDRAWAL",
      amount: withdrawal.amount,
      status: "COMPLETED",
      metadata: {
        withdrawalRequestId: withdrawal._id,
        network: withdrawal.network,
        toAddress: withdrawal.toAddress,
        fee: withdrawal.fee,
        netAmount: withdrawal.netAmount,
      },
    });

    // Create audit log
    await AuditLog.create({
      action: "WITHDRAWAL_APPROVED",
      adminId: session.user.id,
      targetId: withdrawal.userId,
      entityType: "WITHDRAWAL",
      entityId: withdrawal._id,
      details: {
        amount: withdrawal.amount,
        network: withdrawal.network,
        toAddress: withdrawal.toAddress,
      },
    });

    // Generate withdrawal certificate
    let certificateNumber = "";
    try {
      const result = await generateWithdrawalCertificate({
        withdrawalId: withdrawal._id.toString(),
        userId: withdrawal.userId.toString(),
        userName: user.name || "User",
        amount: withdrawal.amount,
        network: withdrawal.network.toUpperCase() as "ERC20" | "TRC20" | "BEP20",
        toAddress: withdrawal.toAddress,
        approvedBy: session.user.id,
      });
      certificateNumber = result.certificateNumber;
    } catch (certError) {
      console.error("Certificate generation error (non-blocking):", certError);
      // Don't fail the approval if certificate generation fails
    }

    // Send withdrawal confirmation email
    try {
      await sendWithdrawalApprovedEmail({
        email: user.email,
        name: user.name,
        amount: withdrawal.amount,
        toAddress: withdrawal.toAddress,
      });
    } catch (emailError) {
      console.error("Withdrawal confirmation email error (non-blocking):", emailError);
      // Don't fail the approval if email sending fails
    }

    // Create in-app notification
    try {
      await notifyWithdrawalApproved(withdrawal.userId.toString(), withdrawal.amount);
    } catch (notifyError) {
      console.error("Notification error (non-blocking):", notifyError);
    }

    return NextResponse.json({
      success: true,
      message: "Withdrawal approved and processed",
      certificateNumber: certificateNumber || undefined,
    });
  } catch (error) {
    console.error("Approve withdrawal error:", error);
    return NextResponse.json(
      { error: "Failed to approve withdrawal" },
      { status: 500 }
    );
  }
}
