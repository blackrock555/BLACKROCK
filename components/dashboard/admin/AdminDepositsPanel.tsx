"use client";

import { useState, useEffect } from "react";
import { Badge, Button, Modal, Skeleton, Pagination } from "@/components/ui";
import {
  ArrowDownToLine,
  Eye,
  Check,
  X,
  ExternalLink,
  RefreshCw,
  ArrowLeft,
} from "lucide-react";

interface Deposit {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  amount: number;
  network: string;
  proofUrl: string;
  txHash?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNote?: string;
  createdAt: string;
}

interface AdminDepositsPanelProps {
  onBack: () => void;
}

export function AdminDepositsPanel({ onBack }: AdminDepositsPanelProps) {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const fetchDeposits = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/deposits?page=${page}&status=PENDING`);
      const data = await response.json();
      if (response.ok) {
        setDeposits(data.deposits || []);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch deposits:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, [page]);

  const handleApprove = async (deposit: Deposit) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/deposits/${deposit._id}/approve`, {
        method: "POST",
      });
      if (response.ok) {
        fetchDeposits();
        setIsModalOpen(false);
        setSelectedDeposit(null);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to approve deposit");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedDeposit) return;
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/deposits/${selectedDeposit._id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      if (response.ok) {
        fetchDeposits();
        setShowRejectModal(false);
        setIsModalOpen(false);
        setSelectedDeposit(null);
        setRejectReason("");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to reject deposit");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setIsProcessing(false);
    }
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
            Pending Deposits
          </h3>
        </div>
        <Button onClick={fetchDeposits} variant="secondary" size="sm" icon={<RefreshCw className="w-4 h-4" />}>
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
        ) : deposits.length === 0 ? (
          <div className="p-8 text-center">
            <ArrowDownToLine className="w-12 h-12 text-surface-400 mx-auto mb-4" />
            <p className="text-surface-600 dark:text-surface-400">No pending deposits</p>
            <p className="text-surface-500 text-sm">All deposit requests have been processed</p>
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
                    <th className="text-left text-surface-600 dark:text-surface-400 font-medium p-4 text-sm">Date</th>
                    <th className="text-right text-surface-600 dark:text-surface-400 font-medium p-4 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deposits.map((deposit) => (
                    <tr key={deposit._id} className="border-b border-surface-100 dark:border-surface-700/50 last:border-0 hover:bg-surface-50 dark:hover:bg-surface-700/30">
                      <td className="p-4">
                        <p className="text-surface-900 dark:text-white font-medium">{deposit.userId?.name || "Unknown"}</p>
                        <p className="text-surface-500 text-sm">{deposit.userId?.email || ""}</p>
                      </td>
                      <td className="p-4">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          ${deposit.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4 text-surface-700 dark:text-surface-300">{deposit.network?.toUpperCase()}</td>
                      <td className="p-4 text-surface-500 dark:text-surface-400 text-sm">{formatDate(deposit.createdAt)}</td>
                      <td className="p-4 text-right">
                        <Button
                          onClick={() => { setSelectedDeposit(deposit); setIsModalOpen(true); }}
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
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedDeposit(null); }} title="Review Deposit">
        {selectedDeposit && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-surface-500 dark:text-surface-400 text-sm">User</label>
                <p className="text-surface-900 dark:text-white font-medium">{selectedDeposit.userId?.name}</p>
                <p className="text-surface-500 text-sm">{selectedDeposit.userId?.email}</p>
              </div>
              <div>
                <label className="text-surface-500 dark:text-surface-400 text-sm">Amount</label>
                <p className="text-emerald-600 dark:text-emerald-400 font-bold text-xl">${selectedDeposit.amount.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-surface-500 dark:text-surface-400 text-sm">Network</label>
                <p className="text-surface-900 dark:text-white">{selectedDeposit.network?.toUpperCase()}</p>
              </div>
              <div>
                <label className="text-surface-500 dark:text-surface-400 text-sm">Date</label>
                <p className="text-surface-900 dark:text-white">{formatDate(selectedDeposit.createdAt)}</p>
              </div>
            </div>
            {selectedDeposit.txHash && (
              <div>
                <label className="text-surface-500 dark:text-surface-400 text-sm">Transaction Hash</label>
                <p className="text-surface-900 dark:text-white font-mono text-sm break-all">{selectedDeposit.txHash}</p>
              </div>
            )}
            <div>
              <label className="text-surface-500 dark:text-surface-400 text-sm">Payment Proof</label>
              <a href={selectedDeposit.proofUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-brand-600 dark:text-brand-400 hover:text-brand-500 dark:hover:text-brand-300 mt-1">
                <ExternalLink className="w-4 h-4" />
                View Proof
              </a>
            </div>
            <div className="flex gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
              <Button onClick={() => handleApprove(selectedDeposit)} variant="primary" icon={<Check className="w-4 h-4" />} isLoading={isProcessing} className="flex-1">
                Approve
              </Button>
              <Button onClick={() => setShowRejectModal(true)} variant="danger" icon={<X className="w-4 h-4" />} className="flex-1">
                Reject
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={showRejectModal} onClose={() => { setShowRejectModal(false); setRejectReason(""); }} title="Reject Deposit">
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
              Reject Deposit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
