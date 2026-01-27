"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatItemProps {
  label: string;
  value: string;
  change?: number;
  trend?: "up" | "down" | "neutral";
  prefix?: string;
  suffix?: string;
  size?: "sm" | "md" | "lg";
}

export function StatItem({
  label,
  value,
  change,
  trend = "neutral",
  prefix = "",
  suffix = "",
  size = "md",
}: StatItemProps) {
  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-emerald-500";
      case "down":
        return "text-red-500";
      default:
        return "text-surface-400";
    }
  };

  const getTrendBg = () => {
    switch (trend) {
      case "up":
        return "bg-emerald-500/10";
      case "down":
        return "bg-red-500/10";
      default:
        return "bg-surface-500/10";
    }
  };

  const TrendIcon = () => {
    const iconClass = "w-3 h-3";
    switch (trend) {
      case "up":
        return <TrendingUp className={iconClass} />;
      case "down":
        return <TrendingDown className={iconClass} />;
      default:
        return <Minus className={iconClass} />;
    }
  };

  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <p className="text-xs font-medium uppercase tracking-wider text-surface-500 dark:text-surface-400">
          {label}
        </p>
      )}
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className={`${sizeClasses[size]} font-semibold text-surface-900 dark:text-white tracking-tight`}>
          {prefix}
          {value}
          {suffix}
        </span>
        {change !== undefined && (
          <span
            className={`
              inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium
              ${getTrendBg()} ${getTrendColor()}
            `}
          >
            <TrendIcon />
            {Math.abs(change)}%
          </span>
        )}
      </div>
    </div>
  );
}
