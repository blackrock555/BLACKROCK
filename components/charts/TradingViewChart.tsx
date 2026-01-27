"use client";

import { useEffect, useRef, memo } from "react";

interface TradingViewChartProps {
  symbol?: string;
  interval?: string;
  theme?: "dark" | "light";
  height?: number;
  autosize?: boolean;
}

function TradingViewChart({
  symbol = "OANDA:XAUUSD",
  interval = "15",
  theme = "dark",
  height = 400,
  autosize = true,
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (!containerRef.current || scriptLoaded.current) return;

    // Create a unique container ID
    const containerId = `tradingview_${Math.random().toString(36).substring(7)}`;
    containerRef.current.id = containerId;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: autosize,
      symbol: symbol,
      interval: interval,
      timezone: "Etc/UTC",
      theme: theme,
      style: "1",
      locale: "en",
      allow_symbol_change: false,
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      calendar: false,
      hide_volume: true,
      support_host: "https://www.tradingview.com",
      backgroundColor: theme === "dark" ? "rgba(10, 10, 10, 1)" : "rgba(255, 255, 255, 1)",
      gridColor: theme === "dark" ? "rgba(30, 30, 30, 0.5)" : "rgba(200, 200, 200, 0.5)",
      container_id: containerId,
    });

    containerRef.current.appendChild(script);
    scriptLoaded.current = true;

    return () => {
      scriptLoaded.current = false;
    };
  }, [symbol, interval, theme, autosize]);

  return (
    <div className="tradingview-widget-container rounded-xl overflow-hidden border border-surface-800">
      <div
        ref={containerRef}
        className="tradingview-widget-container__widget"
        style={{ height: autosize ? "100%" : height, minHeight: height }}
      />
    </div>
  );
}

export default memo(TradingViewChart);
