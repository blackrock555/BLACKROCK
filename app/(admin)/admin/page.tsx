"use client";

import { useState, useEffect } from "react";
import { Badge, Button, Skeleton } from "@/components/ui";
import Link from "next/link";
import {
  DollarSign,
  Users,
  ArrowDownToLine,
  ArrowUpFromLine,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
} from "lucide-react";

interface DashboardStats {
  totalDeposits: number;
  totalWithdrawals: number;
  totalUsers: number;
  verifiedUsers: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  pendingKYC: number;
  totalProfitShared: number;
}

interface RecentActivity {
  _id: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "KYC" | "PROFIT_SHARE";
  description: string;
  amount?: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/admin/dashboard");
        const data = await response.json();

        if (response.ok) {
          setStats(data.stats);
          setRecentActivity(data.recentActivity || []);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-surface-400 mt-1">
          Overview of platform activity and pending actions
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))
        ) : (
          <>
            <div className="bg-surface-900 border border-surface-800 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-green-500/20">
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
                <span className="text-surface-400 text-sm">Total Deposits</span>
              </div>
              <p className="text-2xl font-bold text-white">
                ${(stats?.totalDeposits || 0).toLocaleString()}
              </p>
            </div>

            <div className="bg-surface-900 border border-surface-800 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <ArrowUpFromLine className="w-5 h-5 text-red-400" />
                </div>
                <span className="text-surface-400 text-sm">Total Withdrawals</span>
              </div>
              <p className="text-2xl font-bold text-white">
                ${(stats?.totalWithdrawals || 0).toLocaleString()}
              </p>
            </div>

            <div className="bg-surface-900 border border-surface-800 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-brand-500/20">
                  <Users className="w-5 h-5 text-brand-400" />
                </div>
                <span className="text-surface-400 text-sm">Total Users</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {stats?.totalUsers || 0}
              </p>
              <p className="text-surface-500 text-sm">
                {stats?.verifiedUsers || 0} verified
              </p>
            </div>

            <div className="bg-surface-900 border border-surface-800 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-surface-400 text-sm">Profit Shared</span>
              </div>
              <p className="text-2xl font-bold text-white">
                ${(stats?.totalProfitShared || 0).toLocaleString()}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Pending Queues */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))
        ) : (
          <>
            <Link
              href="/admin/deposits"
              className="bg-surface-900 border border-surface-800 rounded-xl p-5 hover:border-surface-700 transition-colors group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20">
                    <ArrowDownToLine className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="text-white font-medium">Pending Deposits</span>
                </div>
                <ArrowRight className="w-5 h-5 text-surface-500 group-hover:text-white transition-colors" />
              </div>
              <p className="text-4xl font-bold text-white mb-1">
                {stats?.pendingDeposits || 0}
              </p>
              <p className="text-surface-500 text-sm">Awaiting approval</p>
            </Link>

            <Link
              href="/admin/withdrawals"
              className="bg-surface-900 border border-surface-800 rounded-xl p-5 hover:border-surface-700 transition-colors group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20">
                    <ArrowUpFromLine className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="text-white font-medium">Pending Withdrawals</span>
                </div>
                <ArrowRight className="w-5 h-5 text-surface-500 group-hover:text-white transition-colors" />
              </div>
              <p className="text-4xl font-bold text-white mb-1">
                {stats?.pendingWithdrawals || 0}
              </p>
              <p className="text-surface-500 text-sm">Awaiting processing</p>
            </Link>

            <Link
              href="/admin/kyc"
              className="bg-surface-900 border border-surface-800 rounded-xl p-5 hover:border-surface-700 transition-colors group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20">
                    <ShieldCheck className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="text-white font-medium">Pending KYC</span>
                </div>
                <ArrowRight className="w-5 h-5 text-surface-500 group-hover:text-white transition-colors" />
              </div>
              <p className="text-4xl font-bold text-white mb-1">
                {stats?.pendingKYC || 0}
              </p>
              <p className="text-surface-500 text-sm">Awaiting review</p>
            </Link>
          </>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-surface-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          <Link
            href="/admin/audit-logs"
            className="text-brand-400 hover:text-brand-300 text-sm font-medium"
          >
            View All
          </Link>
        </div>
        {isLoading ? (
          <div className="p-5 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : recentActivity.length === 0 ? (
          <div className="p-8 text-center text-surface-500">
            No recent activity
          </div>
        ) : (
          <div className="divide-y divide-surface-800">
            {recentActivity.map((activity) => (
              <div
                key={activity._id}
                className="p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-lg ${
                      activity.type === "DEPOSIT"
                        ? "bg-green-500/20"
                        : activity.type === "WITHDRAWAL"
                        ? "bg-red-500/20"
                        : activity.type === "KYC"
                        ? "bg-blue-500/20"
                        : "bg-purple-500/20"
                    }`}
                  >
                    {activity.type === "DEPOSIT" ? (
                      <ArrowDownToLine
                        className={`w-4 h-4 ${
                          activity.type === "DEPOSIT"
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      />
                    ) : activity.type === "WITHDRAWAL" ? (
                      <ArrowUpFromLine className="w-4 h-4 text-red-400" />
                    ) : activity.type === "KYC" ? (
                      <ShieldCheck className="w-4 h-4 text-blue-400" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-purple-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {activity.description}
                    </p>
                    <p className="text-surface-500 text-sm">
                      {formatDate(activity.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {activity.amount && (
                    <span className="text-white font-medium">
                      ${activity.amount.toLocaleString()}
                    </span>
                  )}
                  <Badge
                    variant={
                      activity.status === "APPROVED"
                        ? "success"
                        : activity.status === "PENDING"
                        ? "warning"
                        : "danger"
                    }
                  >
                    {activity.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
