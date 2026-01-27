"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge, Skeleton, Modal } from "@/components/ui";
import {
  TrendingUp,
  Play,
  RefreshCw,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  Settings,
  Wallet,
  Copy,
  Check,
  AlertCircle,
} from "lucide-react";

interface ProfitShareStats {
  lastRunAt: string | null;
  totalDistributed: number;
  usersProcessed: number;
  isEnabled: boolean;
}

interface ProfitShareLog {
  _id: string;
  userId: {
    name: string;
    email: string;
  };
  date: string;
  amount: number;
  percentage: number;
  balanceSnapshot: number;
  tier: string;
}

interface ProfitTier {
  tier: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  dailyRate: number;
}

interface NetworkDepositAddresses {
  ERC20: string;
  TRC20: string;
  BEP20: string;
}

export default function AdminProfitSharePage() {
  const [stats, setStats] = useState<ProfitShareStats | null>(null);
  const [logs, setLogs] = useState<ProfitShareLog[]>([]);
  const [profitTiers, setProfitTiers] = useState<ProfitTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);

  // Deposit Address Modal State
  const [showAddressModal, setShowAddressModal] = useState(false);
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

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [profitShareRes, settingsRes] = await Promise.all([
        fetch("/api/admin/profit-share"),
        fetch("/api/admin/settings")
      ]);

      const profitShareData = await profitShareRes.json();
      const settingsData = await settingsRes.json();

      if (profitShareRes.ok) {
        setStats(profitShareData.stats);
        setLogs(profitShareData.logs || []);
      }

      if (settingsRes.ok && settingsData.settings?.profitTiers) {
        setProfitTiers(settingsData.settings.profitTiers);
      }
    } catch (error) {
      console.error("Failed to fetch profit share data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunNow = async () => {
    if (!confirm("Are you sure you want to run profit share distribution now?")) {
      return;
    }

    setIsRunning(true);
    try {
      const response = await fetch("/api/admin/run-profit-share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Profit share completed! ${data.usersProcessed} users processed, $${data.totalAmount.toFixed(2)} distributed.`);
        fetchData();
      } else {
        alert(data.error || "Failed to run profit share");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setIsRunning(false);
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

  // Fetch deposit addresses
  const fetchDepositAddresses = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/settings/deposit-addresses");
      if (response.ok) {
        const data = await response.json();
        const addresses = data.data || {
          ERC20: '',
          TRC20: '',
          BEP20: '',
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
    // Confirm before saving
    if (!confirm("Are you sure you want to update the deposit addresses? This will affect all users across the platform.")) {
      return;
    }

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

  // Open address modal
  const openAddressModal = () => {
    setAddressError(null);
    setAddressSuccess(null);
    fetchDepositAddresses();
    setShowAddressModal(true);
  };

  // Close address modal
  const closeAddressModal = () => {
    setShowAddressModal(false);
    setAddressError(null);
    setAddressSuccess(null);
    setEditedAddresses(networkDepositAddresses);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Profit Share Management</h1>
          <p className="text-surface-400 mt-1">
            Manage daily profit distribution - Use buttons on the right to refresh or run now
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 bg-surface-700 hover:bg-surface-600 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={openAddressModal}
            className="flex items-center gap-2 px-4 py-2 bg-surface-700 hover:bg-surface-600 text-white rounded-lg transition-colors"
          >
            <Wallet className="w-4 h-4" />
            Deposit Addresses
          </button>
          <button
            onClick={handleRunNow}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            {isRunning ? "Running..." : "Run Now"}
          </button>
        </div>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-surface-900 border border-surface-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-surface-400 text-sm">Status</span>
            </div>
            <Badge variant={stats?.isEnabled ? "success" : "danger"}>
              {stats?.isEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>

          <div className="bg-surface-900 border border-surface-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-brand-500/20">
                <Clock className="w-5 h-5 text-brand-400" />
              </div>
              <span className="text-surface-400 text-sm">Last Run</span>
            </div>
            <p className="text-white text-sm">
              {stats?.lastRunAt ? formatDate(stats.lastRunAt) : "Never"}
            </p>
          </div>

          <div className="bg-surface-900 border border-surface-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-surface-400 text-sm">Users Processed</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {stats?.usersProcessed || 0}
            </p>
          </div>

          <div className="bg-surface-900 border border-surface-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <DollarSign className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-surface-400 text-sm">Total Distributed</span>
            </div>
            <p className="text-2xl font-bold text-white">
              ${(stats?.totalDistributed || 0).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Tier Configuration */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">
            Profit Tier Configuration
          </h2>
          <a
            href="/admin/settings?tab=profit-tiers"
            className="flex items-center gap-2 px-3 py-2 bg-surface-800 hover:bg-surface-700 text-surface-300 rounded-lg transition-colors text-sm"
          >
            <Settings className="w-4 h-4" />
            Edit Tiers
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {profitTiers.map((tier, index) => (
            <div key={tier.tier} className="bg-surface-800 rounded-lg p-4">
              <h3 className="text-surface-400 text-sm mb-2">
                Tier {index + 1}: {tier.name}
              </h3>
              <p className="text-2xl font-bold text-brand-400">{tier.dailyRate}%</p>
              <p className="text-surface-500 text-sm">
                ${tier.minAmount.toLocaleString()} - {tier.maxAmount >= 100000 ? '∞' : `$${tier.maxAmount.toLocaleString()}`}
              </p>
            </div>
          ))}
          {profitTiers.length === 0 && (
            <p className="text-surface-500 col-span-full">
              No profit tiers configured.{" "}
              <a href="/admin/settings?tab=profit-tiers" className="text-brand-400 hover:underline">
                Configure tiers
              </a>
            </p>
          )}
        </div>
      </div>

      {/* Recent Distributions */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-surface-800">
          <h2 className="text-lg font-semibold text-white">
            Recent Distributions
          </h2>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-surface-500">
            No profit distributions yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-800">
                  <th className="text-left text-surface-400 font-medium p-4 text-sm">
                    User
                  </th>
                  <th className="text-left text-surface-400 font-medium p-4 text-sm">
                    Deposit Balance
                  </th>
                  <th className="text-left text-surface-400 font-medium p-4 text-sm">
                    Rate
                  </th>
                  <th className="text-left text-surface-400 font-medium p-4 text-sm">
                    Profit
                  </th>
                  <th className="text-left text-surface-400 font-medium p-4 text-sm">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log._id}
                    className="border-b border-surface-800 last:border-0"
                  >
                    <td className="p-4">
                      <div>
                        <p className="text-white font-medium">
                          {log.userId?.name || "Unknown"}
                        </p>
                        <p className="text-surface-500 text-sm">
                          {log.userId?.email || ""}
                        </p>
                      </div>
                    </td>
                    <td className="p-4 text-surface-300">
                      ${(log.balanceSnapshot || 0).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <Badge variant="info">{log.percentage}%</Badge>
                    </td>
                    <td className="p-4">
                      <span className="text-green-400 font-semibold">
                        +${(log.amount || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className="p-4 text-surface-400 text-sm">
                      {formatDate(log.date)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Deposit Address Modal */}
      <Modal
        isOpen={showAddressModal}
        onClose={closeAddressModal}
        title="Update Deposit Addresses"
        size="lg"
      >
        <div className="space-y-4">
          {/* Warning Alert */}
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-200 text-sm font-medium">System-wide Change</p>
              <p className="text-amber-200/70 text-sm">
                Updating these addresses will affect all users. The new addresses will be shown on the deposit page for all networks.
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {addressError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-200 text-sm">{addressError}</p>
            </div>
          )}

          {/* Success Alert */}
          {addressSuccess && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
              <p className="text-green-200 text-sm">{addressSuccess}</p>
            </div>
          )}

          {/* ERC20 Address */}
          <div className="bg-surface-800 border border-surface-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-surface-400 text-sm font-medium">ERC20 (Ethereum)</label>
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">ETH Network</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editedAddresses.ERC20}
                onChange={(e) => setEditedAddresses({ ...editedAddresses, ERC20: e.target.value })}
                placeholder="0x..."
                className="flex-1 bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-brand-500"
              />
              <button
                onClick={() => copyToClipboard(editedAddresses.ERC20, 'ERC20')}
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
          </div>

          {/* TRC20 Address */}
          <div className="bg-surface-800 border border-surface-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-surface-400 text-sm font-medium">TRC20 (Tron)</label>
              <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded">TRON Network</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editedAddresses.TRC20}
                onChange={(e) => setEditedAddresses({ ...editedAddresses, TRC20: e.target.value })}
                placeholder="T..."
                className="flex-1 bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-brand-500"
              />
              <button
                onClick={() => copyToClipboard(editedAddresses.TRC20, 'TRC20')}
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
          </div>

          {/* BEP20 Address */}
          <div className="bg-surface-800 border border-surface-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-surface-400 text-sm font-medium">BEP20 (BSC)</label>
              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">BSC Network</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editedAddresses.BEP20}
                onChange={(e) => setEditedAddresses({ ...editedAddresses, BEP20: e.target.value })}
                placeholder="0x..."
                className="flex-1 bg-surface-900 border border-surface-600 rounded-lg px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-brand-500"
              />
              <button
                onClick={() => copyToClipboard(editedAddresses.BEP20, 'BEP20')}
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
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4 border-t border-surface-800">
            <button
              onClick={closeAddressModal}
              className="flex-1 px-4 py-2 bg-surface-700 hover:bg-surface-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveDepositAddresses}
              disabled={isSavingAddresses}
              className="flex-1 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSavingAddresses ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
