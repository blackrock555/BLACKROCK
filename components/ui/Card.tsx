"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "glass";
}

interface CardHeaderProps {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
  compact?: boolean;
}

export function Card({ children, className = "", variant = "default" }: CardProps) {
  const variants = {
    default: "bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700/50 shadow-card dark:shadow-none",
    elevated: "bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700/50 shadow-soft hover:shadow-soft-md dark:shadow-elevation-1 dark:hover:shadow-elevation-2 hover:border-surface-300 dark:hover:border-surface-600",
    glass: "bg-white/95 dark:bg-surface-800/80 backdrop-blur-xl border border-surface-200/80 dark:border-surface-700/30 shadow-soft-sm dark:shadow-none",
  };

  return (
    <div
      className={`
        rounded-xl transition-all duration-200
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, compact = false }: CardHeaderProps) {
  return (
    <div className={`
      flex items-center justify-between gap-4
      border-b border-surface-200 dark:border-surface-700/50
      ${compact ? "px-4 py-3" : "px-5 py-4"}
    `}>
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-surface-900 dark:text-white truncate">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5 truncate">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ children, className = "", compact = false }: CardBodyProps) {
  return (
    <div className={`${compact ? "p-4" : "p-5"} ${className}`}>
      {children}
    </div>
  );
}
