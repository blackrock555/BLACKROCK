import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { connectDB } from '@/lib/db/connect';
import { User, Transaction, DepositRequest, WithdrawalRequest, KYCRequest, ProfitShareLedger } from '@/lib/db/models';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Total users
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ emailVerified: { $ne: null } });
    const kycApprovedUsers = await User.countDocuments({ kycStatus: 'APPROVED' });

    // Deposit stats
    const depositStats = await DepositRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);

    const depositsByStatus = depositStats.reduce((acc, item) => {
      acc[item._id] = { count: item.count, total: item.total };
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    const totalApprovedDeposits = depositsByStatus['APPROVED']?.total || 0;
    const pendingDepositsCount = depositsByStatus['PENDING']?.count || 0;
    const pendingDepositsAmount = depositsByStatus['PENDING']?.total || 0;

    // Withdrawal stats
    const withdrawalStats = await WithdrawalRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$amount' }
        }
      }
    ]);

    const withdrawalsByStatus = withdrawalStats.reduce((acc, item) => {
      acc[item._id] = { count: item.count, total: item.total };
      return acc;
    }, {} as Record<string, { count: number; total: number }>);

    const totalApprovedWithdrawals = withdrawalsByStatus['APPROVED']?.total || 0;
    const pendingWithdrawalsCount = withdrawalsByStatus['PENDING']?.count || 0;
    const pendingWithdrawalsAmount = withdrawalsByStatus['PENDING']?.total || 0;

    // KYC stats
    const kycStats = await KYCRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const kycByStatus = kycStats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as Record<string, number>);

    const pendingKYC = kycByStatus['PENDING'] || 0;

    // Total profit distributed
    const profitStats = await ProfitShareLedger.aggregate([
      { $match: { credited: true } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalProfitDistributed = profitStats[0]?.total || 0;

    // Total user balances (platform liability)
    const balanceStats = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$balance' } } }
    ]);
    const totalUserBalances = balanceStats[0]?.total || 0;

    // Platform metrics
    const platformDeposits = totalApprovedDeposits;
    const platformWithdrawals = totalApprovedWithdrawals;
    const platformProfit = platformDeposits - platformWithdrawals - totalUserBalances;

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentDeposits = await DepositRequest.countDocuments({
      status: 'APPROVED',
      processedAt: { $gte: sevenDaysAgo }
    });

    const recentWithdrawals = await WithdrawalRequest.countDocuments({
      status: 'APPROVED',
      processedAt: { $gte: sevenDaysAgo }
    });

    const newUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Daily volume for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyVolume = await Transaction.aggregate([
      {
        $match: {
          status: 'COMPLETED',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          deposits: {
            $sum: { $cond: [{ $eq: ['$type', 'DEPOSIT'] }, '$amount', 0] }
          },
          withdrawals: {
            $sum: { $cond: [{ $eq: ['$type', 'WITHDRAWAL'] }, '$amount', 0] }
          },
          profits: {
            $sum: { $cond: [{ $eq: ['$type', 'PROFIT_SHARE'] }, '$amount', 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Pending items for admin action
    const pendingItems = {
      deposits: pendingDepositsCount,
      withdrawals: pendingWithdrawalsCount,
      kyc: pendingKYC
    };

    return NextResponse.json({
      users: {
        total: totalUsers,
        verified: verifiedUsers,
        kycApproved: kycApprovedUsers,
        newThisWeek: newUsers
      },
      deposits: {
        totalApproved: totalApprovedDeposits,
        pendingCount: pendingDepositsCount,
        pendingAmount: pendingDepositsAmount,
        recentCount: recentDeposits
      },
      withdrawals: {
        totalApproved: totalApprovedWithdrawals,
        pendingCount: pendingWithdrawalsCount,
        pendingAmount: pendingWithdrawalsAmount,
        recentCount: recentWithdrawals
      },
      profits: {
        totalDistributed: totalProfitDistributed
      },
      platform: {
        totalUserBalances,
        netDeposits: platformDeposits - platformWithdrawals,
        platformProfit
      },
      kyc: {
        pending: pendingKYC,
        approved: kycByStatus['APPROVED'] || 0,
        rejected: kycByStatus['REJECTED'] || 0
      },
      pendingItems,
      dailyVolume,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    );
  }
}
