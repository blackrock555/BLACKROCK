import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/connect";
import { User, ProfitShareLedger, Transaction } from "@/lib/db/models";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { userId, percentage } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    if (!percentage || percentage <= 0 || percentage > 100) {
      return NextResponse.json({ error: "Percentage must be between 0.1 and 100" }, { status: 400 });
    }

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.depositBalance <= 0) {
      return NextResponse.json({ error: "User has no deposit balance" }, { status: 400 });
    }

    // Calculate profit amount
    const profitAmount = (user.depositBalance * percentage) / 100;

    // Get today's date (UTC midnight)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Create ledger entry
    const ledgerEntry = await ProfitShareLedger.create({
      userId: user._id,
      date: today,
      amount: profitAmount,
      percentage: percentage,
      balanceSnapshot: user.depositBalance,
      tier: "CUSTOM",
      credited: true,
      isCustom: true,
      createdBy: session.user.id,
    });

    // Update user's balance
    await User.findByIdAndUpdate(user._id, {
      $inc: { balance: profitAmount },
      $set: { lastProfitShareAt: new Date() },
    });

    // Create transaction record
    await Transaction.create({
      userId: user._id,
      type: "PROFIT_SHARE",
      amount: profitAmount,
      status: "COMPLETED",
      metadata: {
        description: `Custom profit share (${percentage}%) - Applied by admin`,
        previousBalance: user.balance,
        newBalance: user.balance + profitAmount,
        isCustom: true,
        appliedBy: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Custom profit share applied successfully",
      amount: profitAmount,
      percentage: percentage,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        depositBalance: user.depositBalance,
        newBalance: user.balance + profitAmount,
      },
      ledgerId: ledgerEntry._id,
    });
  } catch (error) {
    console.error("Custom profit share error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to apply custom profit share", details: errorMessage },
      { status: 500 }
    );
  }
}
