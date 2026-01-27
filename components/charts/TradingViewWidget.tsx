"use client";

import { useEffect, useRef, memo } from "react";

interface TradingViewWidgetProps {
  symbol?: string;
  height?: number;
}

function TradingViewWidget({
  symbol = "OANDA:XAUUSD",
  height = 450,
}: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetInitialized = useRef(false);

  useEffect(() => {
    // Prevent double initialization in React strict mode
    if (widgetInitialized.current) return;
    if (!containerRef.current) return;

    widgetInitialized.current = true;

    // Create unique ID for this widget instance
    const containerId = `tradingview_${Math.random().toString(36).substring(7)}`;

    // Create the widget container div
    const widgetContainer = document.createElement("div");
    widgetContainer.id = containerId;
    widgetContainer.style.height = "100%";
    widgetContainer.style.width = "100%";
    containerRef.current.appendChild(widgetContainer);

    // Load TradingView library
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      // @ts-expect-error - TradingView is loaded globally
      if (typeof TradingView !== "undefined" && document.getElementById(containerId)) {
        // @ts-expect-error - TradingView widget constructor
        new TradingView.widget({
          container_id: containerId,
          symbol: symbol,
          interval: "15",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#0d0d0d",
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          hide_volume: true,
          allow_symbol_change: false,
          backgroundColor: "rgba(13, 13, 13, 1)",
          gridColor: "rgba(30, 30, 30, 0.6)",
          autosize: true,
        });
      }
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
      widgetInitialized.current = false;
    };
  }, [symbol]);

  return (
    <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#1a1a1a] bg-[#111111]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <span className="text-[10px] font-bold text-black">XAU</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold text-lg">XAUUSD</h3>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/20 text-emerald-400">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  LIVE
                </span>
              </div>
              <span className="text-surface-500 text-xs">Gold Spot / US Dollar • Real-Time Chart</span>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-surface-500">
            <span>Powered by</span>
            <span className="text-surface-400 font-medium">TradingView</span>
          </div>
        </div>
      </div>

      {/* TradingView Chart Container */}
      <div
        ref={containerRef}
        style={{ height: `${height}px` }}
        className="w-full bg-[#0d0d0d]"
      />
    </div>
  );
}

export default memo(TradingViewWidget);
