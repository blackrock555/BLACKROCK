// Mock data for the dashboard

export const userName = "Muhammad Hamza";

// Balance chart data - last 14 days
export const balanceData = [
  { date: "Jan 1", balance: 42500 },
  { date: "Jan 2", balance: 43200 },
  { date: "Jan 3", balance: 42800 },
  { date: "Jan 4", balance: 44100 },
  { date: "Jan 5", balance: 44800 },
  { date: "Jan 6", balance: 45200 },
  { date: "Jan 7", balance: 44600 },
  { date: "Jan 8", balance: 45900 },
  { date: "Jan 9", balance: 46300 },
  { date: "Jan 10", balance: 47100 },
  { date: "Jan 11", balance: 46800 },
  { date: "Jan 12", balance: 48200 },
  { date: "Jan 13", balance: 49100 },
  { date: "Jan 14", balance: 50247 },
];

export const currentBalance = 50247.83;
export const balanceChange = 2.3;

// Growth chart data - last 6 months
export const growthData = [
  { month: "Aug", growth: 4.2 },
  { month: "Sep", growth: -1.8 },
  { month: "Oct", growth: 6.5 },
  { month: "Nov", growth: 3.2 },
  { month: "Dec", growth: 8.1 },
  { month: "Jan", growth: 12.4 },
];

export const currentGrowth = 12.4;

// Performance stats
export const performanceStats = {
  totalDeposit: 125000,
  depositChange: 15.3,
  totalWithdrawal: 45000,
  withdrawalChange: -8.2,
  profitShare: 28500,
  profitShareChange: 22.1,
  totalROI: 34.8,
  roiChange: 5.6,
};

// Running trades
export const runningTrades = [
  {
    id: "1",
    symbol: "BTC/USDT",
    type: "Buy" as const,
    amount: "$2,450.00",
    lot: "0.05",
    time: "just now",
  },
  {
    id: "2",
    symbol: "ETH/USDT",
    type: "Sell" as const,
    amount: "$1,820.50",
    lot: "0.8",
    time: "2m ago",
  },
  {
    id: "3",
    symbol: "XRP/USDT",
    type: "Buy" as const,
    amount: "$580.00",
    lot: "1200",
    time: "5m ago",
  },
  {
    id: "4",
    symbol: "SOL/USDT",
    type: "Buy" as const,
    amount: "$945.25",
    lot: "12.5",
    time: "8m ago",
  },
  {
    id: "5",
    symbol: "DOGE/USDT",
    type: "Sell" as const,
    amount: "$320.00",
    lot: "5000",
    time: "12m ago",
  },
];

// Random trade data for notifications
export const tradingPairs = [
  "BTC/USDT",
  "ETH/USDT",
  "XRP/USDT",
  "SOL/USDT",
  "DOGE/USDT",
  "ADA/USDT",
  "AVAX/USDT",
  "MATIC/USDT",
  "DOT/USDT",
  "LINK/USDT",
];

export function generateRandomTrade() {
  const symbol = tradingPairs[Math.floor(Math.random() * tradingPairs.length)];
  const direction = Math.random() > 0.5 ? "Buy" : "Sell";
  const amount = (Math.random() * 5000 + 100).toFixed(2);
  const profit = (Math.random() * 400 - 100).toFixed(2);

  return {
    id: `trade-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    symbol,
    direction: direction as "Buy" | "Sell",
    amount: `$${amount}`,
    profit: parseFloat(profit),
    timestamp: new Date(),
  };
}
