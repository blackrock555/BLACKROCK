import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/connect";
import { User, WithdrawalRequest } from "@/lib/db/models";
import {
  getNetworkFee,
  getTransactionLimits,
  isFeatureEnabled,
  getPlatformToggles,
} from "@/lib/services/settings-service";
import { notifyWithdrawalPending } from "@/lib/services/notification-service";
import { rateLimitAsync } from "@/lib/utils/rate-limiter";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting - 3 withdrawal requests per 15 minutes per user
    const rateLimitResult = await rateLimitAsync(`withdrawal:${session.user.id}`, {
      maxRequests: 3,
      windowMs: 15 * 60 * 1000, // 15 minutes
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many withdrawal requests. Please try again later." },
        { status: 429 }
      );
    }

    await connectDB();

    // Check if withdrawals are enabled
    const withdrawalsEnabled = await isFeatureEnabled("withdrawalsEnabled");
    if (!withdrawalsEnabled) {
      return NextResponse.json(
        { error: "Withdrawals are currently disabled" },
        { status: 403 }
      );
    }

    // Check KYC status
    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if KYC is required for withdrawal
    const platformToggles = await getPlatformToggles();
    if (platformToggles.kycRequiredForWithdrawal && user.kycStatus !== "APPROVED") {
      return NextResponse.json(
        { error: "KYC verification required for withdrawals" },
        { status: 403 }
      );
    }

    const { amount, network, address } = await request.json();

    // Get transaction limits from settings
    const limits = await getTransactionLimits();

    // Validate amount
    if (!amount || amount < limits.minWithdrawal) {
      return NextResponse.json(
        { error: `Minimum withdrawal is $${limits.minWithdrawal}` },
        { status: 400 }
      );
    }

    if (amount > limits.maxWithdrawal) {
      return NextResponse.json(
        { error: `Maximum withdrawal is $${limits.maxWithdrawal}` },
        { status: 400 }
      );
    }

    if (amount > user.balance) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // Validate network
    if (!["erc20", "trc20", "bep20"].includes(network)) {
      return NextResponse.json({ error: "Invalid network" }, { status: 400 });
    }

    // Validate address
    if (!address || address.length < 20) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    // Get network fee from settings
    const fee = await getNetworkFee(network);

    // Check for pending withdrawals
    const pendingWithdrawal = await WithdrawalRequest.findOne({
      userId: user._id,
      status: "PENDING",
    });

    if (pendingWithdrawal) {
      return NextResponse.json(
        { error: "You already have a pending withdrawal request" },
        { status: 400 }
      );
    }

    // Create withdrawal request (don't deduct balance yet - admin will do it on approval)
    const withdrawalRequest = await WithdrawalRequest.create({
      userId: user._id,
      amount,
      fee,
      netAmount: amount - fee,
      network: network.toUpperCase(),
      toAddress: address,
      status: "PENDING",
    });

    // Create notification for pending withdrawal
    await notifyWithdrawalPending(session.user.id, amount, network);

    return NextResponse.json({
      success: true,
      withdrawalId: withdrawalRequest._id,
      message: "Withdrawal request submitted successfully",
    });
  } catch (error) {
    console.error("Withdrawal error:", error);
    return NextResponse.json(
      { error: "Failed to process withdrawal request" },
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

    const withdrawals = await WithdrawalRequest.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await WithdrawalRequest.countDocuments(query);

    return NextResponse.json({
      withdrawals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get withdrawals error:", error);
    return NextResponse.json(
      { error: "Failed to fetch withdrawals" },
      { status: 500 }
    );
  }
}
