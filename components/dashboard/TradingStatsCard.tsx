"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui";
import { motion } from "framer-motion";
import {
  Target,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Award,
  Percent,
  PauseCircle,
} from "lucide-react";
import { isWeekend } from "@/lib/utils/helpers";

interface TradingStats {
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  totalTrades: number;
  recentTrades: number;
  bestAsset: {
    symbol: string;
    profit: number;
  };
}

// Simulated trading stats - in a real app, this would come from an API
const generateStats = (): TradingStats => ({
  winRate: 65 + Math.random() * 15, // 65-80%
  profitFactor: 1.5 + Math.random() * 1.2, // 1.5-2.7
  maxDrawdown: 8 + Math.random() * 7, // 8-15%
  totalTrades: Math.floor(150 + Math.random() * 100), // 150-250
  recentTrades: Math.floor(5 + Math.random() * 10), // 5-15
  bestAsset: {
    symbol: ["XAUUSD", "BTCUSD", "US100", "GBPUSD"][Math.floor(Math.random() * 4)],
    profit: 500 + Math.random() * 2500, // $500-$3000
  },
});

const STORAGE_KEY = "blackrock_trading_stats";
const HOUR_IN_MS = 60 * 60 * 1000;

function AnimatedCounter({ value, decimals = 1, prefix = "", suffix = "" }: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const stepDuration = duration / steps;
    const increment = value / steps;

    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(increment * currentStep);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className="tabular-nums">
      {prefix}{displayValue.toFixed(decimals)}{suffix}
    </span>
  );
}

function CircularProgress({ percentage, size = 60, strokeWidth = 4 }: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circumference - (percentage / 100) * circumference);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage, circumference]);

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-surface-700"
      />
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#gradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
      />
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function TradingStatsCard() {
  const [stats, setStats] = useState<TradingStats | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const weekend = isWeekend();

  useEffect(() => {
    // Try to load from localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { data, timestamp } = JSON.parse(stored);
        if (Date.now() - timestamp < HOUR_IN_MS) {
          setStats(data);
          setIsLoaded(true);
          return;
        }
      }
    } catch {
      // Ignore errors
    }

    // Generate new stats
    const newStats = generateStats();
    setStats(newStats);
    setIsLoaded(true);

    // Store in localStorage
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ data: newStats, timestamp: Date.now() })
      );
    } catch {
      // Ignore errors
    }
  }, []);

  if (!stats) {
    return (
      <Card className="h-full">
        <CardBody>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-surface-700 rounded w-1/3"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-24 bg-surface-700 rounded-xl"></div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>
    );
  }

  const metrics = [
    {
      label: "Win Rate",
      value: stats.winRate,
      icon: Target,
      color: "emerald",
      render: () => (
        <div className="flex items-center gap-3">
          <CircularProgress percentage={stats.winRate} size={48} strokeWidth={4} />
          <div className="text-2xl font-bold text-white">
            <AnimatedCounter value={stats.winRate} suffix="%" />
          </div>
        </div>
      ),
    },
    {
      label: "Profit Factor",
      value: stats.profitFactor,
      icon: TrendingUp,
      color: "brand",
      render: () => (
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-white">
            <AnimatedCounter value={stats.profitFactor} decimals={2} />
          </div>
          <div className={`px-2 py-0.5 rounded text-xs font-semibold ${
            stats.profitFactor > 2
              ? "bg-emerald-500/20 text-emerald-400"
              : "bg-amber-500/20 text-amber-400"
          }`}>
            {stats.profitFactor > 2 ? "Excellent" : "Good"}
          </div>
        </div>
      ),
    },
    {
      label: "Max Drawdown",
      value: stats.maxDrawdown,
      icon: TrendingDown,
      color: "red",
      render: () => (
        <div>
          <div className="text-2xl font-bold text-white mb-2">
            <AnimatedCounter value={stats.maxDrawdown} suffix="%" />
          </div>
          <div className="w-full h-1.5 bg-surface-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.maxDrawdown * 5}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full"
            />
          </div>
        </div>
      ),
    },
    {
      label: "Total Trades",
      value: stats.totalTrades,
      icon: BarChart3,
      color: "purple",
      render: () => (
        <div className="flex items-center gap-3">
          <div className="text-2xl font-bold text-white">
            <AnimatedCounter value={stats.totalTrades} decimals={0} />
          </div>
          <div className="flex items-center gap-1 text-xs text-surface-400">
            <Activity className="w-3 h-3 text-emerald-400" />
            <span>+{stats.recentTrades} today</span>
          </div>
        </div>
      ),
    },
    {
      label: "Best Asset",
      value: 0,
      icon: Award,
      color: "amber",
      render: () => (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-bold text-white">{stats.bestAsset.symbol}</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs font-semibold">
              Top
            </span>
          </div>
          <div className="text-emerald-400 font-semibold">
            +$<AnimatedCounter value={stats.bestAsset.profit} decimals={0} />
          </div>
        </div>
      ),
    },
    {
      label: "Risk/Reward",
      value: 0,
      icon: Percent,
      color: "blue",
      render: () => {
        const riskReward = (stats.winRate / (100 - stats.winRate)).toFixed(1);
        return (
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-white">1:{riskReward}</div>
            <div className="text-xs text-surface-400">ratio</div>
          </div>
        );
      },
    },
  ];

  const iconColors: Record<string, string> = {
    emerald: "bg-emerald-500/10 text-emerald-400",
    brand: "bg-brand-500/10 text-brand-400",
    red: "bg-red-500/10 text-red-400",
    purple: "bg-purple-500/10 text-purple-400",
    amber: "bg-amber-500/10 text-amber-400",
    blue: "bg-blue-500/10 text-blue-400",
  };

  return (
    <Card className="h-full">
      <CardHeader
        title="Trading Performance"
        subtitle={weekend ? "Markets closed for the weekend" : "Real-time trading metrics"}
        compact
        action={
          weekend ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <PauseCircle className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-400 tracking-wider">CLOSED</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs text-surface-400">Live</span>
            </div>
          )
        }
      />
      <CardBody>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isLoaded ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="p-4 bg-surface-800/50 border border-surface-700/50 rounded-xl hover:border-surface-600/50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-1.5 rounded-lg ${iconColors[metric.color]}`}>
                  <metric.icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium text-surface-400 uppercase tracking-wider">
                  {metric.label}
                </span>
              </div>
              {metric.render()}
            </motion.div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
