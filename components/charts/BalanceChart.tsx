"use client";

import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { motion } from "framer-motion";

interface BalanceDataPoint {
  date: string;
  balance: number;
}

interface BalanceChartProps {
  data: BalanceDataPoint[];
  height?: number;
  showGrid?: boolean;
}

export function BalanceChart({ data, height = 200, showGrid = true }: BalanceChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const hasData = data && data.length > 0 && data.some(d => d.balance > 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`;
    return `$${value.toFixed(0)}`;
  };

  // Calculate chart metrics
  const { minBalance, maxBalance, yDomain, depositAmount, currentBalance, pnlPercent, isProfit } = useMemo(() => {
    if (!hasData) return { minBalance: 0, maxBalance: 0, yDomain: [0, 100], depositAmount: 0, currentBalance: 0, pnlPercent: 0, isProfit: true };

    const balances = data.map(d => d.balance);
    const min = Math.min(...balances);
    const max = Math.max(...balances);
    const range = max - min;
    const padding = range > 0 ? range * 0.15 : max * 0.1 || 50;

    const deposit = data[0]?.balance ?? 0;
    const current = data[data.length - 1]?.balance ?? 0;
    const pnl = deposit > 0 ? ((current - deposit) / deposit) * 100 : 0;

    return {
      minBalance: min,
      maxBalance: max,
      yDomain: [Math.max(0, min - padding), max + padding],
      depositAmount: deposit,
      currentBalance: current,
      pnlPercent: pnl,
      isProfit: current >= deposit,
    };
  }, [data, hasData]);

  if (!hasData) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <div className="w-12 h-12 bg-surface-800 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
          <p className="text-surface-500 text-sm">No balance history available</p>
          <p className="text-surface-600 text-xs mt-1">Make a deposit to start tracking</p>
        </div>
      </div>
    );
  }

  // Dynamic color based on profit/loss
  const lineColor = isProfit ? "#22c55e" : "#ef4444";
  const lineColorMuted = isProfit ? "#16a34a" : "#dc2626";
  const glowColor = isProfit ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)";

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const diff = value - depositAmount;
      const diffPercent = depositAmount > 0 ? ((diff / depositAmount) * 100).toFixed(2) : "0.00";
      const isDiffPositive = diff >= 0;

      return (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="bg-surface-900/95 border border-surface-700/50 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md"
        >
          <p className="text-surface-400 text-[10px] uppercase tracking-wider mb-1.5 font-medium">{label}</p>
          <p className="text-white font-bold text-base tracking-tight">{formatCurrency(value)}</p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`text-[11px] font-semibold ${isDiffPositive ? "text-emerald-400" : "text-red-400"}`}>
              {isDiffPositive ? "+" : ""}{formatCurrency(diff)}
            </span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${isDiffPositive ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"}`}>
              {isDiffPositive ? "+" : ""}{diffPercent}%
            </span>
          </div>
        </motion.div>
      );
    }
    return null;
  };

  // Custom active dot with glow
  const CustomActiveDot = (props: any) => {
    const { cx, cy } = props;
    return (
      <g>
        <circle cx={cx} cy={cy} r={12} fill={glowColor} />
        <circle cx={cx} cy={cy} r={6} fill={lineColor} stroke="#0a0a0b" strokeWidth={2.5} />
        <circle cx={cx} cy={cy} r={2.5} fill="white" opacity={0.9} />
      </g>
    );
  };

  // Unique gradient IDs to avoid conflicts
  const gradientId = "equityFill";
  const strokeId = "equityStroke";
  const glowId = "equityGlow";

  return (
    <motion.div
      className="w-full"
      style={{ height }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
          onMouseMove={(state: any) => {
            if (state?.activeTooltipIndex !== undefined) {
              setActiveIndex(state.activeTooltipIndex);
            }
          }}
          onMouseLeave={() => setActiveIndex(null)}
        >
          <defs>
            {/* Main fill gradient */}
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity={0.25} />
              <stop offset="40%" stopColor={lineColor} stopOpacity={0.1} />
              <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
            </linearGradient>
            {/* Stroke gradient for depth */}
            <linearGradient id={strokeId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={lineColorMuted} />
              <stop offset="50%" stopColor={lineColor} />
              <stop offset="100%" stopColor={lineColorMuted} />
            </linearGradient>
            {/* Glow filter */}
            <filter id={glowId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feFlood floodColor={lineColor} floodOpacity="0.4" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#27272a"
            strokeOpacity={0.4}
            vertical={false}
          />

          {/* Deposit reference line */}
          {depositAmount > 0 && minBalance !== maxBalance && (
            <ReferenceLine
              y={depositAmount}
              stroke="#525252"
              strokeDasharray="6 4"
              strokeWidth={1}
              label={{
                value: `Deposit ${formatYAxis(depositAmount)}`,
                position: "insideTopRight",
                fill: "#737373",
                fontSize: 9,
                fontWeight: 500,
              }}
            />
          )}

          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#71717a", fontSize: 10, fontWeight: 500 }}
            dy={8}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={yDomain}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#71717a", fontSize: 10, fontWeight: 500 }}
            tickFormatter={formatYAxis}
            dx={-5}
            width={50}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{
              stroke: lineColor,
              strokeWidth: 1,
              strokeDasharray: "4 4",
              strokeOpacity: 0.5,
            }}
          />
          {/* Glow line (rendered behind) */}
          <Area
            type="monotone"
            dataKey="balance"
            stroke={lineColor}
            strokeWidth={4}
            fill="none"
            dot={false}
            activeDot={false}
            strokeOpacity={0.15}
            isAnimationActive={true}
            animationDuration={1200}
            animationEasing="ease-out"
          />
          {/* Main equity line */}
          <Area
            type="monotone"
            dataKey="balance"
            stroke={`url(#${strokeId})`}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={<CustomActiveDot />}
            isAnimationActive={true}
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
