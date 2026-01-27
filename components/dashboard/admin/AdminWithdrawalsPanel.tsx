"use client";

import { useState, useEffect } from "react";
import { Badge, Button, Modal, Skeleton, Pagination } from "@/components/ui";
import {
  ArrowUpFromLine,
  Eye,
  Check,
  X,
  RefreshCw,
  Copy,
  ArrowLeft,
} from "lucide-react";

interface Withdrawal {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    balance: number;
  };
  amount: number;
  fee: number;
  netAmount: number;
  network: string;
  toAddress: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNote?: string;
  createdAt: string;
}

interface AdminWithdrawalsPanelProps {
  onBack: () => void;
}

export function AdminWithdrawalsPanel({ onBack }: AdminWithdrawalsPanelProps) {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const fetchWithdrawals = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/withdrawals?page=${page}&status=PENDING`);
      const data = await response.json();
      if (response.ok) {
        setWithdrawals(data.withdrawals || []);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch withdrawals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [page]);

  const handleApprove = async (withdrawal: Withdrawal) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/withdrawals/${withdrawal._id}/approve`, { method: "POST" });
      if (response.ok) {
        fetchWithdrawals();
        setIsModalOpen(false);
        setSelectedWithdrawal(null);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to approve withdrawal");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedWithdrawal) return;
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/withdrawals/${selectedWithdrawal._id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      if (response.ok) {
        fetchWithdrawals();
        setShowRejectModal(false);
        setIsModalOpen(false);
        setSelectedWithdrawal(null);
        setRejectReason("");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to reject withdrawal");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
            Pending Withdrawals
          </h3>
        </div>
        <Button onClick={fetchWithdrawals} variant="secondary" size="sm" icon={<RefreshCw className="w-4 h-4" />}>
          Refresh
        </Button>
      </div>

      <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700/50 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="p-8 text-center">
            <ArrowUpFromLine className="w-12 h-12 text-surface-400 mx-auto mb-4" />
            <p className="text-surface-600 dark:text-surface-400">No pending withdrawals</p>
            <p className="text-surface-500 text-sm">All withdrawal requests have been processed</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-200 dark:border-surface-700">
                    <th className="text-left text-surface-600 dark:text-surface-400 font-medium p-4 text-sm">User</th>
                    <th className="text-left text-surface-600 dark:text-surface-400 font-medium p-4 text-sm">Amount</th>
                    <th className="text-left text-surface-600 dark:text-surface-400 font-medium p-4 text-sm">Network</th>
                    <th className="text-left text-surface-600 dark:text-surface-400 font-medium p-4 text-sm">Address</th>
                    <th className="text-left text-surface-600 dark:text-surface-400 font-medium p-4 text-sm">Date</th>
                    <th className="text-right text-surface-600 dark:text-surface-400 font-medium p-4 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((withdrawal) => (
                    <tr key={withdrawal._id} className="border-b border-surface-100 dark:border-surface-700/50 last:border-0 hover:bg-surface-50 dark:hover:bg-surface-700/30">
                      <td className="p-4">
                        <p className="text-surface-900 dark:text-white font-medium">{withdrawal.userId?.name || "Unknown"}</p>
                        <p className="text-surface-500 text-sm">{withdrawal.userId?.email || ""}</p>
                      </td>
                      <td className="p-4">
                        <span className="text-red-600 dark:text-red-400 font-semibold">${withdrawal.amount.toLocaleString()}</span>
                      </td>
                      <td className="p-4 text-surface-700 dark:text-surface-300">{withdrawal.network?.toUpperCase()}</td>
                      <td className="p-4">
                        <span className="text-surface-500 dark:text-surface-400 font-mono text-sm">
                          {withdrawal.toAddress.slice(0, 8)}...{withdrawal.toAddress.slice(-6)}
                        </span>
                      </td>
                      <td className="p-4 text-surface-500 dark:text-surface-400 text-sm">{formatDate(withdrawal.createdAt)}</td>
                      <td className="p-4 text-right">
                        <Button
                          onClick={() => { setSelectedWithdrawal(withdrawal); setIsModalOpen(true); }}
                          variant="secondary"
                          size="sm"
                          icon={<Eye className="w-4 h-4" />}
                        >
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="border-t border-surface-200 dark:border-surface-700 p-4">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>

      {/* Review Modal */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedWithdrawal(null); }} title="Review Withdrawal">
        {selectedWithdrawal && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-surface-500 dark:text-surface-400 text-sm">User</label>
                <p className="text-surface-900 dark:text-white font-medium">{selectedWithdrawal.userId?.name}</p>
                <p className="text-surface-500 text-sm">{selectedWithdrawal.userId?.email}</p>
              </div>
              <div>
                <label className="text-surface-500 dark:text-surface-400 text-sm">User Balance</label>
                <p className="text-surface-900 dark:text-white font-bold">${selectedWithdrawal.userId?.balance?.toLocaleString() || 0}</p>
              </div>
            </div>
            <div className="bg-surface-100 dark:bg-surface-900 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-surface-500 dark:text-surface-400">Withdrawal Amount:</span>
                <span className="text-surface-900 dark:text-white">${selectedWithdrawal.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-500 dark:text-surface-400">Network Fee:</span>
                <span className="text-red-500 dark:text-red-400">-${selectedWithdrawal.fee}</span>
              </div>
              <div className="flex justify-between border-t border-surface-200 dark:border-surface-700 pt-2">
                <span className="text-surface-500 dark:text-surface-400">Net Amount:</span>
                <span className="text-brand-600 dark:text-brand-400 font-semibold">${selectedWithdrawal.netAmount.toLocaleString()}</span>
              </div>
            </div>
            <div>
              <label className="text-surface-500 dark:text-surface-400 text-sm">Network</label>
              <p className="text-surface-900 dark:text-white">{selectedWithdrawal.network?.toUpperCase()}</p>
            </div>
            <div>
              <label className="text-surface-500 dark:text-surface-400 text-sm">Destination Address</label>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-surface-900 dark:text-white font-mono text-sm bg-surface-100 dark:bg-surface-900 p-2 rounded flex-1 break-all">
                  {selectedWithdrawal.toAddress}
                </p>
                <Button onClick={() => copyToClipboard(selectedWithdrawal.toAddress)} variant="ghost" size="sm" icon={<Copy className="w-4 h-4" />}>Copy</Button>
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
              <Button onClick={() => handleApprove(selectedWithdrawal)} variant="primary" icon={<Check className="w-4 h-4" />} isLoading={isProcessing} className="flex-1">
                Approve & Process
              </Button>
              <Button onClick={() => setShowRejectModal(true)} variant="danger" icon={<X className="w-4 h-4" />} className="flex-1">
                Reject
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={showRejectModal} onClose={() => { setShowRejectModal(false); setRejectReason(""); }} title="Reject Withdrawal">
        <div className="space-y-4">
          <div>
            <label className="block text-surface-600 dark:text-surface-400 text-sm mb-2">Rejection Reason</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              className="w-full bg-white dark:bg-surface-900 border border-surface-300 dark:border-surface-700 rounded-lg p-3 text-surface-900 dark:text-white placeholder-surface-400 dark:placeholder-surface-500 focus:outline-none focus:border-brand-500 resize-none"
              rows={3}
            />
          </div>
          <div className="flex gap-3">
            <Button onClick={() => { setShowRejectModal(false); setRejectReason(""); }} variant="secondary" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleReject} variant="danger" isLoading={isProcessing} className="flex-1">
              Reject Withdrawal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
