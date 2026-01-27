"use client";

import { useState, useEffect } from "react";
import { Badge, Button, Select, Pagination, Skeleton, EmptyState } from "@/components/ui";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  TrendingUp,
  Gift,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";

interface Transaction {
  _id: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "PROFIT_SHARE" | "REFERRAL_REWARD" | "ADMIN_ADJUSTMENT" | "BONUS";
  amount: number;
  status: "PENDING" | "APPROVED" | "COMPLETED" | "FAILED" | "CANCELLED";
  createdAt: string;
  metadata?: {
    network?: string;
    txHash?: string;
    referredUser?: string;
    percentage?: number;
    description?: string;
    isCustom?: boolean;
  };
}

const TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "DEPOSIT", label: "Deposits" },
  { value: "WITHDRAWAL", label: "Withdrawals" },
  { value: "PROFIT_SHARE", label: "Profit Share" },
  { value: "REFERRAL_REWARD", label: "Referral Rewards" },
  { value: "ADMIN_ADJUSTMENT", label: "Adjustments" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "COMPLETED", label: "Completed" },
  { value: "FAILED", label: "Failed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "DEPOSIT":
      return <ArrowDownToLine className="w-4 h-4" />;
    case "WITHDRAWAL":
      return <ArrowUpFromLine className="w-4 h-4" />;
    case "PROFIT_SHARE":
      return <TrendingUp className="w-4 h-4" />;
    case "REFERRAL_REWARD":
      return <Gift className="w-4 h-4" />;
    case "ADMIN_ADJUSTMENT":
    case "BONUS":
      return <TrendingUp className="w-4 h-4" />;
    default:
      return <TrendingUp className="w-4 h-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "DEPOSIT":
      return "bg-green-500/20 text-green-400";
    case "WITHDRAWAL":
      return "bg-red-500/20 text-red-400";
    case "PROFIT_SHARE":
      return "bg-brand-500/20 text-brand-400";
    case "REFERRAL_REWARD":
      return "bg-purple-500/20 text-purple-400";
    case "ADMIN_ADJUSTMENT":
      return "bg-amber-500/20 text-amber-400";
    case "BONUS":
      return "bg-emerald-500/20 text-emerald-400";
    default:
      return "bg-surface-500/20 text-surface-400";
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "DEPOSIT":
      return "Deposit";
    case "WITHDRAWAL":
      return "Withdrawal";
    case "PROFIT_SHARE":
      return "Profit Share";
    case "REFERRAL_REWARD":
      return "Referral";
    case "ADMIN_ADJUSTMENT":
      return "Adjustment";
    case "BONUS":
      return "Bonus";
    default:
      return type;
  }
};

