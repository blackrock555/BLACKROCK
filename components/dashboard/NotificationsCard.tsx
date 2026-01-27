"use client";

import { Card, CardHeader, CardBody } from "@/components/ui";
import { Activity, Clock, ArrowRight } from "lucide-react";

interface RunningTrade {
  id: string;
  symbol: string;
  type: "Buy" | "Sell";
  amount: string;
  lot: string;
  time: string;
}

interface NotificationsCardProps {
  trades: RunningTrade[];
}

export function NotificationsCard({ trades }: NotificationsCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader
        title="Running Trades"
        subtitle={`${trades.length} active positions`}
        compact
        action={
          <div className="p-2 rounded-lg bg-amber-500/10">
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
        }
      />
      <CardBody className="flex-1 p-0 overflow-hidden">
        <div className="divide-y divide-surface-100 dark:divide-surface-800 max-h-[280px] overflow-y-auto">
          {trades.length === 0 ? (
            <div className="p-8 text-center">
              <Activity className="w-8 h-8 text-surface-300 dark:text-surface-600 mx-auto mb-2" />
              <p className="text-sm text-surface-500 dark:text-surface-400">No active trades</p>
            </div>
          ) : (
            trades.map((trade) => (
              <div
                key={trade.id}
                className="px-4 py-3 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`
                        flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center
                        text-xs font-bold
                        ${trade.type === "Buy"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : "bg-red-500/10 text-red-500"
                        }
                      `}
                    >
                      {trade.symbol.slice(0, 3)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">
                          {trade.symbol}
                        </p>
                        <span
                          className={`
                            px-1.5 py-0.5 rounded text-[10px] font-bold uppercase
                            ${trade.type === "Buy"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-red-500/10 text-red-500"
                            }
                          `}
                        >
                          {trade.type}
                        </span>
                      </div>
                      <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">
                        {trade.amount} &middot; Lot {trade.lot}
                      </p>
                    </div>
                  </div>

                  <div className="flex-shrink-0 flex items-center gap-1 text-surface-400">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px] font-medium">{trade.time}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {trades.length > 0 && (
          <div className="px-4 py-3 border-t border-surface-100 dark:border-surface-800 bg-surface-50/50 dark:bg-surface-800/30">
            <button
              className="
                inline-flex items-center gap-1.5 text-xs font-medium
                text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300
                transition-colors group
              "
              aria-label="View all trades"
            >
              View all trades
              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
