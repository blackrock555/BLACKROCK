import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { connectDB } from '@/lib/db/connect';
import { User, Transaction, DepositRequest, WithdrawalRequest, ProfitShareLedger, ReferralReward } from '@/lib/db/models';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const userId = new mongoose.Types.ObjectId(session.user.id);

    // Get user data with balance
    const user = await User.findById(userId).lean();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate total approved deposits
    const depositsAgg = await DepositRequest.aggregate([
      { $match: { userId, status: 'APPROVED' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);
    const totalDeposits = depositsAgg[0]?.total || 0;
    const depositCount = depositsAgg[0]?.count || 0;

    // Calculate total approved withdrawals
    const withdrawalsAgg = await WithdrawalRequest.aggregate([
      { $match: { userId, status: 'APPROVED' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]);
    const totalWithdrawals = withdrawalsAgg[0]?.total || 0;
    const withdrawalCount = withdrawalsAgg[0]?.count || 0;

    // Calculate total profit share credited
    const profitAgg = await ProfitShareLedger.aggregate([
      { $match: { userId, credited: true } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalProfitShare = profitAgg[0]?.total || 0;

    // Calculate referral rewards earned
    const referralAgg = await ReferralReward.aggregate([
      { $match: { userId, status: 'CREDITED' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalReferralRewards = referralAgg[0]?.total || 0;

    // Get referral count
    const referralCount = await User.countDocuments({ referredBy: userId });

    // Calculate ROI
    const netInvested = totalDeposits - totalWithdrawals;
    const totalEarnings = totalProfitShare + totalReferralRewards;
    const roi = netInvested > 0 ? ((totalEarnings / netInvested) * 100) : 0;

    // Get recent transactions (last 10)
    const recentTransactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get balance history for chart (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const balanceHistory = await Transaction.aggregate([
      {
        $match: {
          userId,
          status: 'COMPLETED',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          deposits: {
            $sum: {
              $cond: [{ $in: ['$type', ['DEPOSIT', 'PROFIT_SHARE', 'REFERRAL_REWARD']] }, '$amount', 0]
            }
          },
          withdrawals: {
            $sum: {
              $cond: [{ $eq: ['$type', 'WITHDRAWAL'] }, '$amount', 0]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Calculate cumulative balance for each day
    let cumulativeBalance = user.balance - balanceHistory.reduce((acc, day) => acc + day.deposits - day.withdrawals, 0);
    const chartData = balanceHistory.map(day => {
      cumulativeBalance += day.deposits - day.withdrawals;
      return {
        date: day._id,
        balance: Math.max(0, cumulativeBalance),
        deposits: day.deposits,
        withdrawals: day.withdrawals
      };
    });

    // Get pending requests counts
    const pendingDeposits = await DepositRequest.countDocuments({ userId, status: 'PENDING' });
    const pendingWithdrawals = await WithdrawalRequest.countDocuments({ userId, status: 'PENDING' });

    // Monthly growth calculation (compare this month vs last month)
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    thisMonthStart.setHours(0, 0, 0, 0);

    const lastMonthStart = new Date(thisMonthStart);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);

    const thisMonthProfit = await ProfitShareLedger.aggregate([
      { $match: { userId, credited: true, date: { $gte: thisMonthStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const lastMonthProfit = await ProfitShareLedger.aggregate([
      { $match: { userId, credited: true, date: { $gte: lastMonthStart, $lt: thisMonthStart } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const thisMonthTotal = thisMonthProfit[0]?.total || 0;
    const lastMonthTotal = lastMonthProfit[0]?.total || 0;
    const monthlyGrowth = lastMonthTotal > 0 ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

    // Get 6-month growth chart data with monthly ROI
    const monthlyGrowthResults = [];

    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);

      const monthName = monthStart.toLocaleDateString('en-US', { month: 'short' });

      // Get profit for this month
      const monthProfit = await ProfitShareLedger.aggregate([
        {
          $match: {
            userId,
            credited: true,
            date: { $gte: monthStart, $lt: monthEnd }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      // Get deposits for this month to calculate ROI
      const monthDeposits = await DepositRequest.aggregate([
        {
          $match: {
            userId,
            status: 'APPROVED',
            updatedAt: { $gte: monthStart, $lt: monthEnd }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const profit = monthProfit[0]?.total || 0;
      const deposits = monthDeposits[0]?.total || 0;

      // Calculate monthly ROI percentage
      // If there are deposits this month, calculate ROI based on deposits
      // Otherwise, calculate based on total invested amount
      let monthlyROI = 0;
      if (netInvested > 0) {
        monthlyROI = (profit / netInvested) * 100;
      } else if (deposits > 0) {
        monthlyROI = (profit / deposits) * 100;
      }

      monthlyGrowthResults.push({
        month: monthName,
        growth: parseFloat(monthlyROI.toFixed(2)),
        profit: profit
      });
    }

    const filledGrowthData = monthlyGrowthResults;

    return NextResponse.json({
      balance: user.balance || 0,
      totalDeposits,
      totalWithdrawals,
      totalProfitShare,
      totalReferralRewards,
      netInvested,
      totalEarnings,
      roi: parseFloat(roi.toFixed(2)),
      monthlyGrowth: parseFloat(monthlyGrowth.toFixed(2)),
      referralCount,
      depositCount,
      withdrawalCount,
      pendingDeposits,
      pendingWithdrawals,
      kycStatus: user.kycStatus,
      recentTransactions,
      chartData,
      growthChartData: filledGrowthData,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
