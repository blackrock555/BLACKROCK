"use client";

import { Card, CardHeader, CardBody } from "@/components/ui";
import { BalanceChart } from "@/components/charts";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface BalanceDataPoint {
  date: string;
  balance: number;
}

interface BalanceCardProps {
  balance: number;
  change: number;
  data: BalanceDataPoint[];
}

export function BalanceCard({ balance, change, data }: BalanceCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const isPositive = change >= 0;

  return (
    <Card>
      <CardHeader
        title="Total Balance"
        subtitle="Last 14 days performance"
        compact
        action={
          <div className="p-2 rounded-lg bg-brand-500/10">
            <Wallet className="w-4 h-4 text-brand-500" />
          </div>
        }
      />
      <CardBody compact>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-surface-900 dark:text-white tracking-tight block"
            >
              {formatCurrency(balance)}
            </motion.span>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 mt-1"
            >
              <motion.span
                whileHover={{ scale: 1.05 }}
                className={`
                  inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold cursor-default
                  ${isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}
                `}
              >
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isPositive ? "+" : ""}{change.toFixed(1)}%
              </motion.span>
              <span className="text-xs text-surface-400">vs last period</span>
            </motion.div>
          </div>
        </div>

        <BalanceChart data={data} height={200} />
      </CardBody>
    </Card>
  );
}
