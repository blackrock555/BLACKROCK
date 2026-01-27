"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { motion } from "framer-motion";

interface GrowthDataPoint {
  month: string;
  growth: number;
}

interface GrowthChartProps {
  data: GrowthDataPoint[];
  height?: number;
}

export function GrowthChart({ data, height = 120 }: GrowthChartProps) {
  // Handle empty data
  const hasData = data && data.length > 0 && data.some(d => d.growth !== 0);

  if (!hasData) {
    return (
      <div className="w-full flex items-center justify-center" style={{ height }}>
        <div className="text-center">
          <div className="w-12 h-12 bg-surface-800 rounded-xl flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-surface-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-surface-500 text-sm">No growth data available</p>
          <p className="text-surface-600 text-xs mt-1">Data will appear after first month</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const isPositive = value >= 0;
      return (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-900 border border-surface-700 px-4 py-3 rounded-xl shadow-xl backdrop-blur-sm"
        >
          <p className="text-surface-400 text-xs mb-1 font-medium">{label}</p>
          <p className={`font-bold text-lg ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
            {isPositive ? "+" : ""}{value.toFixed(1)}%
          </p>
        </motion.div>
      );
    }
    return null;
  };

  // Custom bar shape with rounded top corners
  const RoundedBar = (props: any) => {
    const { x, y, width, height, fill } = props;
    const radius = 4;

    if (height === 0) return null;

    // For positive values (bar goes up)
    if (height > 0) {
      return (
        <path
          d={`
            M ${x},${y + height}
            L ${x},${y + radius}
            Q ${x},${y} ${x + radius},${y}
            L ${x + width - radius},${y}
            Q ${x + width},${y} ${x + width},${y + radius}
            L ${x + width},${y + height}
            Z
          `}
          fill={fill}
        />
      );
    }

    // For negative values (bar goes down from 0)
    return (
      <path
        d={`
          M ${x},${y}
          L ${x},${y + height - radius}
          Q ${x},${y + height} ${x + radius},${y + height}
          L ${x + width - radius},${y + height}
          Q ${x + width},${y + height} ${x + width},${y + height - radius}
          L ${x + width},${y}
          Z
        `}
        fill={fill}
      />
    );
  };

  // Calculate domain to show bars properly
  const maxGrowth = Math.max(...data.map(d => Math.abs(d.growth)));
  const yDomain = [-Math.max(maxGrowth * 1.2, 5), Math.max(maxGrowth * 1.2, 5)];

  return (
    <motion.div
      className="w-full"
      style={{ height }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
        >
          <defs>
            <linearGradient id="positiveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={1} />
              <stop offset="100%" stopColor="#16a34a" stopOpacity={0.8} />
            </linearGradient>
            <linearGradient id="negativeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#dc2626" stopOpacity={1} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#71717a", fontSize: 10, fontWeight: 500 }}
            dy={8}
          />
          <YAxis
            domain={yDomain}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#71717a", fontSize: 10, fontWeight: 500 }}
            tickFormatter={(value) => `${value > 0 ? '+' : ''}${value}%`}
            dx={-5}
            width={40}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(99, 102, 241, 0.08)", radius: 4 }}
          />
          <ReferenceLine y={0} stroke="#3f3f46" strokeDasharray="3 3" />
          <Bar
            dataKey="growth"
            shape={<RoundedBar />}
            maxBarSize={36}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.growth >= 0 ? "url(#positiveGradient)" : "url(#negativeGradient)"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
