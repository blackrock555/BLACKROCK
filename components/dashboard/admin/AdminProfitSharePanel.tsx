"use client";

import { useState, useEffect } from "react";
import { Badge, Button, Modal, Skeleton, Pagination } from "@/components/ui";
import {
  TrendingUp,
  Eye,
  RefreshCw,
  ArrowLeft,
  DollarSign,
  Calendar,
  User,
  Play,
  Plus,
  Trash2,
  Save,
  Settings,
  Search,
  UserCog,
  Wallet,
  Copy,
  Check,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface ProfitShare {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  amount: number;
  percentage: number;
  investmentAmount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  processedAt?: string;
}

interface ProfitShareStats {
  totalDistributed: number;
  pendingDistributions: number;
  totalRecipients: number;
  averageShare: number;
  todayEstimatedProfit?: number;
  eligibleUserCount?: number;
}

interface ProfitTier {
  tier: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  dailyRate: number;
}

interface UserOption {
  _id: string;
  name: string;
  email: string;
  depositBalance: number;
}

interface NetworkDepositAddresses {
  ERC20: string;
  TRC20: string;
  BEP20: string;
}

interface AdminProfitSharePanelProps {
  onBack: () => void;
}

export function AdminProfitSharePanel({ onBack }: AdminProfitSharePanelProps) {
  const [profitShares, setProfitShares] = useState<ProfitShare[]>([]);
  const [stats, setStats] = useState<ProfitShareStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProfitShare, setSelectedProfitShare] = useState<ProfitShare | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "PENDING" | "APPROVED">("all");

  // Profit Tier Configuration State
  const [profitTiers, setProfitTiers] = useState<ProfitTier[]>([]);
  const [isSavingTiers, setIsSavingTiers] = useState(false);
  const [tierError, setTierError] = useState<string | null>(null);
  const [tierSuccess, setTierSuccess] = useState<string | null>(null);
  const [showTierConfig, setShowTierConfig] = useState(false);

  // Custom User Profit Share State
  const [showCustomShare, setShowCustomShare] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [customPercentage, setCustomPercentage] = useState<number>(5);
  const [isRunningCustom, setIsRunningCustom] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);
  const [customSuccess, setCustomSuccess] = useState<string | null>(null);

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

  const fetchProfitShares = async () => {
    setIsLoading(true);
    try {
      const statusParam = filter !== "all" ? `&status=${filter}` : "";
      const response = await fetch(`/api/admin/profit-share?page=${page}${statusParam}`);
      const data = await response.json();
      if (response.ok) {
        setProfitShares(data.profitShares || []);
        setTotalPages(data.pagination?.pages || 1);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (error) {
      console.error("Failed to fetch profit shares:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings");
      const data = await response.json();
      if (response.ok && data.settings?.profitTiers) {
        setProfitTiers(data.settings.profitTiers);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  };

  const fetchUsers = async (search: string = "") => {
    try {
      const response = await fetch(`/api/admin/users?search=${encodeURIComponent(search)}&limit=20`);
      const data = await response.json();
      if (response.ok && data.users) {
        setUsers(data.users.map((u: any) => ({
          _id: u._id,
          name: u.name,
          email: u.email,
          depositBalance: u.depositBalance || 0,
        })));
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  useEffect(() => {
    fetchProfitShares();
    fetchSettings();
    fetchUsers();
  }, [page, filter]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (userSearchQuery) {
        fetchUsers(userSearchQuery);
      }
    }, 300);
    return () => clearTimeout(debounce);
  }, [userSearchQuery]);

  const handleRunNow = async () => {
    if (!confirm("Are you sure you want to run profit share distribution now? This will distribute daily profits to all eligible users.")) {
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
        alert(`Profit share completed successfully!\n\nUsers processed: ${data.usersProcessed || 0}\nTotal distributed: $${(data.totalAmount || 0).toFixed(2)}`);
        fetchProfitShares();
      } else {
        alert(data.error || "Failed to run profit share distribution");
      }
    } catch (error) {
      console.error("Run profit share error:", error);
      alert("An error occurred while running profit share distribution");
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunCustom = async () => {
    if (!selectedUser) {
      setCustomError("Please select a user");
      return;
    }

    if (customPercentage <= 0 || customPercentage > 100) {
      setCustomError("Percentage must be between 0.1 and 100");
      return;
    }

    if (!confirm(`Run profit share for ${selectedUser.name} with ${customPercentage}% rate?\n\nDeposit Balance: $${selectedUser.depositBalance.toLocaleString()}\nEstimated Profit: $${((selectedUser.depositBalance * customPercentage) / 100).toFixed(2)}`)) {
      return;
    }

    setIsRunningCustom(true);
    setCustomError(null);
    setCustomSuccess(null);

    try {
      const response = await fetch("/api/admin/profit-share/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser._id,
          percentage: customPercentage,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCustomSuccess(`Successfully distributed $${data.amount?.toFixed(2) || 0} to ${selectedUser.name}`);
        setSelectedUser(null);
        setCustomPercentage(5);
        fetchProfitShares();
        setTimeout(() => setCustomSuccess(null), 5000);
      } else {
        setCustomError(data.error || "Failed to run custom profit share");
      }
    } catch (error) {
      console.error("Run custom profit share error:", error);
      setCustomError("An error occurred");
    } finally {
      setIsRunningCustom(false);
    }
  };

  // Profit Tier Functions
  const addTier = () => {
    const newTier: ProfitTier = {
      tier: `TIER_${profitTiers.length + 1}`,
      name: `Tier ${profitTiers.length + 1}`,
      minAmount: profitTiers.length > 0 ? profitTiers[profitTiers.length - 1].maxAmount + 1 : 0,
      maxAmount: 999999,
      dailyRate: 5,
    };
    setProfitTiers([...profitTiers, newTier]);
  };

  const removeTier = (index: number) => {
    if (profitTiers.length > 1) {
      setProfitTiers(profitTiers.filter((_, i) => i !== index));
    }
  };

  const updateTier = (index: number, field: keyof ProfitTier, value: string | number) => {
    const updated = [...profitTiers];
    updated[index] = { ...updated[index], [field]: value };
    setProfitTiers(updated);
  };

  const saveTiers = async () => {
    setIsSavingTiers(true);
    setTierError(null);
    setTierSuccess(null);

    try {
      const response = await fetch("/api/admin/settings/profit-tiers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profitTiers }),
      });

      const data = await response.json();

      if (response.ok) {
        setTierSuccess("Profit tiers saved successfully!");
        setTimeout(() => setTierSuccess(null), 3000);
      } else {
        setTierError(data.error || "Failed to save tiers");
      }
    } catch (error) {
      setTierError("An error occurred while saving");
    } finally {
      setIsSavingTiers(false);
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

  const formatCurrency = (amount: number) => {
    const safeAmount = isNaN(amount) || amount === null || amount === undefined ? 0 : amount;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(safeAmount);
  };

  // Fetch deposit addresses
  const fetchDepositAddresses = async () => {
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
  };

  // Save deposit addresses
  const saveDepositAddresses = async () => {
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
            Profit Share Management
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-900 dark:text-white focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
          </select>
          <Button onClick={fetchProfitShares} variant="secondary" size="sm" icon={<RefreshCw className="w-4 h-4" />}>
            Refresh
          </Button>
          <Button
            onClick={() => setShowTierConfig(!showTierConfig)}
            variant="secondary"
            size="sm"
            icon={<Settings className="w-4 h-4" />}
          >
            {showTierConfig ? "Hide Tiers" : "Tier Settings"}
          </Button>
          <Button
            onClick={() => setShowCustomShare(!showCustomShare)}
            variant="secondary"
            size="sm"
            icon={<UserCog className="w-4 h-4" />}
          >
            {showCustomShare ? "Hide Custom" : "Custom User"}
          </Button>
          <Button
            onClick={openAddressModal}
            variant="secondary"
            size="sm"
            icon={<Wallet className="w-4 h-4" />}
          >
            Deposit Addresses
          </Button>
          <Button
            onClick={handleRunNow}
            variant="primary"
            size="sm"
            icon={<Play className="w-4 h-4" />}
            isLoading={isRunning}
          >
            {isRunning ? "Running..." : "Run All"}
          </Button>
        </div>
      </div>

      {/* Custom User Profit Share */}
      {showCustomShare && (
        <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-surface-900 dark:text-white font-semibold">Custom User Profit Share</h4>
              <p className="text-surface-500 text-sm">Run profit share for a specific user with custom percentage</p>
            </div>
          </div>

          {customError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {customError}
            </div>
          )}
          {customSuccess && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600 dark:text-green-400 text-sm">
              {customSuccess}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* User Search */}
            <div className="md:col-span-2">
              <label className="block text-xs text-surface-500 dark:text-surface-400 mb-1">Select User</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-white dark:bg-surface-900 border border-surface-300 dark:border-surface-600 rounded-lg text-sm text-surface-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>
              {userSearchQuery && users.length > 0 && !selectedUser && (
                <div className="absolute z-10 mt-1 w-full max-w-md bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {users.filter(u =>
                    u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                    u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
                  ).slice(0, 5).map((user) => (
                    <button
                      key={user._id}
                      onClick={() => {
                        setSelectedUser(user);
                        setUserSearchQuery("");
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
                    >
                      <p className="text-surface-900 dark:text-white text-sm font-medium">{user.name}</p>
                      <p className="text-surface-500 text-xs">{user.email} • Balance: ${user.depositBalance.toLocaleString()}</p>
                    </button>
                  ))}
                </div>
              )}
              {selectedUser && (
                <div className="mt-2 p-3 bg-brand-500/10 border border-brand-500/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-surface-900 dark:text-white font-medium">{selectedUser.name}</p>
                      <p className="text-surface-500 text-sm">{selectedUser.email}</p>
                      <p className="text-brand-600 dark:text-brand-400 text-sm font-semibold">Balance: ${selectedUser.depositBalance.toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="p-1 hover:bg-surface-200 dark:hover:bg-surface-700 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-surface-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Custom Percentage */}
            <div>
              <label className="block text-xs text-surface-500 dark:text-surface-400 mb-1">Profit Rate (%)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="100"
                value={customPercentage}
                onChange={(e) => setCustomPercentage(parseFloat(e.target.value) || 0)}
                className="w-full bg-white dark:bg-surface-900 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-sm text-surface-900 dark:text-white font-semibold focus:outline-none focus:border-brand-500"
              />
              {selectedUser && (
                <p className="text-xs text-surface-500 mt-1">
                  Est. Profit: <span className="text-emerald-500 font-semibold">${((selectedUser.depositBalance * customPercentage) / 100).toFixed(2)}</span>
                </p>
              )}
            </div>

            {/* Run Button */}
            <div className="flex items-end">
              <Button
                onClick={handleRunCustom}
                variant="primary"
                size="sm"
                icon={<Play className="w-4 h-4" />}
                isLoading={isRunningCustom}
                disabled={!selectedUser}
                className="w-full"
              >
                {isRunningCustom ? "Running..." : "Run for User"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Profit Tier Configuration */}
      {showTierConfig && (
        <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-surface-900 dark:text-white font-semibold">Profit Tier Configuration</h4>
              <p className="text-surface-500 text-sm">Configure daily profit rates based on deposit balance</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={addTier} variant="secondary" size="sm" icon={<Plus className="w-4 h-4" />}>
                Add Tier
              </Button>
              <Button onClick={saveTiers} variant="primary" size="sm" icon={<Save className="w-4 h-4" />} isLoading={isSavingTiers}>
                Save Changes
              </Button>
            </div>
          </div>

          {tierError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {tierError}
            </div>
          )}
          {tierSuccess && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600 dark:text-green-400 text-sm">
              {tierSuccess}
            </div>
          )}

          <div className="space-y-3">
            {profitTiers.map((tier, index) => (
              <div key={index} className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-surface-900 dark:text-white font-medium">Tier {index + 1}</span>
                  {profitTiers.length > 1 && (
                    <button
                      onClick={() => removeTier(index)}
                      className="p-1.5 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-xs text-surface-500 dark:text-surface-400 mb-1">Tier ID</label>
                    <input
                      type="text"
                      value={tier.tier}
                      onChange={(e) => updateTier(index, "tier", e.target.value)}
                      className="w-full bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-sm text-surface-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-surface-500 dark:text-surface-400 mb-1">Name</label>
                    <input
                      type="text"
                      value={tier.name}
                      onChange={(e) => updateTier(index, "name", e.target.value)}
                      className="w-full bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-sm text-surface-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-surface-500 dark:text-surface-400 mb-1">Min Amount ($)</label>
                    <input
                      type="number"
                      value={tier.minAmount}
                      onChange={(e) => updateTier(index, "minAmount", parseFloat(e.target.value) || 0)}
                      className="w-full bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-sm text-surface-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-surface-500 dark:text-surface-400 mb-1">Max Amount ($)</label>
                    <input
                      type="number"
                      value={tier.maxAmount}
                      onChange={(e) => updateTier(index, "maxAmount", parseFloat(e.target.value) || 0)}
                      className="w-full bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-sm text-surface-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-surface-500 dark:text-surface-400 mb-1">Daily Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={tier.dailyRate}
                      onChange={(e) => updateTier(index, "dailyRate", parseFloat(e.target.value) || 0)}
                      className="w-full bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-sm text-surface-900 dark:text-white font-semibold text-brand-600 dark:text-brand-400"
                    />
                  </div>
                </div>
              </div>
            ))}
            {profitTiers.length === 0 && (
              <div className="text-center py-8 text-surface-500">
                No profit tiers configured. Click "Add Tier" to create one.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="space-y-4">
          {/* Today's Estimated Profit - Highlighted Card */}
          <div className="bg-gradient-to-r from-brand-500/10 to-emerald-500/10 dark:from-brand-500/20 dark:to-emerald-500/20 border border-brand-500/30 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-brand-500/20 dark:bg-brand-500/30">
                  <Calendar className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <p className="text-surface-600 dark:text-surface-400 text-sm font-medium">Today's Estimated Profit</p>
                  <p className="text-surface-900 dark:text-white font-bold text-2xl">{formatCurrency(stats.todayEstimatedProfit || 0)}</p>
                  <p className="text-surface-500 text-xs mt-1">
                    {stats.eligibleUserCount || 0} eligible users • Based on current deposit balances
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-surface-500 text-xs mb-1">Click "Run All" to distribute</p>
                <Badge variant="info">Pending Distribution</Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20">
                  <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-surface-500 dark:text-surface-400 text-xs">Total Distributed</p>
                  <p className="text-surface-900 dark:text-white font-semibold">{formatCurrency(stats.totalDistributed)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 dark:bg-amber-500/20">
                  <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-surface-500 dark:text-surface-400 text-xs">Pending Records</p>
                  <p className="text-surface-900 dark:text-white font-semibold">{stats.pendingDistributions}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
                  <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-surface-500 dark:text-surface-400 text-xs">Total Recipients</p>
                  <p className="text-surface-900 dark:text-white font-semibold">{stats.totalRecipients}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 dark:bg-purple-500/20">
                  <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-surface-500 dark:text-surface-400 text-xs">Avg. Share</p>
                  <p className="text-surface-900 dark:text-white font-semibold">{formatCurrency(stats.averageShare || 0)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700/50 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : profitShares.length === 0 ? (
          <div className="p-8 text-center">
            <TrendingUp className="w-12 h-12 text-surface-400 mx-auto mb-4" />
            <p className="text-surface-600 dark:text-surface-400">No profit share records found</p>
            <p className="text-surface-500 text-sm">Profit distributions will appear here</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-200 dark:border-surface-700">
                    <th className="text-left text-surface-600 dark:text-surface-400 font-medium p-4 text-sm">User</th>
                    <th className="text-left text-surface-600 dark:text-surface-400 font-medium p-4 text-sm">Amount</th>
                    <th className="text-left text-surface-600 dark:text-surface-400 font-medium p-4 text-sm">%</th>
                    <th className="text-left text-surface-600 dark:text-surface-400 font-medium p-4 text-sm">Investment</th>
                    <th className="text-left text-surface-600 dark:text-surface-400 font-medium p-4 text-sm">Date</th>
                    <th className="text-left text-surface-600 dark:text-surface-400 font-medium p-4 text-sm">Status</th>
                    <th className="text-right text-surface-600 dark:text-surface-400 font-medium p-4 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {profitShares.map((share) => (
                    <tr key={share._id} className="border-b border-surface-100 dark:border-surface-700/50 last:border-0 hover:bg-surface-50 dark:hover:bg-surface-700/30">
                      <td className="p-4">
                        <p className="text-surface-900 dark:text-white font-medium">{share.userId?.name || "Unknown"}</p>
                        <p className="text-surface-500 text-sm">{share.userId?.email || ""}</p>
                      </td>
                      <td className="p-4">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          {formatCurrency(share.amount)}
                        </span>
                      </td>
                      <td className="p-4 text-surface-700 dark:text-surface-300">
                        {share.percentage?.toFixed(2)}%
                      </td>
                      <td className="p-4 text-surface-700 dark:text-surface-300">
                        {formatCurrency(share.investmentAmount || 0)}
                      </td>
                      <td className="p-4 text-surface-500 dark:text-surface-400 text-sm">{formatDate(share.createdAt)}</td>
                      <td className="p-4">
                        <Badge
                          variant={
                            share.status === "APPROVED"
                              ? "success"
                              : share.status === "PENDING"
                              ? "warning"
                              : "danger"
                          }
                        >
                          {share.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          onClick={() => { setSelectedProfitShare(share); setIsModalOpen(true); }}
                          variant="secondary"
                          size="sm"
                          icon={<Eye className="w-4 h-4" />}
                        >
                          View
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

      {/* Detail Modal */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedProfitShare(null); }} title="Profit Share Details">
        {selectedProfitShare && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-surface-500 dark:text-surface-400 text-sm">User</label>
                <p className="text-surface-900 dark:text-white font-medium">{selectedProfitShare.userId?.name}</p>
                <p className="text-surface-500 text-sm">{selectedProfitShare.userId?.email}</p>
              </div>
              <div>
                <label className="text-surface-500 dark:text-surface-400 text-sm">Amount</label>
                <p className="text-emerald-600 dark:text-emerald-400 font-bold text-xl">{formatCurrency(selectedProfitShare.amount)}</p>
              </div>
              <div>
                <label className="text-surface-500 dark:text-surface-400 text-sm">Percentage</label>
                <p className="text-surface-900 dark:text-white">{selectedProfitShare.percentage?.toFixed(2)}%</p>
              </div>
              <div>
                <label className="text-surface-500 dark:text-surface-400 text-sm">Investment Amount</label>
                <p className="text-surface-900 dark:text-white">{formatCurrency(selectedProfitShare.investmentAmount || 0)}</p>
              </div>
              <div>
                <label className="text-surface-500 dark:text-surface-400 text-sm">Status</label>
                <div className="mt-1">
                  <Badge
                    variant={
                      selectedProfitShare.status === "APPROVED"
                        ? "success"
                        : selectedProfitShare.status === "PENDING"
                        ? "warning"
                        : "danger"
                    }
                  >
                    {selectedProfitShare.status}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-surface-500 dark:text-surface-400 text-sm">Created At</label>
                <p className="text-surface-900 dark:text-white">{formatDate(selectedProfitShare.createdAt)}</p>
              </div>
            </div>
            {selectedProfitShare.processedAt && (
              <div>
                <label className="text-surface-500 dark:text-surface-400 text-sm">Processed At</label>
                <p className="text-surface-900 dark:text-white">{formatDate(selectedProfitShare.processedAt)}</p>
              </div>
            )}
            <div className="flex gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
              <Button onClick={() => { setIsModalOpen(false); setSelectedProfitShare(null); }} variant="secondary" className="flex-1">
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

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
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-700 dark:text-amber-200 text-sm font-medium">System-wide Change</p>
              <p className="text-amber-600 dark:text-amber-200/70 text-sm">
                Updating these addresses will affect all users. The new addresses will be shown on the deposit page for all networks.
              </p>
            </div>
          </div>

          {/* Error Alert */}
          {addressError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-600 dark:text-red-400 text-sm">{addressError}</p>
            </div>
          )}

          {/* Success Alert */}
          {addressSuccess && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <p className="text-green-600 dark:text-green-400 text-sm">{addressSuccess}</p>
            </div>
          )}

          {/* ERC20 Address */}
          <div className="bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-surface-600 dark:text-surface-400 text-sm font-medium">ERC20 (Ethereum)</label>
              <span className="text-xs bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">ETH Network</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editedAddresses.ERC20}
                onChange={(e) => setEditedAddresses({ ...editedAddresses, ERC20: e.target.value })}
                placeholder="0x..."
                className="flex-1 bg-white dark:bg-surface-900 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-surface-900 dark:text-white font-mono text-sm focus:outline-none focus:border-brand-500"
              />
              <button
                onClick={() => copyToClipboard(editedAddresses.ERC20, 'ERC20')}
                className="p-2 bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600 rounded-lg transition-colors"
                title="Copy address"
              >
                {copiedAddress === 'ERC20' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-surface-500 dark:text-surface-400" />
                )}
              </button>
            </div>
          </div>

          {/* TRC20 Address */}
          <div className="bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-surface-600 dark:text-surface-400 text-sm font-medium">TRC20 (Tron)</label>
              <span className="text-xs bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded">TRON Network</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editedAddresses.TRC20}
                onChange={(e) => setEditedAddresses({ ...editedAddresses, TRC20: e.target.value })}
                placeholder="T..."
                className="flex-1 bg-white dark:bg-surface-900 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-surface-900 dark:text-white font-mono text-sm focus:outline-none focus:border-brand-500"
              />
              <button
                onClick={() => copyToClipboard(editedAddresses.TRC20, 'TRC20')}
                className="p-2 bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600 rounded-lg transition-colors"
                title="Copy address"
              >
                {copiedAddress === 'TRC20' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-surface-500 dark:text-surface-400" />
                )}
              </button>
            </div>
          </div>

          {/* BEP20 Address */}
          <div className="bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-surface-600 dark:text-surface-400 text-sm font-medium">BEP20 (BSC)</label>
              <span className="text-xs bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded">BSC Network</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editedAddresses.BEP20}
                onChange={(e) => setEditedAddresses({ ...editedAddresses, BEP20: e.target.value })}
                placeholder="0x..."
                className="flex-1 bg-white dark:bg-surface-900 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-surface-900 dark:text-white font-mono text-sm focus:outline-none focus:border-brand-500"
              />
              <button
                onClick={() => copyToClipboard(editedAddresses.BEP20, 'BEP20')}
                className="p-2 bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600 rounded-lg transition-colors"
                title="Copy address"
              >
                {copiedAddress === 'BEP20' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 text-surface-500 dark:text-surface-400" />
                )}
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
            <Button onClick={closeAddressModal} variant="secondary" className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={saveDepositAddresses}
              variant="primary"
              className="flex-1"
              isLoading={isSavingAddresses}
            >
              {isSavingAddresses ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
