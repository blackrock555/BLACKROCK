import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/connect";
import { User, ProfitShareLedger, Transaction } from "@/lib/db/models";
import { getProfitTierForBalance, isFeatureEnabled } from "@/lib/services/settings-service";
import { notifyProfitShare } from "@/lib/services/notification-service";

// Only POST method allowed for cron jobs (security best practice)
export async function POST(request: NextRequest) {
  return handleProfitShare(request);
}

// GET method not allowed - return 405
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST." },
    { status: 405 }
  );
}

async function handleProfitShare(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    const vercelCron = request.headers.get("x-vercel-cron");

    // Check for admin session (for manual trigger from admin panel)
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "ADMIN";

    // Allow if: admin user, valid cron secret, or Vercel cron
    // Note: "manual-trigger" bypass removed for security
    const isAuthorized =
      isAdmin ||
      vercelCron ||
      (cronSecret && authHeader === `Bearer ${cronSecret}`);

    if (!isAuthorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Check if profit sharing is enabled
    const profitSharingEnabled = await isFeatureEnabled("profitSharingEnabled");
    if (!profitSharingEnabled) {
      return NextResponse.json({
        success: false,
        message: "Profit sharing is currently disabled",
        usersProcessed: 0,
        totalAmount: 0,
      });
    }

    // Get today's date (UTC midnight)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    // Find all active users with deposit balance > 0
    const eligibleUsers = await User.find({
      role: "USER",
      status: "ACTIVE",
      depositBalance: { $gt: 0 },
    }).lean();

    let usersProcessed = 0;
    let totalAmount = 0;
    const results = [];

    for (const user of eligibleUsers) {
      // Check if user already received profit today (prevent double credit)
      const existingEntry = await ProfitShareLedger.findOne({
        userId: user._id,
        date: today,
      });

      if (existingEntry) {
        continue; // Skip - already processed today
      }

      // Calculate profit based on tier from settings service
      const tier = await getProfitTierForBalance(user.depositBalance);
      const profitAmount = (user.depositBalance * tier.dailyRate) / 100;

      // Create ledger entry
      await ProfitShareLedger.create({
        userId: user._id,
        date: today,
        amount: profitAmount,
        percentage: tier.dailyRate,
        balanceSnapshot: user.depositBalance,
        tier: tier.tier,
        credited: true,
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
          description: `Daily profit share - ${tier.name} (${tier.dailyRate}%)`,
          previousBalance: user.balance,
          newBalance: user.balance + profitAmount,
        },
      });

      // Create in-app notification for profit share
      try {
        await notifyProfitShare(user._id.toString(), profitAmount, tier.dailyRate);
      } catch (notifyError) {
        console.error("Notification error (non-blocking):", notifyError);
      }

      usersProcessed++;
      totalAmount += profitAmount;
      results.push({
        userId: user._id,
        amount: profitAmount,
        tier: tier.tier,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Profit share completed",
      usersProcessed,
      totalAmount,
      date: today,
      results,
    });
  } catch (error) {
    // Log error internally but don't expose details
    console.error("Profit share error occurred");
    return NextResponse.json(
      { error: "Failed to run profit share. Please check logs." },
      { status: 500 }
    );
  }
}
