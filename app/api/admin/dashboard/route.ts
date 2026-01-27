import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/connect";
import {
  User,
  DepositRequest,
  WithdrawalRequest,
  KYCRequest,
  Transaction,
  ProfitShareLedger,
} from "@/lib/db/models";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get aggregated stats
    const [
      totalDepositsResult,
      totalWithdrawalsResult,
      totalUsers,
      verifiedUsers,
      pendingDeposits,
      pendingWithdrawals,
      pendingKYC,
      totalProfitSharedResult,
    ] = await Promise.all([
      DepositRequest.aggregate([
        { $match: { status: "APPROVED" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      WithdrawalRequest.aggregate([
        { $match: { status: "APPROVED" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      User.countDocuments({ role: "USER" }),
      User.countDocuments({ role: "USER", kycStatus: "APPROVED" }),
      DepositRequest.countDocuments({ status: "PENDING" }),
      WithdrawalRequest.countDocuments({ status: "PENDING" }),
      KYCRequest.countDocuments({ status: "PENDING" }),
      ProfitShareLedger.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    // Get recent activity
    const recentDeposits = await DepositRequest.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "name email")
      .lean();

    const recentWithdrawals = await WithdrawalRequest.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "name email")
      .lean();

    const recentKYC = await KYCRequest.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "name email")
      .lean();

    // Combine and sort recent activity
    const recentActivity = [
      ...recentDeposits.map((d: any) => ({
        _id: d._id,
        type: "DEPOSIT" as const,
        description: `Deposit request from ${d.userId?.name || "Unknown"}`,
        amount: d.amount,
        status: d.status,
        createdAt: d.createdAt,
      })),
      ...recentWithdrawals.map((w: any) => ({
        _id: w._id,
        type: "WITHDRAWAL" as const,
        description: `Withdrawal request from ${w.userId?.name || "Unknown"}`,
        amount: w.amount,
        status: w.status,
        createdAt: w.createdAt,
      })),
      ...recentKYC.map((k: any) => ({
        _id: k._id,
        type: "KYC" as const,
        description: `KYC submission from ${k.userId?.name || "Unknown"}`,
        status: k.status,
        createdAt: k.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    return NextResponse.json({
      stats: {
        totalDeposits: totalDepositsResult[0]?.total || 0,
        totalWithdrawals: totalWithdrawalsResult[0]?.total || 0,
        totalUsers,
        verifiedUsers,
        pendingDeposits,
        pendingWithdrawals,
        pendingKYC,
        totalProfitShared: totalProfitSharedResult[0]?.total || 0,
      },
      recentActivity,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
