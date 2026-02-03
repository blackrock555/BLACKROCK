"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardHeader, CardBody } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Clock,
  TrendingUp,
  TrendingDown,
  PauseCircle,
} from "lucide-react";
import { isWeekend } from "@/lib/utils/helpers";

// ============ Types ============
interface SimulatedTrade {
  id: string;
  symbol: "XAUUSD" | "BTCUSD" | "GBPUSD" | "US100";
  type: "Buy" | "Sell";
  volume: number;
  profit: number;
  openTime: number; // timestamp
}

interface StoredTradesData {
  trades: SimulatedTrade[];
  generatedAt: number;
}

// ============ Constants ============
const SYMBOLS: SimulatedTrade["symbol"][] = ["XAUUSD", "BTCUSD", "GBPUSD", "US100"];
const STORAGE_KEY = "blackrock_running_trades";
const HOUR_IN_MS = 60 * 60 * 1000;
const FLUCTUATION_INTERVAL = 2500; // 2.5 seconds
const HOURLY_CHECK_INTERVAL = 60000; // 1 minute

// ============ Helper Functions ============
const randomInRange = (min: number, max: number): number =>
  Math.random() * (max - min) + min;

const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const generateProfit = (): number => {
  const isProfit = Math.random() > 0.4; // 60% profit chance
  if (isProfit) {
    return randomInRange(10, 9999);
  } else {
    return randomInRange(-2499, -10);
  }
};

const fluctuateProfit = (current: number): number => {
  const change = randomInRange(-15, 15);
  let newValue = current + change;
  // Keep within bounds
  if (newValue > 9999) newValue = 9999 - Math.random() * 100;
  if (newValue < -2499) newValue = -2499 + Math.random() * 100;
  return newValue;
};

const generateVolume = (): number => {
  // Generate volume between 0.01 and 2.00 lots
  const volume = randomInRange(0.01, 2.0);
  return Math.round(volume * 100) / 100; // Round to 2 decimals
};

const generateOpenTime = (): number => {
  // Random time within last 15 minutes
  const now = Date.now();
  const fifteenMinsAgo = now - 15 * 60 * 1000;
  return randomInt(fifteenMinsAgo, now);
};

const generateTrades = (): SimulatedTrade[] => {
  const tradeCount = randomInt(5, 6);
  const trades: SimulatedTrade[] = [];

  for (let i = 0; i < tradeCount; i++) {
    trades.push({
      id: `trade-${Date.now()}-${i}`,
      symbol: SYMBOLS[randomInt(0, SYMBOLS.length - 1)],
      type: Math.random() > 0.5 ? "Buy" : "Sell",
      volume: generateVolume(),
      profit: generateProfit(),
      openTime: generateOpenTime(),
    });
  }

  // Sort by open time (most recent first)
  return trades.sort((a, b) => b.openTime - a.openTime);
};

const formatTimeAgo = (timestamp: number): string => {
  const mins = Math.floor((Date.now() - timestamp) / 60000);
  if (mins < 1) return "Just now";
  if (mins === 1) return "1m ago";
  return `${mins}m ago`;
};

const formatProfit = (profit: number): string => {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(profit));
  return profit >= 0 ? `+${formatted}` : `-${formatted}`;
};

const formatVolume = (volume: number): string => {
  return `${volume.toFixed(2)} lots`;
};

