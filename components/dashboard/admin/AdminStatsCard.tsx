"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, Badge, Skeleton } from "@/components/ui";
import {
  DollarSign,
  Users,
  ArrowDownToLine,
  ArrowUpFromLine,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

interface AdminStats {
  totalDeposits: number;
  totalWithdrawals: number;
  totalUsers: number;
  verifiedUsers: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  pendingKYC: number;
  totalProfitShared: number;
}

interface AdminStatsCardProps {
  stats: AdminStats | null;
  isLoading: boolean;
}

export function AdminStatsCard({ stats, isLoading }: AdminStatsCardProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  const statItems = [
    {
      label: "Total Deposits",
      value: `$${(stats?.totalDeposits || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "green",
    },
    {
      label: "Total Withdrawals",
      value: `$${(stats?.totalWithdrawals || 0).toLocaleString()}`,
      icon: ArrowUpFromLine,
      color: "red",
    },
    {
      label: "Total Users",
      value: stats?.totalUsers || 0,
      subtext: `${stats?.verifiedUsers || 0} verified`,
      icon: Users,
      color: "brand",
    },
    {
      label: "Profit Shared",
      value: `$${(stats?.totalProfitShared || 0).toLocaleString()}`,
      icon: TrendingUp,
      color: "purple",
    },
  ];

  const colorClasses: Record<string, { bg: string; text: string }> = {
    green: { bg: "bg-emerald-500/10 dark:bg-emerald-500/20", text: "text-emerald-500 dark:text-emerald-400" },
    red: { bg: "bg-red-500/10 dark:bg-red-500/20", text: "text-red-500 dark:text-red-400" },
    brand: { bg: "bg-brand-500/10 dark:bg-brand-500/20", text: "text-brand-500 dark:text-brand-400" },
    purple: { bg: "bg-purple-500/10 dark:bg-purple-500/20", text: "text-purple-500 dark:text-purple-400" },
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((item) => (
        <Card key={item.label}>
          <CardBody compact>
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg ${colorClasses[item.color].bg}`}>
                <item.icon className={`w-5 h-5 ${colorClasses[item.color].text}`} />
              </div>
              <span className="text-surface-500 dark:text-surface-400 text-sm">
                {item.label}
              </span>
            </div>
            <p className="text-2xl font-bold text-surface-900 dark:text-white">
              {item.value}
            </p>
            {item.subtext && (
              <p className="text-surface-500 text-sm mt-1">{item.subtext}</p>
            )}
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
