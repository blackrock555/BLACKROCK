"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Maximize2,
  Clock,
  DollarSign,
  Activity,
  ChevronUp,
  ChevronDown
} from "lucide-react";

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface Trade {
  id: string;
  type: "BUY" | "SELL";
  openPrice: number;
  closePrice: number;
  openTime: number;
  closeTime: number;
  lots: number;
  profit: number;
  status: "OPEN" | "CLOSED";
}

// Get realistic XAUUSD base price with market-like variation
function getRealisticBasePrice(): number {
  // Current gold price range (late 2024/early 2025) - approximately $2,600-$2,700
  const basePrice = 2655;
  // Add slight daily variation (-0.5% to +0.5%)
  const dailyVariation = (Math.random() - 0.5) * 0.01 * basePrice;
  return parseFloat((basePrice + dailyVariation).toFixed(2));
}

// Generate realistic price movement based on market behavior
function generateRealisticCandles(basePrice: number, count: number): Candle[] {
  const candles: Candle[] = [];
  let currentPrice = basePrice;
  const now = Date.now();

  // Gold typically moves 0.01-0.05% per minute with occasional spikes
  for (let i = count - 1; i >= 0; i--) {
    const volatility = 0.0003 + Math.random() * 0.0004; // 0.03-0.07% volatility
    const trend = Math.sin(i / 10) * 0.0001; // Slight wave pattern
    const noise = (Math.random() - 0.5) * 2;

    const change = currentPrice * volatility * noise + currentPrice * trend;
    const open = currentPrice;
    currentPrice = Math.max(2500, Math.min(2800, currentPrice + change));
    const close = currentPrice;

    const range = Math.abs(close - open) + currentPrice * 0.0002;
    const high = Math.max(open, close) + Math.random() * range;
    const low = Math.min(open, close) - Math.random() * range;

    candles.push({
      time: now - i * 60000, // 1 minute candles
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2))
    });
  }

  return candles;
}

// Generate MT5-style trade history
function generateTradeHistory(candles: Candle[]): Trade[] {
  const trades: Trade[] = [];
  const tradeCount = 4 + Math.floor(Math.random() * 3);

  for (let i = 0; i < tradeCount; i++) {
    const openIdx = Math.floor(Math.random() * (candles.length - 15)) + 5;
    const duration = 3 + Math.floor(Math.random() * 10);
    const closeIdx = Math.min(openIdx + duration, candles.length - 1);

    const type = Math.random() > 0.5 ? "BUY" : "SELL";
    const openCandle = candles[openIdx];
    const closeCandle = candles[closeIdx];

    const openPrice = openCandle.close;
    const closePrice = closeCandle.close;
    const lots = parseFloat((0.01 + Math.random() * 0.09).toFixed(2));

    // Calculate profit: for gold, 1 lot = 100 oz, pip value ~$1 per 0.01 move
    const priceDiff = type === "BUY" ? closePrice - openPrice : openPrice - closePrice;
    const profit = parseFloat((priceDiff * lots * 100).toFixed(2));

    trades.push({
      id: `trade-${i}`,
      type,
      openPrice,
      closePrice,
      openTime: openCandle.time,
      closeTime: closeCandle.time,
      lots,
      profit,
      status: closeIdx >= candles.length - 3 ? "OPEN" : "CLOSED"
    });
  }

  return trades.sort((a, b) => a.openTime - b.openTime);
}