// ============ Main Component ============
export function RunningTradesCard() {
  const [trades, setTrades] = useState<SimulatedTrade[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isInitialized, setIsInitialized] = useState(false);
  const fluctuationRef = useRef<NodeJS.Timeout | null>(null);
  const hourlyCheckRef = useRef<NodeJS.Timeout | null>(null);
  const weekend = isWeekend();

  // Load or generate trades
  const initializeTrades = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const data: StoredTradesData = JSON.parse(stored);
        const hoursSinceGeneration = Date.now() - data.generatedAt;

        // If less than 1 hour old, use stored trades
        if (hoursSinceGeneration < HOUR_IN_MS) {
          setTrades(data.trades);
          setIsInitialized(true);
          return;
        }
      }

      // Generate new trades
      regenerateTrades();
    } catch {
      // If localStorage fails, just generate new trades
      regenerateTrades();
    }
  }, []);

  // Generate and store new trades
  const regenerateTrades = useCallback(() => {
    const newTrades = generateTrades();
    const data: StoredTradesData = {
      trades: newTrades,
      generatedAt: Date.now(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // localStorage might be full or disabled
    }

    setTrades(newTrades);
    setIsInitialized(true);
  }, []);

  // P/L Fluctuation effect
  const startFluctuation = useCallback(() => {
    if (fluctuationRef.current) {
      clearInterval(fluctuationRef.current);
    }

    fluctuationRef.current = setInterval(() => {
      setTrades((prevTrades) => {
        const updatedTrades = prevTrades.map((trade) => ({
          ...trade,
          profit: fluctuateProfit(trade.profit),
        }));

        // Update localStorage with fluctuated values
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const data: StoredTradesData = JSON.parse(stored);
            data.trades = updatedTrades;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          }
        } catch {
          // Ignore localStorage errors
        }

        return updatedTrades;
      });
      setLastUpdate(new Date());
    }, FLUCTUATION_INTERVAL);
  }, []);

  // Hourly regeneration check
  const startHourlyCheck = useCallback(() => {
    if (hourlyCheckRef.current) {
      clearInterval(hourlyCheckRef.current);
    }

    hourlyCheckRef.current = setInterval(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data: StoredTradesData = JSON.parse(stored);
          const hoursSinceGeneration = Date.now() - data.generatedAt;

          if (hoursSinceGeneration >= HOUR_IN_MS) {
            regenerateTrades();
          }
        }
      } catch {
        // Ignore errors
      }
    }, HOURLY_CHECK_INTERVAL);
  }, [regenerateTrades]);

  // Initialize on mount
  useEffect(() => {
    initializeTrades();
  }, [initializeTrades]);

  // Start intervals after initialization
  useEffect(() => {
    if (isInitialized) {
      startFluctuation();
      startHourlyCheck();
    }

    return () => {
      if (fluctuationRef.current) {
        clearInterval(fluctuationRef.current);
      }
      if (hourlyCheckRef.current) {
        clearInterval(hourlyCheckRef.current);
      }
    };
  }, [isInitialized, startFluctuation, startHourlyCheck]);

  if (weekend) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader
          title="Live Positions"
          subtitle={
            <span className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 bg-amber-500 rounded-full" />
                <span>Markets Closed</span>
              </span>
            </span>
          }
          compact
          action={
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <PauseCircle className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-400 tracking-wider">CLOSED</span>
            </div>
          }
        />
        <CardBody className="flex-1 p-0 overflow-hidden">
          <div className="p-8 text-center">
            <div className="w-14 h-14 bg-amber-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
              <PauseCircle className="w-7 h-7 text-amber-400" />
            </div>
            <p className="text-base font-semibold text-white mb-2">Markets Closed</p>
            <p className="text-sm text-surface-400">
              Trading markets are closed for the weekend. Positions will resume when markets reopen on Monday.
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader
        title="Live Positions"
        subtitle={
          <span className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span>{trades.length} positions</span>
            </span>
          </span>
        }
        compact
        action={
          <div className="flex items-center gap-2">
            {/* Prominent LIVE Badge */}
            <div className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500/20 via-emerald-400/10 to-emerald-500/20 border border-emerald-500/30 live-badge-glow">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold text-emerald-400 tracking-wider live-text-pulse">LIVE</span>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
            </div>
          </div>
        }
      />

      <CardBody className="flex-1 p-0 overflow-hidden">
        <div className="divide-y divide-surface-800">
          <AnimatePresence mode="popLayout">
            {trades.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 text-center"
              >
                <div className="w-12 h-12 bg-surface-800 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Activity className="w-6 h-6 text-surface-600" />
                </div>
                <p className="text-sm font-medium text-surface-400 mb-1">Loading positions...</p>
              </motion.div>
            ) : (
              trades.map((trade, index) => {
                const isProfit = trade.profit >= 0;
                const TypeIcon = trade.type === "Buy" ? TrendingUp : TrendingDown;

                return (
                  <motion.div
                    key={trade.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="px-4 py-3 hover:bg-surface-800/50 transition-colors"
                  >
                    {/* Row 1: Symbol, Type Badge, Volume */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        {/* Symbol Indicator */}
                        <div
                          className={`
                            w-8 h-8 rounded-lg flex items-center justify-center
                            ${trade.type === "Buy" ? "bg-emerald-500/10" : "bg-red-500/10"}
                          `}
                        >
                          <TypeIcon
                            className={`w-4 h-4 ${
                              trade.type === "Buy" ? "text-emerald-400" : "text-red-400"
                            }`}
                          />
                        </div>

                        {/* Symbol Name */}
                        <span className="text-sm font-bold text-white">
                          {trade.symbol}
                        </span>

                        {/* Type Badge */}
                        <span
                          className={`
                            px-2 py-0.5 rounded text-[10px] font-bold uppercase
                            ${trade.type === "Buy"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-red-500/20 text-red-400"
                            }
                          `}
                        >
                          {trade.type}
                        </span>
                      </div>

                      {/* Volume */}
                      <span className="text-xs text-surface-400 font-medium">
                        {formatVolume(trade.volume)}
                      </span>
                    </div>

                    {/* Row 2: P/L and Time */}
                    <div className="flex items-center justify-between pl-10">
                      {/* Floating P/L */}
                      <motion.span
                        key={trade.profit.toFixed(2)}
                        initial={{ scale: 1.05 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                        className={`
                          text-base font-bold tabular-nums
                          ${isProfit ? "text-emerald-400" : "text-red-400"}
                        `}
                      >
                        {formatProfit(trade.profit)}
                      </motion.span>

                      {/* Time Since Opened */}
                      <div className="flex items-center gap-1 text-surface-500">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px] font-medium">
                          {formatTimeAgo(trade.openTime)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {trades.length > 0 && (
          <div className="px-4 py-2.5 border-t border-surface-800 bg-surface-900/50">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-surface-500">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
              <span className="text-[10px] text-surface-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Live
              </span>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
