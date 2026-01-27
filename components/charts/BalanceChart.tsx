"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

interface BalanceDataPoint {
  date: string;
  balance: number;
}

interface BalanceChartProps {
  data: BalanceDataPoint[];
  height?: number;
  showGrid?: boolean;
}

export function BalanceChart({ data, height = 140, showGrid = false }: BalanceChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Handle empty or all-zero data
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
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
    return `$${value}`;
  };

  if (!hasData) {
    return (
      <div className={`w-full flex items-center justify-center`} style={{ height }}>
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-900 border border-surface-700 px-4 py-3 rounded-xl shadow-xl backdrop-blur-sm"
        >
          <p className="text-surface-400 text-xs mb-1 font-medium">{label}</p>
          <p className="text-white font-bold text-lg">{formatCurrency(payload[0].value)}</p>
        </motion.div>
      );
    }
    return null;
  };

  // Calculate domain for better visualization
  const minBalance = Math.min(...data.map(d => d.balance));
  const maxBalance = Math.max(...data.map(d => d.balance));
  const padding = (maxBalance - minBalance) * 0.1;
  const yDomain = [Math.max(0, minBalance - padding), maxBalance + padding];

  return (
    <motion.div
      className="w-full"
      style={{ height }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
          onMouseMove={(state: any) => {
            if (state?.activeTooltipIndex !== undefined) {
              setActiveIndex(state.activeTooltipIndex);
            }
          }}
          onMouseLeave={() => setActiveIndex(null)}
        >
          <defs>
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="50%" stopColor="#6366f1" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="balanceStroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#4f46e5" />
            </linearGradient>
          </defs>
          {showGrid && (
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#27272a"
              vertical={false}
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
              stroke: "#6366f1",
              strokeWidth: 1,
              strokeDasharray: "4 4",
            }}
          />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="url(#balanceStroke)"
            strokeWidth={2.5}
            fill="url(#balanceGradient)"
            dot={false}
            activeDot={{
              r: 6,
              fill: "#6366f1",
              stroke: "#1f1f23",
              strokeWidth: 3,
            }}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
