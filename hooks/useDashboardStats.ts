"use client";

import { useState, useEffect, useCallback } from "react";

export interface GrowthDataPoint {
  month: string;
  growth: number;
  profit: number;
}

export interface DashboardStats {
  balance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalProfitShare: number;
  totalReferralRewards: number;
  netInvested: number;
  totalEarnings: number;
  roi: number;
  monthlyGrowth: number;
  referralCount: number;
  depositCount: number;
  withdrawalCount: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  kycStatus: string;
  recentTransactions: Transaction[];
  chartData: ChartDataPoint[];
  growthChartData: GrowthDataPoint[];
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  type: string;
  amount: number;
  status: string;
  createdAt: string;
  description?: string;
}

export interface ChartDataPoint {
  date: string;
  balance: number;
  deposits: number;
  withdrawals: number;
}

interface UseDashboardStatsReturn {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useDashboardStats(): UseDashboardStatsReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/dashboard/stats", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch dashboard stats");
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    // Refresh stats every 60 seconds
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
}

// Helper function to format chart data for the balance chart
export function formatBalanceChartData(
  chartData: ChartDataPoint[]
): { date: string; balance: number }[] {
  return chartData.map((point) => ({
    date: formatDate(point.date),
    balance: point.balance,
  }));
}

// Helper function to format date string
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Generate growth data from chart data (calculate monthly growth)
export function calculateGrowthData(
  chartData: ChartDataPoint[]
): { month: string; growth: number }[] {
  if (chartData.length === 0) return [];

  // Group by month and calculate growth
  const monthlyData: { [key: string]: { start: number; end: number } } = {};

  chartData.forEach((point) => {
    const date = new Date(point.date);
    const monthKey = date.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
    });

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { start: point.balance, end: point.balance };
    } else {
      monthlyData[monthKey].end = point.balance;
    }
  });

  return Object.entries(monthlyData)
    .slice(-6)
    .map(([month, data]) => ({
      month: month.split(" ")[0], // Just the month name
      growth:
        data.start > 0
          ? ((data.end - data.start) / data.start) * 100
          : 0,
    }));
}
