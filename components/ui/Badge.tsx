'use client';

import { ReactNode } from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'pending';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-surface-800 text-surface-300 border-surface-700',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  danger: 'bg-red-500/10 text-red-400 border-red-500/20',
  info: 'bg-brand-500/10 text-brand-400 border-brand-500/20',
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2 py-1 text-xs',
  lg: 'px-2.5 py-1 text-sm',
};

export function Badge({
  variant = 'default',
  size = 'md',
  icon,
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 font-medium rounded-full border
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

// Status-specific badge variants
export function StatusBadge({
  status,
  className = '',
}: {
  status: string;
  className?: string;
}) {
  const statusConfig: Record<string, { variant: BadgeVariant; label: string }> = {
    PENDING: { variant: 'pending', label: 'Pending' },
    APPROVED: { variant: 'success', label: 'Approved' },
    REJECTED: { variant: 'danger', label: 'Rejected' },
    COMPLETED: { variant: 'success', label: 'Completed' },
    FAILED: { variant: 'danger', label: 'Failed' },
    CANCELLED: { variant: 'default', label: 'Cancelled' },
    PROCESSING: { variant: 'info', label: 'Processing' },
    ACTIVE: { variant: 'success', label: 'Active' },
    SUSPENDED: { variant: 'danger', label: 'Suspended' },
    LOCKED: { variant: 'warning', label: 'Locked' },
    NOT_SUBMITTED: { variant: 'default', label: 'Not Submitted' },
    UNDER_REVIEW: { variant: 'info', label: 'Under Review' },
    CREDITED: { variant: 'success', label: 'Credited' },
    EXPIRED: { variant: 'default', label: 'Expired' },
  };

  const config = statusConfig[status] || { variant: 'default', label: status };

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}

// Role badge
export function RoleBadge({
  role,
  className = '',
}: {
  role: 'USER' | 'ADMIN';
  className?: string;
}) {
  return (
    <Badge
      variant={role === 'ADMIN' ? 'info' : 'default'}
      size="sm"
      className={className}
    >
      {role}
    </Badge>
  );
}

// KYC status badge
export function KYCBadge({
  status,
  className = '',
}: {
  status: string;
  className?: string;
}) {
  const config: Record<string, { variant: BadgeVariant; label: string }> = {
    NOT_SUBMITTED: { variant: 'default', label: 'Not Verified' },
    PENDING: { variant: 'pending', label: 'Pending Review' },
    APPROVED: { variant: 'success', label: 'Verified' },
    REJECTED: { variant: 'danger', label: 'Rejected' },
  };

  const { variant, label } = config[status] || { variant: 'default', label: status };

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
