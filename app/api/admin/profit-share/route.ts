import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/connect";
import { ProfitShareLedger, User } from "@/lib/db/models";
import { getProfitTiers } from "@/lib/services/settings-service";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get query parameters with pagination limits to prevent DoS
    const { searchParams } = new URL(request.url);
    const requestedPage = parseInt(searchParams.get("page") || "1");
    const page = Math.max(1, requestedPage);
    const requestedLimit = parseInt(searchParams.get("limit") || "20");
    const limit = Math.min(Math.max(1, requestedLimit), 100); // Max 100 per page
    const status = searchParams.get("status");
    const skip = (page - 1) * limit;

    // Build query
    const query: Record<string, unknown> = {};
    if (status && status !== "all") {
      query.status = status;
    }

    // Get paginated profit shares
    const [profitShares, totalCount] = await Promise.all([
      ProfitShareLedger.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email")
        .lean(),
      ProfitShareLedger.countDocuments(query),
    ]);

    // Get aggregate stats
    const [
      totalDistributedResult,
      pendingResult,
      uniqueRecipientsResult,
    ] = await Promise.all([
      // Total distributed amount
      ProfitShareLedger.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      // Pending distributions (if you have status field)
      ProfitShareLedger.countDocuments({ status: "PENDING" }),
      // Unique recipients
      ProfitShareLedger.distinct("userId"),
    ]);

    const totalDistributed = totalDistributedResult[0]?.total || 0;
    const totalRecords = totalDistributedResult[0]?.count || 0;
    const totalRecipients = uniqueRecipientsResult?.length || 0;
    const averageShare = totalRecords > 0 ? totalDistributed / totalRecords : 0;

    // Calculate today's estimated profit (if run now)
    // Get all eligible users (active, with deposit balance > 0)
    const eligibleUsers = await User.find({
      status: "ACTIVE",
      depositBalance: { $gt: 0 },
    }).select("depositBalance").lean();

    // Get profit tiers
    const profitTiers = await getProfitTiers();

    // Calculate estimated profit for each user based on their tier
    let todayEstimatedProfit = 0;
    let eligibleUserCount = 0;

    for (const user of eligibleUsers) {
      const depositBalance = user.depositBalance || 0;
      // Find applicable tier
      const tier = profitTiers.find(
        (t) => depositBalance >= t.minAmount && depositBalance <= t.maxAmount
      ) || profitTiers[0];

      if (tier) {
        const profit = (depositBalance * tier.dailyRate) / 100;
        todayEstimatedProfit += profit;
        eligibleUserCount++;
      }
    }
    todayEstimatedProfit = Math.round(todayEstimatedProfit * 100) / 100;

    // Get last run time
    const lastLog = await ProfitShareLedger.findOne()
      .sort({ createdAt: -1 })
      .lean();

    // Transform logs to match expected format
    const transformedProfitShares = profitShares.map((log: any) => ({
      _id: log._id,
      userId: log.userId,
      amount: log.amount || 0,
      percentage: log.percentage || 0,
      investmentAmount: log.balanceSnapshot || log.investmentAmount || 0,
      status: log.status || "APPROVED",
      createdAt: log.createdAt,
      processedAt: log.processedAt || log.createdAt,
    }));

    return NextResponse.json({
      profitShares: transformedProfitShares,
      stats: {
        totalDistributed,
        pendingDistributions: pendingResult || 0,
        totalRecipients,
        averageShare,
        lastRunAt: lastLog?.createdAt || null,
        isEnabled: true,
        // Today's estimated profit
        todayEstimatedProfit,
        eligibleUserCount,
      },
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
      // Also include logs for backward compatibility
      logs: profitShares,
    });
  } catch (error) {
    console.error("Get profit share error:", error);
    return NextResponse.json(
      { error: "Failed to fetch profit share data" },
      { status: 500 }
    );
  }
}
