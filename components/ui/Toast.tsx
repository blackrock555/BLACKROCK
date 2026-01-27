"use client";

import { useEffect, useState } from "react";
import { X, TrendingUp, TrendingDown, Zap } from "lucide-react";

export interface TradeNotification {
  id: string;
  symbol: string;
  direction: "Buy" | "Sell";
  amount: string;
  profit: number;
  timestamp: Date;
}

interface ToastProps {
  notification: TradeNotification;
  onClose: (id: string) => void;
  duration?: number;
}

export function Toast({ notification, onClose, duration = 5000 }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onClose(notification.id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [notification.id, onClose, duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(notification.id), 300);
  };

  const isProfit = notification.profit >= 0;

  return (
    <div
      className={`
        w-full max-w-[340px]
        bg-white dark:bg-surface-900
        rounded-lg
        border border-surface-200 dark:border-surface-800
        shadow-lg dark:shadow-2xl
        overflow-hidden
        ${isExiting ? "slide-out-right" : "slide-in-right"}
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="p-3">
        <div className="flex items-start gap-3">
          <div
            className={`
              flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center
              ${notification.direction === "Buy"
                ? "bg-emerald-500/10 text-emerald-500"
                : "bg-red-500/10 text-red-500"
              }
            `}
          >
            <Zap className="w-4 h-4" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-surface-900 dark:text-white">
                  {notification.symbol}
                </p>
                <span
                  className={`
                    px-1.5 py-0.5 rounded text-[10px] font-bold uppercase
                    ${notification.direction === "Buy"
                      ? "bg-emerald-500/10 text-emerald-500"
                      : "bg-red-500/10 text-red-500"
                    }
                  `}
                >
                  {notification.direction}
                </span>
              </div>
              <button
                onClick={handleClose}
                className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors p-0.5"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-1.5 flex items-center justify-between">
              <span className="text-xs text-surface-500 dark:text-surface-400">
                {notification.amount}
              </span>
              <span
                className={`
                  inline-flex items-center gap-1 text-xs font-semibold
                  ${isProfit ? "text-emerald-500" : "text-red-500"}
                `}
              >
                {isProfit ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {isProfit ? "+" : ""}${Math.abs(notification.profit).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-surface-100 dark:bg-surface-800">
        <div
          className={`h-full ${isProfit ? "bg-emerald-500" : "bg-red-500"}`}
          style={{
            animation: `shrink ${duration}ms linear forwards`,
          }}
        />
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}

interface ToastContainerProps {
  notifications: TradeNotification[];
  onClose: (id: string) => void;
}

export function ToastContainer({ notifications, onClose }: ToastContainerProps) {
  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-h-[70vh] overflow-hidden pointer-events-none"
      aria-label="Notifications"
    >
      {notifications.slice(0, 3).map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <Toast notification={notification} onClose={onClose} />
        </div>
      ))}
    </div>
  );
}
