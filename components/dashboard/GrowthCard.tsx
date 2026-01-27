"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
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

interface GrowthDataPoint {
  month: string;
  growth: number;
}

interface GrowthCardProps {
  currentGrowth: number;
  data: GrowthDataPoint[];
}

export function GrowthCard({ currentGrowth, data }: GrowthCardProps) {
  const isPositive = currentGrowth >= 0;
  const hasData = data && data.length > 0 && data.some(d => d.growth !== 0);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const isPos = value >= 0;
      return (
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] px-3 py-2 rounded-lg shadow-xl">
          <p className="text-[#6a6a6a] text-xs mb-1">{label}</p>
          <p className={`font-bold text-sm ${isPos ? "text-emerald-400" : "text-red-400"}`}>
            {isPos ? "+" : ""}{value.toFixed(2)}%
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom bar shape with rounded corners
  const RoundedBar = (props: any) => {
    const { x, y, width, height, fill } = props;
    const radius = 4;

    if (height === 0) return null;

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

  const maxGrowth = data.length > 0 ? Math.max(...data.map(d => Math.abs(d.growth)), 5) : 5;
  const yDomain = [-maxGrowth * 1.2, maxGrowth * 1.2];

  return (
    <div className="bg-[#0a0a0a] border border-[#141414] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#141414] bg-[#0d0d0d]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-base">Monthly Growth</h3>
              <p className="text-[#4a4a4a] text-xs">Last 6 months ROI performance</p>
            </div>
          </div>

          {/* Current Growth Badge */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-[#5a5a5a] text-xs mb-0.5">This Month</p>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-bold ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                  {isPositive ? "+" : ""}{currentGrowth.toFixed(2)}%
                </span>
                <div className={`p-1.5 rounded-lg ${isPositive ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-4">
        {!hasData ? (
          <div className="h-[180px] flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 bg-[#141414] rounded-xl flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-6 h-6 text-[#3a3a3a]" />
              </div>
              <p className="text-[#5a5a5a] text-sm">No growth data yet</p>
              <p className="text-[#3a3a3a] text-xs mt-1">Data will appear after your first month</p>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="h-[180px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
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
                  tick={{ fill: "#5a5a5a", fontSize: 11, fontWeight: 500 }}
                  dy={8}
                />
                <YAxis
                  domain={yDomain}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#5a5a5a", fontSize: 10, fontWeight: 500 }}
                  tickFormatter={(value) => `${value > 0 ? '+' : ''}${value.toFixed(0)}%`}
                  dx={-5}
                  width={45}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                <ReferenceLine y={0} stroke="#2a2a2a" strokeWidth={1} />
                <Bar
                  dataKey="growth"
                  shape={<RoundedBar />}
                  maxBarSize={40}
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
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-[#141414] bg-[#0d0d0d]">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[#5a5a5a]">Positive ROI</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-[#5a5a5a]">Negative ROI</span>
            </div>
          </div>
          <span className="text-[#3a3a3a]">Monthly return on investment</span>
        </div>
      </div>
    </div>
  );
}
