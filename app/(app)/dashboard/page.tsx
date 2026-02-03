"use client";

import { Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  WelcomeCard,
  BalanceCard,
  GrowthCard,
  PerformanceCard,
  PortfolioStatsCard,
  RunningTradesCard,
  TradingStatsCard,
  MarketNewsCard,
  AdminSection,
  WeekendBanner,
} from "@/components/dashboard";
import dynamic from "next/dynamic";

// Dynamically import TradingView widget to avoid SSR issues
const TradingViewWidget = dynamic(
  () => import("@/components/charts/TradingViewWidget"),
  {
    ssr: false,
    loading: () => (
      <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1a1a1a] bg-[#111111]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/50 to-amber-600/50 animate-pulse" />
            <div className="space-y-2">
              <div className="h-5 w-24 bg-[#1a1a1a] rounded animate-pulse" />
              <div className="h-3 w-32 bg-[#1a1a1a] rounded animate-pulse" />
            </div>
          </div>
        </div>
        <div className="h-[400px] bg-[#0a0a0a] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            <span className="text-surface-500 text-sm">Loading chart...</span>
          </div>
        </div>
      </div>
    ),
  }
);
import { ToastContainer, Alert, Button, Card, CardBody } from "@/components/ui";
import { useTradeNotifications, useDashboardStats, formatBalanceChartData } from "@/hooks";
import { ArrowDownToLine, ArrowUpFromLine, ShieldCheck, RefreshCw, AlertCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { AdminView } from "@/lib/adminNavConfig";

// Skeleton components for loading state
function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <Card className={className}>
      <CardBody>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-1/3"></div>
          <div className="h-8 bg-surface-200 dark:bg-surface-700 rounded w-1/2"></div>
          <div className="h-24 bg-surface-200 dark:bg-surface-700 rounded"></div>
        </div>
      </CardBody>
    </Card>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-5">
      <div className="md:col-span-1 xl:col-span-4">
        <SkeletonCard className="h-full" />
      </div>
      <div className="md:col-span-1 xl:col-span-8">
        <SkeletonCard className="h-full" />
      </div>
      <div className="md:col-span-2 xl:col-span-8">
        <SkeletonCard className="h-full" />
      </div>
      <div className="md:col-span-2 xl:col-span-4">
        <SkeletonCard className="h-full" />
      </div>
      <div className="md:col-span-2 xl:col-span-12">
        <SkeletonCard className="h-[300px]" />
      </div>
    </div>
  );
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

interface WeekendBannerSettings {
  enabled: boolean;
  title: string;
  message: string;
}

interface PlatformSettings {
  weekendBanner?: WeekendBannerSettings;
  platformToggles?: {
    tradingViewChartEnabled?: boolean;
  };
}

function DashboardPageContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const userName = session?.user?.name || "User";
  const isAdmin = session?.user?.role === "ADMIN";
  const { stats, isLoading, error, refetch } = useDashboardStats();

  // Platform settings state
  const [weekendBanner, setWeekendBanner] = useState<WeekendBannerSettings | null>(null);
  const [tradingViewEnabled, setTradingViewEnabled] = useState<boolean>(true);

  // Fetch platform settings
  useEffect(() => {
    async function fetchPlatformSettings() {
      try {
        const response = await fetch("/api/settings/public");
        if (response.ok) {
          const data = await response.json();
          if (data.settings?.weekendBanner) {
            setWeekendBanner(data.settings.weekendBanner);
          }
          if (data.settings?.platformToggles) {
            setTradingViewEnabled(data.settings.platformToggles.tradingViewChartEnabled ?? true);
          }
        }
      } catch (error) {
        console.error("Failed to fetch platform settings:", error);
      }
    }
    fetchPlatformSettings();
  }, []);

  // Get admin view from query params
  const adminViewParam = searchParams.get('admin') as AdminView | null;

  const { notifications, removeNotification } = useTradeNotifications({
    minInterval: 5000,
    maxInterval: 20000,
    maxNotifications: 3,
  });

  // Transform stats to component props
  const currentBalance = stats?.balance ?? 0;
  const balanceChange = stats?.monthlyGrowth ?? 0;
  const balanceData = stats?.chartData ? formatBalanceChartData(stats.chartData) : [];

  const growthData = stats?.growthChartData?.length ? stats.growthChartData : [];
  const currentGrowth = stats?.monthlyGrowth ?? 0;

  const performanceStats = {
    totalDeposit: stats?.totalDeposits ?? 0,
    depositChange: 0,
    totalWithdrawal: stats?.totalWithdrawals ?? 0,
    withdrawalChange: 0,
    profitShare: stats?.totalProfitShare ?? 0,
    profitShareChange: 0,
    totalROI: stats?.roi ?? 0,
    roiChange: stats?.monthlyGrowth ?? 0,
  };

  const kycStatus = stats?.kycStatus || session?.user?.kycStatus || "NOT_SUBMITTED";

  // Handle back from admin view
  const handleBackFromAdmin = () => {
    router.push('/dashboard');
  };

  // If admin view is requested, show full-page admin section
  if (isAdmin && adminViewParam) {
    return (
      <div className="space-y-6">
        <AdminSection initialView={adminViewParam} onBack={handleBackFromAdmin} />

        {/* Toast Notifications */}
        <ToastContainer
          notifications={notifications}
          onClose={removeNotification}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
            Dashboard
            <Sparkles className="w-5 h-5 text-brand-500 dark:text-brand-400" />
          </h1>
          <p className="text-surface-600 dark:text-surface-400 mt-1">Welcome back, {userName}. Here's your portfolio overview.</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            icon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button href="/deposit" variant="secondary" icon={<ArrowDownToLine className="w-4 h-4" />}>
            Deposit
          </Button>
          <Button href="/withdraw" variant="primary" icon={<ArrowUpFromLine className="w-4 h-4" />}>
            Withdraw
          </Button>
        </div>
      </motion.div>

      {/* Weekend Banner */}
      {weekendBanner?.enabled && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <WeekendBanner title={weekendBanner.title} message={weekendBanner.message} />
        </motion.div>
      )}

      {/* Alerts Section */}
      <div className="space-y-3">
        {/* KYC Alert */}
        {kycStatus !== "APPROVED" && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Alert variant="warning" icon={<ShieldCheck className="w-5 h-5" />}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span>
                  Your account is not verified.{" "}
                  {kycStatus === "PENDING" ? "KYC is under review." : "Complete KYC to unlock all features."}
                </span>
                {kycStatus !== "PENDING" && (
                  <Link href="/settings?tab=kyc" className="text-amber-300 hover:text-amber-200 font-medium whitespace-nowrap">
                    Verify Now →
                  </Link>
                )}
              </div>
            </Alert>
          </motion.div>
        )}

        {/* Pending Requests Alert */}
        {(stats?.pendingDeposits ?? 0) > 0 || (stats?.pendingWithdrawals ?? 0) > 0 ? (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Alert variant="info" icon={<AlertCircle className="w-5 h-5" />}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span>
                  You have {stats?.pendingDeposits ?? 0} pending deposit(s) and {stats?.pendingWithdrawals ?? 0} pending withdrawal(s).
                </span>
                <Link href="/transactions" className="text-blue-300 hover:text-blue-200 font-medium whitespace-nowrap">
                  View Transactions →
                </Link>
              </div>
            </Alert>
          </motion.div>
        ) : null}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Alert variant="error" icon={<AlertCircle className="w-5 h-5" />}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span>Failed to load dashboard data: {error}</span>
                <button
                  onClick={() => refetch()}
                  className="text-red-300 hover:text-red-200 font-medium whitespace-nowrap"
                >
                  Try Again →
                </button>
              </div>
            </Alert>
          </motion.div>
        )}
      </div>

      {/* Dashboard Grid */}
      {isLoading && !stats ? (
        <DashboardSkeleton />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-5"
        >
          {/* Row 1: Welcome + Balance */}
          <motion.div variants={itemVariants} className="md:col-span-1 xl:col-span-4">
            <WelcomeCard userName={userName} />
          </motion.div>

          <motion.div variants={itemVariants} className="md:col-span-1 xl:col-span-8">
            <BalanceCard
              balance={currentBalance}
              change={balanceChange}
              data={balanceData.length > 0 ? balanceData : generateEmptyChartData()}
            />
          </motion.div>

          {/* Row 2: Portfolio Summary Stats */}
          <motion.div variants={itemVariants} className="md:col-span-2 xl:col-span-12">
            <PortfolioStatsCard
              totalDeposits={stats?.totalDeposits ?? 0}
              totalWithdrawals={stats?.totalWithdrawals ?? 0}
              totalProfit={stats?.totalProfitShare ?? 0}
              roi={stats?.roi ?? 0}
            />
          </motion.div>

          {/* Row 3: Monthly Growth Chart */}
          <motion.div variants={itemVariants} className="md:col-span-2 xl:col-span-12">
            <GrowthCard
              currentGrowth={currentGrowth}
              data={growthData.length > 0 ? growthData : generateEmptyGrowthData()}
            />
          </motion.div>

          {/* Row 3: Real-Time XAUUSD TradingView Chart (Conditional) */}
          {tradingViewEnabled && (
            <motion.div variants={itemVariants} className="md:col-span-2 xl:col-span-12">
              <TradingViewWidget symbol="OANDA:XAUUSD" height={450} />
            </motion.div>
          )}

          {/* Row 4: Performance Stats */}
          <motion.div variants={itemVariants} className="md:col-span-2 xl:col-span-12">
            <TradingStatsCard />
          </motion.div>

          {/* Row 5: Running Positions */}
          <motion.div variants={itemVariants} className="md:col-span-2 xl:col-span-12">
            <RunningTradesCard />
          </motion.div>

          {/* Row 6: Market News */}
          <motion.div variants={itemVariants} className="md:col-span-2 xl:col-span-12">
            <MarketNewsCard />
          </motion.div>
        </motion.div>
      )}

      {/* Toast Notifications */}
      <ToastContainer
        notifications={notifications}
        onClose={removeNotification}
      />
    </div>
  );
}

// Helper functions
function generateEmptyChartData(): { date: string; balance: number }[] {
  const data = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      balance: 0,
    });
  }
  return data;
}

function generateEmptyGrowthData(): { month: string; growth: number }[] {
  const months = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"];
  return months.map((month) => ({ month, growth: 0 }));
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardPageContent />
    </Suspense>
  );
}
