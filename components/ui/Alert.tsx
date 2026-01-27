'use client';

import { ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

type AlertVariant = 'info' | 'success' | 'warning' | 'danger' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  icon?: ReactNode;
  onClose?: () => void;
  className?: string;
}

const variantConfig: Record<
  string,
  { bg: string; border: string; text: string; icon: ReactNode }
> = {
  info: {
    bg: 'bg-blue-50 dark:bg-brand-500/10',
    border: 'border-blue-200 dark:border-brand-500/20',
    text: 'text-blue-700 dark:text-brand-400',
    icon: <Info className="w-5 h-5" />,
  },
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-200 dark:border-emerald-500/20',
    text: 'text-emerald-700 dark:text-emerald-400',
    icon: <CheckCircle className="w-5 h-5" />,
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-200 dark:border-amber-500/20',
    text: 'text-amber-700 dark:text-amber-400',
    icon: <AlertTriangle className="w-5 h-5" />,
  },
  danger: {
    bg: 'bg-red-50 dark:bg-red-500/10',
    border: 'border-red-200 dark:border-red-500/20',
    text: 'text-red-700 dark:text-red-400',
    icon: <AlertCircle className="w-5 h-5" />,
  },
  // Alias for 'danger'
  error: {
    bg: 'bg-red-50 dark:bg-red-500/10',
    border: 'border-red-200 dark:border-red-500/20',
    text: 'text-red-700 dark:text-red-400',
    icon: <AlertCircle className="w-5 h-5" />,
  },
};

export function Alert({
  variant = 'info',
  title,
  children,
  icon,
  onClose,
  className = '',
}: AlertProps) {
  // Get config with fallback to 'info' if variant doesn't exist
  const config = variantConfig[variant] || variantConfig.info;

  return (
    <div
      className={`
        relative rounded-lg border p-4
        ${config.bg} ${config.border}
        ${className}
      `}
      role="alert"
    >
      <div className="flex gap-3">
        <div className={`flex-shrink-0 ${config.text}`}>
          {icon || config.icon}
        </div>
        <div className="flex-1">
          {title && (
            <h3 className={`font-medium ${config.text}`}>{title}</h3>
          )}
          <div className={`text-sm ${title ? 'mt-1' : ''} ${config.text} opacity-90`}>
            {children}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={`flex-shrink-0 ${config.text} hover:opacity-70 transition-opacity`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
