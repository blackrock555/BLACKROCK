'use client';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  lines = 1,
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-surface-800';

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  if (lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={`${baseClasses} ${variantClasses[variant]} h-4 ${className}`}
            style={{
              ...style,
              width: i === lines - 1 ? '75%' : style.width,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    />
  );
}

// Card skeleton
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-surface-900 border border-surface-800 rounded-xl p-5 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1">
          <Skeleton height={16} width="60%" className="mb-2" />
          <Skeleton height={12} width="40%" />
        </div>
      </div>
      <Skeleton lines={3} />
    </div>
  );
}

// Table row skeleton
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b border-surface-800">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton height={16} width={`${60 + Math.random() * 30}%`} />
        </td>
      ))}
    </tr>
  );
}

// Stat card skeleton
export function StatCardSkeleton() {
  return (
    <div className="bg-surface-900 border border-surface-800 rounded-xl p-5">
      <Skeleton height={14} width="50%" className="mb-3" />
      <Skeleton height={32} width="70%" className="mb-2" />
      <Skeleton height={12} width="40%" />
    </div>
  );
}

// Chart skeleton
export function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div
      className="bg-surface-900 border border-surface-800 rounded-xl p-5"
      style={{ height }}
    >
      <div className="flex items-end justify-between h-full gap-2 pt-8">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            height={`${30 + Math.random() * 60}%`}
          />
        ))}
      </div>
    </div>
  );
}
