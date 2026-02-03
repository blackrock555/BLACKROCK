"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { TradeNotification } from "@/components/ui";
import { generateRandomTrade } from "@/lib/mockData";
import { isWeekend } from "@/lib/utils/helpers";

interface UseTradeNotificationsOptions {
  minInterval?: number;
  maxInterval?: number;
  maxNotifications?: number;
}

export function useTradeNotifications({
  minInterval = 5000,
  maxInterval = 20000,
  maxNotifications = 3,
}: UseTradeNotificationsOptions = {}) {
  const [notifications, setNotifications] = useState<TradeNotification[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(true);

  const addNotification = useCallback(() => {
    if (!isActiveRef.current) return;
    if (isWeekend()) return;

    const trade = generateRandomTrade();
    const notification: TradeNotification = {
      id: trade.id,
      symbol: trade.symbol,
      direction: trade.direction,
      amount: trade.amount,
      profit: trade.profit,
      timestamp: trade.timestamp,
    };

    setNotifications((prev) => {
      const newNotifications = [notification, ...prev];
      return newNotifications.slice(0, maxNotifications);
    });

    scheduleNextNotification();
  }, [maxNotifications]);

  const scheduleNextNotification = useCallback(() => {
    if (!isActiveRef.current) return;
    if (isWeekend()) return;

    const randomDelay =
      Math.floor(Math.random() * (maxInterval - minInterval)) + minInterval;

    timeoutRef.current = setTimeout(() => {
      addNotification();
    }, randomDelay);
  }, [minInterval, maxInterval, addNotification]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  useEffect(() => {
    // Don't start notifications on weekends
    if (isWeekend()) return;

    isActiveRef.current = true;

    // Start the first notification after a short delay
    const initialDelay = setTimeout(() => {
      addNotification();
    }, 3000);

    return () => {
      isActiveRef.current = false;
      clearTimeout(initialDelay);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [addNotification]);

  return {
    notifications,
    removeNotification,
  };
}
