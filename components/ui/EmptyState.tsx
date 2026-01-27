'use client';

import { ReactNode } from 'react';
import { FileQuestion, Inbox, Search, Users } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <div className="w-16 h-16 rounded-full bg-surface-800 flex items-center justify-center mb-4">
        {icon || <Inbox className="w-8 h-8 text-surface-500" />}
      </div>
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      {description && (
        <p className="text-surface-400 text-sm max-w-sm mb-6">{description}</p>
      )}
      {action && (
        <Button
          variant="primary"
          onClick={action.onClick}
          href={action.href}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Pre-configured empty states
export function NoDataState({ message = 'No data available' }: { message?: string }) {
  return (
    <EmptyState
      icon={<FileQuestion className="w-8 h-8 text-surface-500" />}
      title={message}
    />
  );
}

export function NoResultsState({ query }: { query?: string }) {
  return (
    <EmptyState
      icon={<Search className="w-8 h-8 text-surface-500" />}
      title="No results found"
      description={query ? `No results for "${query}". Try a different search term.` : 'Try adjusting your search or filters.'}
    />
  );
}

export function NoTransactionsState() {
  return (
    <EmptyState
      icon={<Inbox className="w-8 h-8 text-surface-500" />}
      title="No transactions yet"
      description="Your transaction history will appear here once you make your first deposit."
      action={{
        label: 'Make a Deposit',
        href: '/deposit',
      }}
    />
  );
}

export function NoReferralsState() {
  return (
    <EmptyState
      icon={<Users className="w-8 h-8 text-surface-500" />}
      title="No referrals yet"
      description="Share your referral link with friends to start earning rewards."
    />
  );
}
