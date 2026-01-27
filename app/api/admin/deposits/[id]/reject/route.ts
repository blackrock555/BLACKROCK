import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/connect";
import { DepositRequest, AuditLog } from "@/lib/db/models";
import { notifyDepositRejected } from "@/lib/services/notification-service";
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
    deposit.status = "REJECTED";
    deposit.adminNote = reason;
    deposit.processedAt = new Date();
    deposit.processedBy = new mongoose.Types.ObjectId(session.user.id);
    await deposit.save();

    // Create audit log
    await AuditLog.create({
      action: "DEPOSIT_REJECTED",
      adminId: session.user.id,
      targetId: deposit.userId,
      entityType: "DEPOSIT",
      entityId: deposit._id,
      details: {
        amount: deposit.amount,
        network: deposit.network,
        reason,
      },
    });

    // Create in-app notification
    try {
      await notifyDepositRejected(deposit.userId.toString(), deposit.amount, reason);
    } catch (notifyError) {
      console.error("Notification error (non-blocking):", notifyError);
    }

    return NextResponse.json({
      success: true,
      message: "Deposit rejected",
    });
  } catch (error) {
    console.error("Reject deposit error:", error);
    return NextResponse.json(
      { error: "Failed to reject deposit" },
      { status: 500 }
    );
  }
}
