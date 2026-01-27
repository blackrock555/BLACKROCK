"use client";

import { Card, CardHeader, CardBody } from "@/components/ui";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, ArrowDownToLine, ArrowUpFromLine, DollarSign, Percent } from "lucide-react";

interface PerformanceStats {
  totalDeposit: number;
  depositChange: number;
  totalWithdrawal: number;
  withdrawalChange: number;
  profitShare: number;
  profitShareChange: number;
  totalROI: number;
  roiChange: number;
}

interface PerformanceCardProps {
  stats: PerformanceStats;
}

interface StatBlockProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  change: number;
  prefix?: string;
  suffix?: string;
  index: number;
}

function StatBlock({ icon, iconBg, label, value, change, prefix = "", suffix = "", index }: StatBlockProps) {
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      whileHover={{
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className="p-4 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-100 dark:border-surface-700/50 cursor-default group"
    >
      <div className="flex items-center gap-2 mb-3">
        <motion.div
          className={`p-1.5 rounded-lg ${iconBg} transition-transform duration-200 group-hover:scale-110`}
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.4 }}
        >
          {icon}
        </motion.div>
        <span className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-lg font-semibold text-surface-900 dark:text-white">
          {prefix}{value}{suffix}
        </span>
        <motion.span
          className={`
            inline-flex items-center gap-0.5 text-xs font-medium
            ${isPositive ? "text-emerald-500" : "text-red-500"}
          `}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1 + 0.2 }}
        >
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(change)}%
        </motion.span>
      </div>
    </motion.div>
  );
}

export function PerformanceCard({ stats }: PerformanceCardProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(2);
  };

  return (
    <Card>
      <CardHeader
        title="Performance Summary"
        subtitle="Key metrics overview"
        compact
      />
      <CardBody compact>
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          <StatBlock
            icon={<ArrowDownToLine className="w-4 h-4 text-blue-500" />}
            iconBg="bg-blue-500/10"
            label="Deposit"
            value={formatCurrency(stats.totalDeposit)}
            change={stats.depositChange}
            prefix="$"
            index={0}
          />
          <StatBlock
            icon={<ArrowUpFromLine className="w-4 h-4 text-orange-500" />}
            iconBg="bg-orange-500/10"
            label="Withdrawal"
            value={formatCurrency(stats.totalWithdrawal)}
            change={stats.withdrawalChange}
            prefix="$"
            index={1}
          />
          <StatBlock
            icon={<DollarSign className="w-4 h-4 text-emerald-500" />}
            iconBg="bg-emerald-500/10"
            label="Profit Share"
            value={formatCurrency(stats.profitShare)}
            change={stats.profitShareChange}
            prefix="$"
            index={2}
          />
          <StatBlock
            icon={<Percent className="w-4 h-4 text-purple-500" />}
            iconBg="bg-purple-500/10"
            label="Total ROI"
            value={stats.totalROI.toFixed(1)}
            change={stats.roiChange}
            suffix="%"
            index={3}
          />
        </div>
      </CardBody>
    </Card>
  );
}