export default function XAUUSDChart() {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [isConnected, setIsConnected] = useState(true);
  const chartRef = useRef<HTMLDivElement>(null);
  const basePrice = useRef<number>(2655);

  // Initialize chart data
  const initializeData = useCallback(() => {
    setIsLoading(true);

    // Get realistic market price
    basePrice.current = getRealisticBasePrice();

    const initialCandles = generateRealisticCandles(basePrice.current, 60);
    setCandles(initialCandles);
    setTrades(generateTradeHistory(initialCandles));
    setCurrentPrice(initialCandles[initialCandles.length - 1].close);
    setLastUpdate(new Date());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // Real-time price updates
  useEffect(() => {
    if (candles.length === 0) return;

    const interval = setInterval(() => {
      setCandles(prev => {
        if (prev.length === 0) return prev;

        const lastCandle = prev[prev.length - 1];
        const now = Date.now();
        const timeSinceLastCandle = now - lastCandle.time;

        // Update current candle or create new one every minute
        if (timeSinceLastCandle >= 60000) {
          // New candle
          const volatility = 0.0002 + Math.random() * 0.0003;
          const change = lastCandle.close * volatility * (Math.random() - 0.5) * 2;
          const newPrice = Math.max(2500, Math.min(2800, lastCandle.close + change));

          const newCandle: Candle = {
            time: now,
            open: lastCandle.close,
            high: Math.max(lastCandle.close, newPrice) + Math.random() * 0.5,
            low: Math.min(lastCandle.close, newPrice) - Math.random() * 0.5,
            close: parseFloat(newPrice.toFixed(2))
          };

          setCurrentPrice(newCandle.close);
          setPriceChange(newCandle.close - prev[0].close);
          setLastUpdate(new Date());

          return [...prev.slice(1), newCandle];
        } else {
          // Update current candle
          const volatility = 0.00005 + Math.random() * 0.0001;
          const tick = lastCandle.close * volatility * (Math.random() - 0.5) * 2;
          const newClose = parseFloat((lastCandle.close + tick).toFixed(2));

          const updatedCandle = {
            ...lastCandle,
            high: Math.max(lastCandle.high, newClose),
            low: Math.min(lastCandle.low, newClose),
            close: newClose
          };

          setCurrentPrice(newClose);
          setPriceChange(newClose - prev[0].close);

          return [...prev.slice(0, -1), updatedCandle];
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [candles.length]);

  // Chart calculations
  const chartWidth = 800;
  const chartHeight = 320;
  const padding = { top: 20, right: 80, bottom: 30, left: 10 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const priceExtent = candles.length > 0 ? {
    min: Math.min(...candles.map(c => c.low)) - 1,
    max: Math.max(...candles.map(c => c.high)) + 1
  } : { min: 2650, max: 2660 };

  const priceScale = (price: number) => {
    return padding.top + ((priceExtent.max - price) / (priceExtent.max - priceExtent.min)) * innerHeight;
  };

  const timeScale = (index: number) => {
    return padding.left + (index / (candles.length - 1)) * innerWidth;
  };

  const candleWidth = Math.max(2, (innerWidth / candles.length) * 0.7);

  // Calculate stats
  const totalProfit = trades.reduce((sum, t) => sum + t.profit, 0);
  const winningTrades = trades.filter(t => t.profit > 0).length;
  const winRate = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0;
  const openTrades = trades.filter(t => t.status === "OPEN").length;

  if (isLoading) {
    return (
      <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl overflow-hidden">
        <div className="p-6 flex items-center justify-center h-[500px]">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="w-8 h-8 text-cyan-500 animate-spin" />
            <span className="text-surface-400 text-sm">Loading market data...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#1a1a1a] bg-[#111111]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Symbol Info */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <span className="text-[10px] font-bold text-black">XAU</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-bold text-lg">XAUUSD</h3>
                  <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium ${
                    isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    <Activity className="w-3 h-3" />
                    {isConnected ? 'LIVE' : 'OFFLINE'}
                  </span>
                </div>
                <span className="text-surface-500 text-xs">Gold vs US Dollar • M1</span>
              </div>
            </div>
          </div>

          {/* Price Display */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight">
                  {currentPrice.toFixed(2)}
                </span>
                <div className={`flex items-center gap-0.5 px-2 py-1 rounded ${
                  priceChange >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  {priceChange >= 0 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  <span className="text-sm font-semibold">
                    {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 text-xs text-surface-500 mt-0.5">
                <Clock className="w-3 h-3" />
                <span>{lastUpdate.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div ref={chartRef} className="relative p-2 sm:p-4 bg-[#0a0a0a]">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-[250px] sm:h-[320px]"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Grid pattern */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1a1a1a" strokeWidth="0.5"/>
            </pattern>

            {/* Gradients for candles */}
            <linearGradient id="bullGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="1"/>
              <stop offset="100%" stopColor="#059669" stopOpacity="1"/>
            </linearGradient>
            <linearGradient id="bearGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="1"/>
              <stop offset="100%" stopColor="#dc2626" stopOpacity="1"/>
            </linearGradient>
          </defs>

          {/* Background grid */}
          <rect width={chartWidth} height={chartHeight} fill="url(#grid)" />

          {/* Price grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding.top + ratio * innerHeight;
            const price = priceExtent.max - ratio * (priceExtent.max - priceExtent.min);
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="#1f1f1f"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={chartWidth - padding.right + 5}
                  y={y + 4}
                  fill="#666"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {price.toFixed(2)}
                </text>
              </g>
            );
          })}

          {/* Candlesticks */}
          {candles.map((candle, i) => {
            const x = timeScale(i);
            const isBull = candle.close >= candle.open;
            const bodyTop = priceScale(Math.max(candle.open, candle.close));
            const bodyBottom = priceScale(Math.min(candle.open, candle.close));
            const bodyHeight = Math.max(1, bodyBottom - bodyTop);

            return (
              <g key={i}>
                {/* Wick */}
                <line
                  x1={x}
                  y1={priceScale(candle.high)}
                  x2={x}
                  y2={priceScale(candle.low)}
                  stroke={isBull ? '#10b981' : '#ef4444'}
                  strokeWidth="1"
                />
                {/* Body */}
                <rect
                  x={x - candleWidth / 2}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={isBull ? 'url(#bullGradient)' : 'url(#bearGradient)'}
                  rx="1"
                />
              </g>
            );
          })}

          {/* Trade markers - MT5 Style */}
          {trades.map((trade) => {
            const openIndex = candles.findIndex(c => c.time >= trade.openTime);
            const closeIndex = candles.findIndex(c => c.time >= trade.closeTime);

            if (openIndex === -1) return null;

            const openX = timeScale(openIndex);
            const openY = priceScale(trade.openPrice);
            const closeX = closeIndex !== -1 ? timeScale(closeIndex) : timeScale(candles.length - 1);
            const closeY = closeIndex !== -1 ? priceScale(trade.closePrice) : priceScale(candles[candles.length - 1].close);

            const isBuy = trade.type === "BUY";
            const isProfit = trade.profit >= 0;
            const color = isBuy ? '#3b82f6' : '#f97316';

            return (
              <g
                key={trade.id}
                className="cursor-pointer"
                onClick={() => setSelectedTrade(selectedTrade?.id === trade.id ? null : trade)}
              >
                {/* Connection line */}
                <line
                  x1={openX}
                  y1={openY}
                  x2={closeX}
                  y2={closeY}
                  stroke={color}
                  strokeWidth="1.5"
                  strokeDasharray={trade.status === "OPEN" ? "4 2" : "0"}
                  opacity="0.8"
                />

                {/* Open marker - Arrow */}
                <g transform={`translate(${openX}, ${openY})`}>
                  <polygon
                    points={isBuy ? "0,-8 -6,4 6,4" : "0,8 -6,-4 6,-4"}
                    fill={color}
                    stroke="#0a0a0a"
                    strokeWidth="1"
                  />
                </g>

                {/* Close marker - X or circle for open */}
                <g transform={`translate(${closeX}, ${closeY})`}>
                  {trade.status === "CLOSED" ? (
                    <>
                      <line x1="-4" y1="-4" x2="4" y2="4" stroke={isProfit ? '#10b981' : '#ef4444'} strokeWidth="2"/>
                      <line x1="4" y1="-4" x2="-4" y2="4" stroke={isProfit ? '#10b981' : '#ef4444'} strokeWidth="2"/>
                    </>
                  ) : (
                    <circle r="5" fill="none" stroke={color} strokeWidth="2" strokeDasharray="3 2"/>
                  )}
                </g>

                {/* Profit label */}
                {trade.status === "CLOSED" && (
                  <g transform={`translate(${(openX + closeX) / 2}, ${Math.min(openY, closeY) - 12})`}>
                    <rect
                      x="-24"
                      y="-10"
                      width="48"
                      height="16"
                      rx="3"
                      fill={isProfit ? '#10b981' : '#ef4444'}
                      opacity="0.9"
                    />
                    <text
                      textAnchor="middle"
                      y="2"
                      fill="white"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      {isProfit ? '+' : ''}{trade.profit.toFixed(0)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Current price line */}
          <g>
            <line
              x1={padding.left}
              y1={priceScale(currentPrice)}
              x2={chartWidth - padding.right}
              y2={priceScale(currentPrice)}
              stroke={priceChange >= 0 ? '#10b981' : '#ef4444'}
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            <rect
              x={chartWidth - padding.right}
              y={priceScale(currentPrice) - 10}
              width="65"
              height="20"
              rx="3"
              fill={priceChange >= 0 ? '#10b981' : '#ef4444'}
            />
            <text
              x={chartWidth - padding.right + 32}
              y={priceScale(currentPrice) + 4}
              textAnchor="middle"
              fill="white"
              fontSize="10"
              fontWeight="bold"
              fontFamily="monospace"
            >
              {currentPrice.toFixed(2)}
            </text>
          </g>

          {/* Time labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const index = Math.floor(ratio * (candles.length - 1));
            if (!candles[index]) return null;
            const x = timeScale(index);
            const time = new Date(candles[index].time);
            return (
              <text
                key={i}
                x={x}
                y={chartHeight - 8}
                textAnchor="middle"
                fill="#666"
                fontSize="9"
                fontFamily="monospace"
              >
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </text>
            );
          })}
        </svg>

        {/* Selected trade tooltip */}
        <AnimatePresence>
          {selectedTrade && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-4 left-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 shadow-xl z-10 min-w-[180px]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  selectedTrade.type === "BUY" ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'
                }`}>
                  {selectedTrade.type}
                </span>
                <span className={`text-xs font-medium ${
                  selectedTrade.status === "OPEN" ? 'text-cyan-400' : 'text-surface-400'
                }`}>
                  {selectedTrade.status}
                </span>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-surface-500">Volume:</span>
                  <span className="text-white font-mono">{selectedTrade.lots} lots</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">Open:</span>
                  <span className="text-white font-mono">{selectedTrade.openPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500">Close:</span>
                  <span className="text-white font-mono">{selectedTrade.closePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#2a2a2a]">
                  <span className="text-surface-500">P/L:</span>
                  <span className={`font-bold font-mono ${
                    selectedTrade.profit >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {selectedTrade.profit >= 0 ? '+' : ''}${selectedTrade.profit.toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Trade History Panel - MT5 Style */}
      <div className="border-t border-[#1a1a1a]">
        {/* Stats Bar */}
        <div className="px-4 py-2 bg-[#111111] flex flex-wrap items-center gap-4 sm:gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-surface-500">Trades:</span>
            <span className="text-white font-semibold">{trades.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-surface-500">Open:</span>
            <span className="text-cyan-400 font-semibold">{openTrades}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-surface-500">Win Rate:</span>
            <span className="text-emerald-400 font-semibold">{winRate.toFixed(0)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-surface-500">Balance:</span>
            <span className={`font-bold ${totalProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {totalProfit >= 0 ? '+' : ''}${totalProfit.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Trade List */}
        <div className="max-h-[200px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="bg-[#0d0d0d] sticky top-0">
              <tr className="text-surface-500 text-left">
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium hidden sm:table-cell">Volume</th>
                <th className="px-3 py-2 font-medium">Open</th>
                <th className="px-3 py-2 font-medium">Close</th>
                <th className="px-3 py-2 font-medium text-right">P/L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]">
              {trades.map((trade) => (
                <motion.tr
                  key={trade.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`hover:bg-[#1a1a1a] transition-colors cursor-pointer ${
                    selectedTrade?.id === trade.id ? 'bg-[#1a1a1a]' : ''
                  }`}
                  onClick={() => setSelectedTrade(selectedTrade?.id === trade.id ? null : trade)}
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded flex items-center justify-center ${
                        trade.type === "BUY" ? 'bg-blue-500/20' : 'bg-orange-500/20'
                      }`}>
                        {trade.type === "BUY" ? (
                          <TrendingUp className="w-3 h-3 text-blue-400" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-orange-400" />
                        )}
                      </div>
                      <span className={`font-semibold ${
                        trade.type === "BUY" ? 'text-blue-400' : 'text-orange-400'
                      }`}>
                        {trade.type}
                      </span>
                      {trade.status === "OPEN" && (
                        <span className="px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded text-[10px]">
                          OPEN
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-white font-mono hidden sm:table-cell">
                    {trade.lots}
                  </td>
                  <td className="px-3 py-2.5 text-white font-mono">
                    {trade.openPrice.toFixed(2)}
                  </td>
                  <td className="px-3 py-2.5 text-white font-mono">
                    {trade.status === "OPEN" ? '—' : trade.closePrice.toFixed(2)}
                  </td>
                  <td className={`px-3 py-2.5 text-right font-bold font-mono ${
                    trade.profit >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 border-t border-[#1a1a1a] bg-[#0d0d0d] flex flex-wrap gap-4 text-[10px] text-surface-500">
        <div className="flex items-center gap-1.5">
          <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-blue-500" />
          <span>Buy Entry</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent border-t-orange-500" />
          <span>Sell Entry</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-emerald-400 font-bold">×</span>
          <span>Profit Close</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-red-400 font-bold">×</span>
          <span>Loss Close</span>
        </div>
      </div>
    </div>
  );
}
