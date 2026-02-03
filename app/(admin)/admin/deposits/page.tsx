"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge, Button, Modal, Skeleton, EmptyState, Pagination } from "@/components/ui";
import {
  ArrowDownToLine,
  Eye,
  Check,
  X,
  ExternalLink,
  RefreshCw,
  Wallet,
  Copy,
  Save,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Edit3,
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

interface NetworkDepositAddresses {
  ERC20: string;
  TRC20: string;
  BEP20: string;
}

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Deposit Address Management State
  const [showAddressSettings, setShowAddressSettings] = useState(true);
  const [isEditingAddresses, setIsEditingAddresses] = useState(false);
  const [isSavingAddresses, setIsSavingAddresses] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [addressSuccess, setAddressSuccess] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [networkDepositAddresses, setNetworkDepositAddresses] = useState<NetworkDepositAddresses>({
    ERC20: '',
    TRC20: '',
    BEP20: '',
  });
  const [editedAddresses, setEditedAddresses] = useState<NetworkDepositAddresses>({
    ERC20: '',
    TRC20: '',
    BEP20: '',
  });

  const fetchDeposits = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/deposits?page=${page}&status=PENDING`
      );
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

  // Fetch deposit addresses
  const fetchDepositAddresses = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/settings/deposit-addresses");
      if (response.ok) {
        const data = await response.json();
        const addresses = data.data || {
          ERC20: '0xDE8b3Da180f806caE004E11C35e69FdFAFddc2dc',
          TRC20: 'TYgnvgebSrTVUwi9BZuW2t1gXHo7H6Wy8j',
          BEP20: '0xDE8b3Da180f806caE004E11C35e69FdFAFddc2dc',
        };
        setNetworkDepositAddresses(addresses);
        setEditedAddresses(addresses);
      }
    } catch (error) {
      console.error("Failed to fetch deposit addresses:", error);
    }
  }, []);

  // Save deposit addresses
  const saveDepositAddresses = async () => {
    setIsSavingAddresses(true);
    setAddressError(null);
    setAddressSuccess(null);

    try {
      // Validate addresses
      if (!editedAddresses.ERC20.startsWith('0x')) {
        throw new Error('ERC20 address must start with 0x');
      }
      if (!editedAddresses.TRC20.startsWith('T')) {
        throw new Error('TRC20 address must start with T');
      }
      if (!editedAddresses.BEP20.startsWith('0x')) {
        throw new Error('BEP20 address must start with 0x');
      }

      const response = await fetch("/api/admin/settings/deposit-addresses", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ networkDepositAddresses: editedAddresses }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save addresses");
      }

      setNetworkDepositAddresses(editedAddresses);
      setIsEditingAddresses(false);
      setAddressSuccess("Deposit addresses updated successfully!");
      setTimeout(() => setAddressSuccess(null), 3000);
    } catch (error) {
      setAddressError(error instanceof Error ? error.message : "Failed to save addresses");
    } finally {
      setIsSavingAddresses(false);
    }
  };

  // Copy address to clipboard
  const copyToClipboard = async (text: string, network: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedAddress(network);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditedAddresses(networkDepositAddresses);
    setIsEditingAddresses(false);
    setAddressError(null);
  };

  useEffect(() => {
    fetchDeposits();
  }, [page]);

  useEffect(() => {
    fetchDepositAddresses();
  }, [fetchDepositAddresses]);

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
      const response = await fetch(
        `/api/admin/deposits/${selectedDeposit._id}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: rejectReason }),
        }
      );

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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pending Deposits</h1>
          <p className="text-surface-400 mt-1">
            Review and approve deposit requests
          </p>
        </div>
        <Button
          onClick={fetchDeposits}
          variant="secondary"
          icon={<RefreshCw className="w-4 h-4" />}
        >
          Refresh
        </Button>
      </div>

      {/* Deposit Address Management Section */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl overflow-hidden">
        {/* Header - Always visible */}
        <button
          onClick={() => setShowAddressSettings(!showAddressSettings)}
          className="w-full flex items-center justify-between p-4 hover:bg-surface-800/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-500/20 rounded-lg">
              <Wallet className="w-5 h-5 text-brand-400" />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-semibold text-white">Deposit Wallet Addresses</h2>
              <p className="text-surface-400 text-sm">Manage network-specific deposit addresses</p>
            </div>
          </div>
          {showAddressSettings ? (
            <ChevronUp className="w-5 h-5 text-surface-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-surface-400" />
          )}
        </button>

        {/* Collapsible Content */}
        {showAddressSettings && (
          <div className="border-t border-surface-800 p-4 space-y-4">
            {/* Alerts */}
            {addressError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <p className="text-red-200 text-sm">{addressError}</p>
              </div>
            )}
            {addressSuccess && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                <p className="text-green-200 text-sm">{addressSuccess}</p>
              </div>
            )}

            {/* Address Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* ERC20 Address */}
              <div className="bg-surface-800 border border-surface-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-surface-400 text-sm font-medium">ERC20 (Ethereum)</label>
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">ETH Network</span>
                </div>
                {isEditingAddresses ? (
                  <input
                    type="text"
                    value={editedAddresses.ERC20}
                    onChange={(e) => setEditedAddresses({ ...editedAddresses, ERC20: e.target.value })}
                    placeholder="0x..."
                    className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-brand-500"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 font-mono text-sm text-surface-300 truncate">
                      {networkDepositAddresses.ERC20 || 'Not set'}
                    </div>
                    <button
                      onClick={() => copyToClipboard(networkDepositAddresses.ERC20, 'ERC20')}
                      className="p-2 bg-surface-700 hover:bg-surface-600 rounded-lg transition-colors"
                      title="Copy address"
                    >
                      {copiedAddress === 'ERC20' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-surface-400" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* TRC20 Address */}
              <div className="bg-surface-800 border border-surface-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-surface-400 text-sm font-medium">TRC20 (Tron)</label>
                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">TRON Network</span>
                </div>
                {isEditingAddresses ? (
                  <input
                    type="text"
                    value={editedAddresses.TRC20}
                    onChange={(e) => setEditedAddresses({ ...editedAddresses, TRC20: e.target.value })}
                    placeholder="T..."
                    className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-brand-500"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 font-mono text-sm text-surface-300 truncate">
                      {networkDepositAddresses.TRC20 || 'Not set'}
                    </div>
                    <button
                      onClick={() => copyToClipboard(networkDepositAddresses.TRC20, 'TRC20')}
                      className="p-2 bg-surface-700 hover:bg-surface-600 rounded-lg transition-colors"
                      title="Copy address"
                    >
                      {copiedAddress === 'TRC20' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-surface-400" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* BEP20 Address */}
              <div className="bg-surface-800 border border-surface-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-surface-400 text-sm font-medium">BEP20 (BSC)</label>
                  <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">BSC Network</span>
                </div>
                {isEditingAddresses ? (
                  <input
                    type="text"
                    value={editedAddresses.BEP20}
                    onChange={(e) => setEditedAddresses({ ...editedAddresses, BEP20: e.target.value })}
                    placeholder="0x..."
                    className="w-full bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-brand-500"
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 font-mono text-sm text-surface-300 truncate">
                      {networkDepositAddresses.BEP20 || 'Not set'}
                    </div>
                    <button
                      onClick={() => copyToClipboard(networkDepositAddresses.BEP20, 'BEP20')}
                      className="p-2 bg-surface-700 hover:bg-surface-600 rounded-lg transition-colors"
                      title="Copy address"
                    >
                      {copiedAddress === 'BEP20' ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-surface-400" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-surface-800">
              <p className="text-surface-500 text-xs">
                These addresses are shown to users on the deposit page based on their selected network.
              </p>
              <div className="flex items-center gap-2">
                {isEditingAddresses ? (
                  <>
                    <Button
                      onClick={cancelEditing}
                      variant="secondary"
                      size="sm"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={saveDepositAddresses}
                      variant="primary"
                      size="sm"
                      icon={<Save className="w-4 h-4" />}
                      isLoading={isSavingAddresses}
                    >
                      Save Addresses
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsEditingAddresses(true)}
                    variant="secondary"
                    size="sm"
                    icon={<Edit3 className="w-4 h-4" />}
                  >
                    Edit Addresses
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Deposits Table */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : deposits.length === 0 ? (
          <EmptyState
            icon={<ArrowDownToLine className="w-12 h-12" />}
            title="No pending deposits"
            description="All deposit requests have been processed"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-800">
                    <th className="text-left text-surface-400 font-medium p-4 text-sm">
                      User
                    </th>
                    <th className="text-left text-surface-400 font-medium p-4 text-sm">
                      Amount
                    </th>
                    <th className="text-left text-surface-400 font-medium p-4 text-sm">
                      Network
                    </th>
                    <th className="text-left text-surface-400 font-medium p-4 text-sm">
                      Date
                    </th>
                    <th className="text-left text-surface-400 font-medium p-4 text-sm">
                      Status
                    </th>
                    <th className="text-right text-surface-400 font-medium p-4 text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {deposits.map((deposit) => (
                    <tr
                      key={deposit._id}
                      className="border-b border-surface-800 last:border-0 hover:bg-surface-800/50"
                    >
                      <td className="p-4">
                        <div>
                          <p className="text-white font-medium">
                            {deposit.userId?.name || "Unknown"}
                          </p>
                          <p className="text-surface-500 text-sm">
                            {deposit.userId?.email || ""}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-green-400 font-semibold">
                          ${deposit.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4 text-surface-300">
                        {deposit.network?.toUpperCase()}
                      </td>
                      <td className="p-4 text-surface-400 text-sm">
                        {formatDate(deposit.createdAt)}
                      </td>
                      <td className="p-4">
                        <Badge variant="warning">{deposit.status}</Badge>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => {
                              setSelectedDeposit(deposit);
                              setIsModalOpen(true);
                            }}
                            variant="secondary"
                            size="sm"
                            icon={<Eye className="w-4 h-4" />}
                          >
                            Review
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="border-t border-surface-800 p-4">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Review Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDeposit(null);
        }}
        title="Review Deposit"
      >
        {selectedDeposit && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-surface-400 text-sm">User</label>
                <p className="text-white font-medium">
                  {selectedDeposit.userId?.name}
                </p>
                <p className="text-surface-500 text-sm">
                  {selectedDeposit.userId?.email}
                </p>
              </div>
              <div>
                <label className="text-surface-400 text-sm">Amount</label>
                <p className="text-green-400 font-bold text-xl">
                  ${selectedDeposit.amount.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="text-surface-400 text-sm">Network</label>
                <p className="text-white">{selectedDeposit.network?.toUpperCase()}</p>
              </div>
              <div>
                <label className="text-surface-400 text-sm">Date</label>
                <p className="text-white">{formatDate(selectedDeposit.createdAt)}</p>
              </div>
            </div>

            {selectedDeposit.txHash && (
              <div>
                <label className="text-surface-400 text-sm">Transaction Hash</label>
                <p className="text-white font-mono text-sm break-all">
                  {selectedDeposit.txHash}
                </p>
              </div>
            )}

            <div>
              <label className="text-surface-400 text-sm">Payment Proof</label>
              <a
                href={selectedDeposit.proofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-brand-400 hover:text-brand-300 mt-1"
              >
                <ExternalLink className="w-4 h-4" />
                View Proof
              </a>
            </div>

            <div className="flex gap-3 pt-4 border-t border-surface-800">
              <Button
                onClick={() => handleApprove(selectedDeposit)}
                variant="primary"
                icon={<Check className="w-4 h-4" />}
                isLoading={isProcessing}
                className="flex-1"
              >
                Approve
              </Button>
              <Button
                onClick={() => setShowRejectModal(true)}
                variant="danger"
                icon={<X className="w-4 h-4" />}
                className="flex-1"
              >
                Reject
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Reason Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectReason("");
        }}
        title="Reject Deposit"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-surface-400 text-sm mb-2">
              Rejection Reason
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              className="w-full bg-surface-800 border border-surface-700 rounded-lg p-3 text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 resize-none"
              rows={3}
            />
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => {
                setShowRejectModal(false);
                setRejectReason("");
              }}
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              variant="danger"
              isLoading={isProcessing}
              className="flex-1"
            >
              Reject Deposit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
