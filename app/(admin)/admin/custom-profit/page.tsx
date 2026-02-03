"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Skeleton, Modal } from "@/components/ui";
import {
  HandCoins,
  RefreshCw,
  DollarSign,
  Hash,
  Search,
  X,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
} from "lucide-react";

interface UserResult {
  _id: string;
  name: string;
  email: string;
  balance: number;
  depositBalance: number;
}

interface CustomProfitEntry {
  _id: string;
  userId: { _id: string; name: string; email: string } | null;
  createdBy: { _id: string; name: string; email: string } | null;
  amount: number;
  percentage: number;
  balanceSnapshot: number;
  createdAt: string;
}

interface Stats {
  allTimeTotal: number;
  allTimeCount: number;
  todayTotal: number;
  todayCount: number;
}

export default function AdminCustomProfitPage() {
  // Data state
  const [entries, setEntries] = useState<CustomProfitEntry[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Form state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Feedback state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Confirmation modal
  const [showConfirm, setShowConfirm] = useState(false);

  // Refs
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch history data
  const fetchData = useCallback(async (p = 1) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/custom-profit?page=${p}&limit=20`);
      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries || []);
        setStats(data.stats || null);
        setTotalPages(data.pagination?.pages || 1);
        setPage(data.pagination?.page || 1);
      }
    } catch (error) {
      console.error("Failed to fetch custom profit data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // User search with debounce
  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/admin/users?search=${encodeURIComponent(query.trim())}&limit=10`
        );
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.users || []);
          setShowDropdown(true);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const selectUser = (user: UserResult) => {
    setSelectedUser(user);
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
  };

  const clearUser = () => {
    setSelectedUser(null);
    setSearchQuery("");
  };

  const clearFeedback = () => {
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  // Submit handler
  const handleSubmit = () => {
    clearFeedback();

    if (!selectedUser) {
      setErrorMessage("Please select a user");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setErrorMessage("Please enter a valid amount greater than $0");
      return;
    }

    if (parsedAmount > 1000000) {
      setErrorMessage("Amount cannot exceed $1,000,000");
      return;
    }

    setShowConfirm(true);
  };

  const confirmSubmit = async () => {
    setShowConfirm(false);
    setIsSubmitting(true);
    clearFeedback();

    try {
      const response = await fetch("/api/admin/custom-profit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser!._id,
          amount: parseFloat(amount),
          note: note.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message || "Profit distributed successfully");
        setSelectedUser(null);
        setAmount("");
        setNote("");
        fetchData();
      } else {
        setErrorMessage(data.error || "Failed to distribute profit");
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Custom Profit</h1>
          <p className="text-surface-400 mt-1">
            Distribute direct profit share amounts to individual users
          </p>
        </div>
        <button
          onClick={() => fetchData()}
          className="flex items-center gap-2 px-4 py-2 bg-surface-700 hover:bg-surface-600 text-white rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-900 border border-surface-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <DollarSign className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-surface-400 text-sm">Total Distributed</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(stats?.allTimeTotal || 0)}
            </p>
          </div>

          <div className="bg-surface-900 border border-surface-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-brand-500/20">
                <Hash className="w-5 h-5 text-brand-400" />
              </div>
              <span className="text-surface-400 text-sm">Total Count</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {stats?.allTimeCount || 0}
            </p>
          </div>

          <div className="bg-surface-900 border border-surface-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <DollarSign className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-surface-400 text-sm">Today&apos;s Distributed</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {formatCurrency(stats?.todayTotal || 0)}
            </p>
          </div>

          <div className="bg-surface-900 border border-surface-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Hash className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-surface-400 text-sm">Today&apos;s Count</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {stats?.todayCount || 0}
            </p>
          </div>
        </div>
      )}

      {/* Feedback Banners */}
      {successMessage && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          <p className="text-green-200 text-sm flex-1">{successMessage}</p>
          <button onClick={() => setSuccessMessage(null)} className="text-green-400 hover:text-green-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-200 text-sm flex-1">{errorMessage}</p>
          <button onClick={() => setErrorMessage(null)} className="text-red-400 hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Distribution Form */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-brand-500/20">
            <HandCoins className="w-5 h-5 text-brand-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Distribute Profit</h2>
        </div>

        <div className="space-y-5">
          {/* User Search */}
          <div>
            <label className="block text-surface-400 text-sm font-medium mb-2">
              Select User
            </label>
            {selectedUser ? (
              <div className="bg-surface-800 border border-surface-700 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-sm">
                    {(selectedUser.name || selectedUser.email)[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium">{selectedUser.name || "Unnamed"}</p>
                    <p className="text-surface-500 text-sm">{selectedUser.email}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 ml-4">
                    <div>
                      <p className="text-surface-500 text-xs">Balance</p>
                      <p className="text-white text-sm font-medium">{formatCurrency(selectedUser.balance || 0)}</p>
                    </div>
                    <div>
                      <p className="text-surface-500 text-xs">Deposit Balance</p>
                      <p className="text-white text-sm font-medium">{formatCurrency(selectedUser.depositBalance || 0)}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={clearUser}
                  className="p-2 hover:bg-surface-700 rounded-lg transition-colors text-surface-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div ref={searchRef} className="relative">
                <div className="relative">
                  <Search className="w-4 h-4 text-surface-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full bg-surface-800 border border-surface-700 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 placeholder:text-surface-600"
                  />
                  {isSearching && (
                    <RefreshCw className="w-4 h-4 text-surface-500 absolute right-3 top-1/2 -translate-y-1/2 animate-spin" />
                  )}
                </div>

                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-surface-800 border border-surface-700 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                    {searchResults.map((user) => (
                      <button
                        key={user._id}
                        onClick={() => selectUser(user)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-700 transition-colors text-left border-b border-surface-700/50 last:border-0"
                      >
                        <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-xs flex-shrink-0">
                          {(user.name || user.email)[0].toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white text-sm font-medium truncate">{user.name || "Unnamed"}</p>
                          <p className="text-surface-500 text-xs truncate">{user.email}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-surface-400 text-xs">Balance</p>
                          <p className="text-white text-xs font-medium">{formatCurrency(user.balance || 0)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {showDropdown && searchResults.length === 0 && searchQuery.trim().length >= 2 && !isSearching && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-surface-800 border border-surface-700 rounded-lg p-4 text-center">
                    <p className="text-surface-500 text-sm">No users found</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-surface-400 text-sm font-medium mb-2">
              Amount (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500 font-medium">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0.01"
                max="1000000"
                step="0.01"
                className="w-full bg-surface-800 border border-surface-700 rounded-lg pl-8 pr-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 placeholder:text-surface-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          {/* Note Input */}
          <div>
            <label className="block text-surface-400 text-sm font-medium mb-2">
              Note <span className="text-surface-600">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Reason for this profit distribution..."
              rows={2}
              maxLength={500}
              className="w-full bg-surface-800 border border-surface-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 placeholder:text-surface-600 resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedUser || !amount}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Distributing...
              </>
            ) : (
              <>
                <HandCoins className="w-4 h-4" />
                Distribute Profit
              </>
            )}
          </button>
        </div>
      </div>

      {/* Recent Distributions Table */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-surface-800">
          <h2 className="text-lg font-semibold text-white">
            Recent Custom Distributions
          </h2>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-surface-800 rounded-xl flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-surface-600" />
            </div>
            <p className="text-surface-500">No custom distributions yet</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-800">
                    <th className="text-left text-surface-400 font-medium p-4 text-sm">User</th>
                    <th className="text-left text-surface-400 font-medium p-4 text-sm">Amount</th>
                    <th className="text-left text-surface-400 font-medium p-4 text-sm hidden md:table-cell">Note</th>
                    <th className="text-left text-surface-400 font-medium p-4 text-sm hidden sm:table-cell">Applied By</th>
                    <th className="text-left text-surface-400 font-medium p-4 text-sm">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry._id} className="border-b border-surface-800 last:border-0">
                      <td className="p-4">
                        <div>
                          <p className="text-white font-medium text-sm">
                            {entry.userId?.name || "Unknown"}
                          </p>
                          <p className="text-surface-500 text-xs">
                            {entry.userId?.email || ""}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-green-400 font-semibold">
                          +{formatCurrency(entry.amount)}
                        </span>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <span className="text-surface-400 text-sm truncate max-w-[200px] block">
                          {entry.balanceSnapshot > 0 ? `${entry.percentage.toFixed(2)}% of deposit` : "-"}
                        </span>
                      </td>
                      <td className="p-4 hidden sm:table-cell">
                        <span className="text-surface-300 text-sm">
                          {entry.createdBy?.name || entry.createdBy?.email || "System"}
                        </span>
                      </td>
                      <td className="p-4 text-surface-400 text-sm">
                        {formatDate(entry.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-surface-800">
                <p className="text-surface-500 text-sm">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchData(page - 1)}
                    disabled={page <= 1}
                    className="flex items-center gap-1 px-3 py-1.5 bg-surface-800 hover:bg-surface-700 text-surface-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                  </button>
                  <button
                    onClick={() => fetchData(page + 1)}
                    disabled={page >= totalPages}
                    className="flex items-center gap-1 px-3 py-1.5 bg-surface-800 hover:bg-surface-700 text-surface-300 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirm Profit Distribution"
        size="md"
      >
        <div className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-amber-200 text-sm">
              This action will immediately credit the user&apos;s balance. This cannot be undone.
            </p>
          </div>

          <div className="bg-surface-800 rounded-lg p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-surface-400 text-sm">User</span>
              <span className="text-white text-sm font-medium">
                {selectedUser?.name || selectedUser?.email}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-surface-400 text-sm">Email</span>
              <span className="text-surface-300 text-sm">{selectedUser?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-surface-400 text-sm">Current Balance</span>
              <span className="text-surface-300 text-sm">
                {formatCurrency(selectedUser?.balance || 0)}
              </span>
            </div>
            <div className="border-t border-surface-700 pt-3 flex justify-between">
              <span className="text-surface-400 text-sm">Profit Amount</span>
              <span className="text-green-400 text-sm font-bold">
                +{formatCurrency(parseFloat(amount) || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-surface-400 text-sm">New Balance</span>
              <span className="text-white text-sm font-bold">
                {formatCurrency((selectedUser?.balance || 0) + (parseFloat(amount) || 0))}
              </span>
            </div>
            {note.trim() && (
              <div className="border-t border-surface-700 pt-3">
                <span className="text-surface-400 text-sm block mb-1">Note</span>
                <span className="text-surface-300 text-sm">{note}</span>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setShowConfirm(false)}
              className="flex-1 px-4 py-2.5 bg-surface-700 hover:bg-surface-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmSubmit}
              className="flex-1 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
            >
              <HandCoins className="w-4 h-4" />
              Confirm Distribution
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
