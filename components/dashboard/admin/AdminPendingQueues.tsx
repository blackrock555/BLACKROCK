"use client";

import { Card, CardBody, Badge, Skeleton } from "@/components/ui";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

interface AdminStats {
  pendingDeposits: number;
  pendingWithdrawals: number;
  pendingKYC: number;
}

interface AdminPendingQueuesProps {
  stats: AdminStats | null;
  isLoading: boolean;
  onSelectSection: (section: string) => void;
}

export function AdminPendingQueues({ stats, isLoading, onSelectSection }: AdminPendingQueuesProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  const queues = [
    {
      id: "deposits",
      label: "Pending Deposits",
      count: stats?.pendingDeposits || 0,
      icon: ArrowDownToLine,
      color: "amber",
      description: "Awaiting approval",
    },
    {
      id: "withdrawals",
      label: "Pending Withdrawals",
      count: stats?.pendingWithdrawals || 0,
      icon: ArrowUpFromLine,
      color: "amber",
      description: "Awaiting processing",
    },
    {
      id: "kyc",
      label: "Pending KYC",
      count: stats?.pendingKYC || 0,
      icon: ShieldCheck,
      color: "amber",
      description: "Awaiting review",
    },
  ];

  const colorClasses: Record<string, { bg: string; text: string }> = {
    amber: { bg: "bg-amber-500/10 dark:bg-amber-500/20", text: "text-amber-500 dark:text-amber-400" },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {queues.map((queue) => (
        <button
          key={queue.id}
          onClick={() => onSelectSection(queue.id)}
          className="text-left"
        >
          <Card variant="elevated" className="h-full hover:border-brand-500/50 transition-colors">
            <CardBody>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${colorClasses[queue.color].bg}`}>
                    <queue.icon className={`w-5 h-5 ${colorClasses[queue.color].text}`} />
                  </div>
                  <span className="text-surface-900 dark:text-white font-medium">
                    {queue.label}
                  </span>
                </div>
                {queue.count > 0 && (
                  <Badge variant="warning">{queue.count}</Badge>
                )}
              </div>
              <p className="text-4xl font-bold text-surface-900 dark:text-white mb-1">
                {queue.count}
              </p>
              <p className="text-surface-500 dark:text-surface-400 text-sm">
                {queue.description}
              </p>
            </CardBody>
          </Card>
        </button>
      ))}
    </div>
  );
}
