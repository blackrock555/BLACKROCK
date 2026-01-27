'use client';

import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages: (number | 'ellipsis')[] = [];
    const showEllipsisStart = currentPage > 3;
    const showEllipsisEnd = currentPage < totalPages - 2;

    // Always show first page
    pages.push(1);

    if (showEllipsisStart) {
      pages.push('ellipsis');
    }

    // Show pages around current
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    if (showEllipsisEnd) {
      pages.push('ellipsis');
    }

    // Always show last page
    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <nav
      className={`flex items-center justify-center gap-1 ${className}`}
      aria-label="Pagination"
    >
      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {getVisiblePages().map((page, index) =>
          page === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="px-2 text-surface-500"
            >
              <MoreHorizontal className="w-4 h-4" />
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`
                min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors
                ${currentPage === page
                  ? 'bg-brand-500 text-white'
                  : 'text-surface-400 hover:text-white hover:bg-surface-800'
                }
              `}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          )
        )}
      </div>

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg text-surface-400 hover:text-white hover:bg-surface-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}

// Page size selector
export function PageSizeSelector({
  value,
  onChange,
  options = [10, 25, 50, 100],
  className = '',
}: {
  value: number;
  onChange: (size: number) => void;
  options?: number[];
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-surface-400">Show</span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="px-2 py-1 rounded-lg bg-surface-800 border border-surface-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="text-sm text-surface-400">per page</span>
    </div>
  );
}
