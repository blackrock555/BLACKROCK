"use client";

import { motion } from "framer-motion";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  DollarSign,
  TrendingUp,
  Wallet,
} from "lucide-react";

interface PortfolioStatsCardProps {
  totalDeposits: number;
  totalWithdrawals: number;
  totalProfit: number;
  roi: number;
}

export function PortfolioStatsCard({
  totalDeposits,
  totalWithdrawals,
  totalProfit,
  roi,
}: PortfolioStatsCardProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const stats = [
    {
      label: "Total Deposits",
      value: formatCurrency(totalDeposits),
      icon: ArrowDownToLine,
      gradient: "from-blue-500 to-blue-600",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-400",
      glowColor: "group-hover:shadow-blue-500/20",
    },
    {
      label: "Total Withdrawals",
      value: formatCurrency(totalWithdrawals),
      icon: ArrowUpFromLine,
      gradient: "from-orange-500 to-orange-600",
      iconBg: "bg-orange-500/10",
      iconColor: "text-orange-400",
      glowColor: "group-hover:shadow-orange-500/20",
    },
    {
      label: "Total Profit",
      value: formatCurrency(totalProfit),
      icon: DollarSign,
      gradient: totalProfit >= 0 ? "from-emerald-500 to-emerald-600" : "from-red-500 to-red-600",
      iconBg: totalProfit >= 0 ? "bg-emerald-500/10" : "bg-red-500/10",
      iconColor: totalProfit >= 0 ? "text-emerald-400" : "text-red-400",
      glowColor: totalProfit >= 0 ? "group-hover:shadow-emerald-500/20" : "group-hover:shadow-red-500/20",
      valueColor: totalProfit >= 0 ? "text-emerald-400" : "text-red-400",
    },
    {
      label: "Total ROI",
      value: `${roi >= 0 ? "+" : ""}${roi.toFixed(2)}%`,
      icon: TrendingUp,
      gradient: roi >= 0 ? "from-purple-500 to-purple-600" : "from-red-500 to-red-600",
      iconBg: roi >= 0 ? "bg-purple-500/10" : "bg-red-500/10",
      iconColor: roi >= 0 ? "text-purple-400" : "text-red-400",
      glowColor: roi >= 0 ? "group-hover:shadow-purple-500/20" : "group-hover:shadow-red-500/20",
      valueColor: roi >= 0 ? "text-purple-400" : "text-red-400",
    },
  ];

  return (
    <div className="bg-[#0a0a0a] border border-[#141414] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#141414] bg-[#0d0d0d]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-base">Portfolio Summary</h3>
              <p className="text-[#4a4a4a] text-xs">Real-time financial overview</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#141414] border border-[#1a1a1a]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[#6a6a6a] text-xs font-medium">Live</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, duration: 0.4, ease: "easeOut" }}
              className={`group relative p-4 rounded-xl bg-[#0d0d0d] border border-[#1a1a1a] hover:border-[#2a2a2a] transition-all duration-300 ${stat.glowColor} hover:shadow-lg`}
            >
              {/* Top gradient line */}
              <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${stat.gradient} opacity-60`} />

              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl ${stat.iconBg} border border-white/5 flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>

              {/* Label */}
              <p className="text-[#5a5a5a] text-xs font-medium uppercase tracking-wider mb-1.5">
                {stat.label}
              </p>

              {/* Value */}
              <p className={`text-xl font-bold tracking-tight ${stat.valueColor || "text-white"}`}>
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