const getStatusVariant = (status: string): "success" | "warning" | "danger" | "info" => {
  switch (status) {
    case "APPROVED":
    case "COMPLETED":
      return "success";
    case "PENDING":
      return "warning";
    case "FAILED":
    case "CANCELLED":
      return "danger";
    default:
      return "info";
  }
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (typeFilter) params.append("type", typeFilter);
      if (statusFilter) params.append("status", statusFilter);

      const response = await fetch(`/api/transactions?${params}`);
      const data = await response.json();

      if (response.ok) {
        setTransactions(data.transactions || []);
        setTotalPages(data.pagination?.pages || 1);
        setTotal(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, typeFilter, statusFilter]);

  const handleExport = async () => {
    try {
      // Fetch all transactions for export
      const params = new URLSearchParams({ limit: "1000" });
      if (typeFilter) params.append("type", typeFilter);
      if (statusFilter) params.append("status", statusFilter);

      const response = await fetch(`/api/transactions?${params}`);
      const data = await response.json();

      if (!response.ok || !data.transactions?.length) {
        alert("No transactions to export");
        return;
      }

      // Create CSV content
      const headers = ["Date", "Type", "Amount", "Status", "Details"];
      const rows = data.transactions.map((tx: Transaction) => [
        formatDate(tx.createdAt),
        tx.type,
        tx.type === "WITHDRAWAL" ? `-$${tx.amount}` : `+$${tx.amount}`,
        tx.status,
        tx.metadata?.network || tx.metadata?.referredUser || "-",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row: string[]) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export transactions");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Transactions</h1>
          <p className="text-surface-400 mt-1">
            View your complete transaction history
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={fetchTransactions}
            variant="secondary"
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
          <Button
            onClick={handleExport}
            variant="secondary"
            icon={<Download className="w-4 h-4" />}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2 text-surface-400">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              options={TYPE_OPTIONS}
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
            />
            <Select
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-green-500/20">
              <ArrowDownToLine className="w-4 h-4 text-green-400" />
            </div>
            <span className="text-surface-400 text-sm">Deposits</span>
          </div>
          <p className="text-xl font-bold text-white">
            {transactions.filter((t) => t.type === "DEPOSIT").length}
          </p>
        </div>
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-red-500/20">
              <ArrowUpFromLine className="w-4 h-4 text-red-400" />
            </div>
            <span className="text-surface-400 text-sm">Withdrawals</span>
          </div>
          <p className="text-xl font-bold text-white">
            {transactions.filter((t) => t.type === "WITHDRAWAL").length}
          </p>
        </div>
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-brand-500/20">
              <TrendingUp className="w-4 h-4 text-brand-400" />
            </div>
            <span className="text-surface-400 text-sm">Profits</span>
          </div>
          <p className="text-xl font-bold text-white">
            {transactions.filter((t) => t.type === "PROFIT_SHARE").length}
          </p>
        </div>
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Gift className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-surface-400 text-sm">Referrals</span>
          </div>
          <p className="text-xl font-bold text-white">
            {transactions.filter((t) => t.type === "REFERRAL_REWARD").length}
          </p>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={<ArrowDownToLine className="w-12 h-12" />}
            title="No transactions found"
            description="Start by making a deposit to see your transaction history"
            action={{
              label: "Make a Deposit",
              href: "/deposit",
            }}
          />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-800">
                    <th className="text-left text-surface-400 font-medium p-4 text-sm">
                      Type
                    </th>
                    <th className="text-left text-surface-400 font-medium p-4 text-sm">
                      Amount
                    </th>
                    <th className="text-left text-surface-400 font-medium p-4 text-sm">
                      Status
                    </th>
                    <th className="text-left text-surface-400 font-medium p-4 text-sm">
                      Details
                    </th>
                    <th className="text-left text-surface-400 font-medium p-4 text-sm">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr
                      key={tx._id}
                      className="border-b border-surface-800 last:border-0 hover:bg-surface-800/50"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${getTypeColor(tx.type)}`}
                          >
                            {getTypeIcon(tx.type)}
                          </div>
                          <span className="text-white font-medium">
                            {getTypeLabel(tx.type)}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`font-semibold ${
                            tx.type === "WITHDRAWAL"
                              ? "text-red-400"
                              : "text-green-400"
                          }`}
                        >
                          {tx.type === "WITHDRAWAL" ? "-" : "+"}$
                          {tx.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge variant={getStatusVariant(tx.status)}>
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-surface-400 text-sm">
                        {tx.metadata?.network && (
                          <span>Network: {tx.metadata.network.toUpperCase()}</span>
                        )}
                        {tx.metadata?.percentage && (
                          <span>{tx.metadata.percentage}% rate</span>
                        )}
                        {tx.metadata?.referredUser && (
                          <span>Referral bonus</span>
                        )}
                        {tx.metadata?.description && !tx.metadata?.network && !tx.metadata?.referredUser && (
                          <span>{tx.metadata.description}</span>
                        )}
                        {tx.metadata?.isCustom && (
                          <Badge variant="info" className="ml-2 text-xs">Custom</Badge>
                        )}
                      </td>
                      <td className="p-4 text-surface-400 text-sm">
                        {formatDate(tx.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-surface-800">
              {transactions.map((tx) => (
                <div key={tx._id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${getTypeColor(tx.type)}`}
                      >
                        {getTypeIcon(tx.type)}
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {getTypeLabel(tx.type)}
                        </p>
                        <p className="text-surface-500 text-xs">
                          {formatDate(tx.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          tx.type === "WITHDRAWAL"
                            ? "text-red-400"
                            : "text-green-400"
                        }`}
                      >
                        {tx.type === "WITHDRAWAL" ? "-" : "+"}$
                        {tx.amount.toLocaleString()}
                      </p>
                      <Badge variant={getStatusVariant(tx.status)} className="mt-1">
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-surface-800 p-4">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
