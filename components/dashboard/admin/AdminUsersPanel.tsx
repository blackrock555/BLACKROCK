"use client";

import { useState, useEffect } from "react";
import { Badge, Button, Input, Skeleton, Pagination, Modal } from "@/components/ui";
import {
  Users,
  Search,
  RefreshCw,
  Eye,
  ArrowLeft,
  Ban,
  CheckCircle,
  Edit,
  Gift,
  DollarSign,
} from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED";
  balance: number;
  depositBalance: number;
  kycStatus: "NOT_SUBMITTED" | "PENDING" | "APPROVED" | "REJECTED";
  referralCount: number;
  createdAt: string;
}

interface AdminUsersPanelProps {
  onBack: () => void;
}

export function AdminUsersPanel({ onBack }: AdminUsersPanelProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bonusAmount, setBonusAmount] = useState("");
  const [bonusNote, setBonusNote] = useState("");
  const [showBonusForm, setShowBonusForm] = useState(false);
  const [bonusError, setBonusError] = useState<string | null>(null);
  const [bonusSuccess, setBonusSuccess] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });
      if (search) params.append("search", search);
      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users || []);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleToggleStatus = async (user: User) => {
    setIsProcessing(true);
    try {
      const action = user.status === "ACTIVE" ? "suspend" : "activate";
      const response = await fetch(`/api/admin/users/${user._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (response.ok) {
        fetchUsers();
        setIsModalOpen(false);
        setSelectedUser(null);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update user");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGiveBonus = async () => {
    if (!selectedUser) return;

    const amount = parseFloat(bonusAmount);
    if (isNaN(amount) || amount <= 0) {
      setBonusError("Please enter a valid positive amount");
      return;
    }

    if (amount > 5000) {
      setBonusError("Bonus amount cannot exceed $5,000");
      return;
    }

    setIsProcessing(true);
    setBonusError(null);
    setBonusSuccess(null);

    try {
      const response = await fetch(`/api/admin/users/${selectedUser._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "give_bonus",
          amount,
          note: bonusNote || "Admin bonus reward"
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setBonusSuccess(`Successfully granted $${amount.toLocaleString()} bonus to ${selectedUser.name}`);
        setBonusAmount("");
        setBonusNote("");
        setShowBonusForm(false);
        fetchUsers();
        // Update selected user balance locally
        setSelectedUser({ ...selectedUser, balance: data.user.balance });
        setTimeout(() => setBonusSuccess(null), 5000);
      } else {
        setBonusError(data.error || "Failed to grant bonus");
      }
    } catch (error) {
      setBonusError("An error occurred while granting bonus");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetBonusForm = () => {
    setBonusAmount("");
    setBonusNote("");
    setShowBonusForm(false);
    setBonusError(null);
    setBonusSuccess(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getKYCVariant = (status: string): "success" | "warning" | "danger" | "default" => {
    switch (status) {
      case "APPROVED": return "success";
      case "PENDING": return "warning";
      case "REJECTED": return "danger";
      default: return "default";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
            User Management
          </h3>
        </div>
        <Button onClick={fetchUsers} variant="secondary" size="sm" icon={<RefreshCw className="w-4 h-4" />}>
          Refresh
        </Button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
        </div>
        <Button type="submit" variant="primary">Search</Button>
      </form>

      <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700/50 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-surface-400 mx-auto mb-4" />
            <p className="text-surface-600 dark:text-surface-400">No users found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-200 dark:border-surface-700">
                    <th className="text-left text-surface-600 dark:text-surface-400 font-medium p-4 text-sm">User</th>
                    <th className="text-left text-surface-600 dark:text-surface-400 font-medium p-4 text-sm">Balance</th>
                    <th className="text-left text-surface-600 dark:text-surface-400 font-medium p-4 text-sm">KYC</th>
                    <th className="text-left text-surface-600 dark:text-surface-400 font-medium p-4 text-sm">Status</th>
                    <th className="text-left text-surface-600 dark:text-surface-400 font-medium p-4 text-sm">Joined</th>
                    <th className="text-right text-surface-600 dark:text-surface-400 font-medium p-4 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} className="border-b border-surface-100 dark:border-surface-700/50 last:border-0 hover:bg-surface-50 dark:hover:bg-surface-700/30">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center">
                            <span className="text-brand-600 dark:text-brand-400 font-medium">
                              {user.name?.charAt(0).toUpperCase() || "?"}
                            </span>
                          </div>
                          <div>
                            <p className="text-surface-900 dark:text-white font-medium">{user.name}</p>
                            <p className="text-surface-500 text-sm">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-surface-900 dark:text-white font-semibold">${user.balance.toLocaleString()}</p>
                        <p className="text-surface-500 text-sm">Deposit: ${user.depositBalance.toLocaleString()}</p>
                      </td>
                      <td className="p-4">
                        <Badge variant={getKYCVariant(user.kycStatus)}>
                          {user.kycStatus.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant={user.status === "ACTIVE" ? "success" : "danger"}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-surface-500 dark:text-surface-400 text-sm">{formatDate(user.createdAt)}</td>
                      <td className="p-4 text-right">
                        <Button
                          onClick={() => { setSelectedUser(user); setIsModalOpen(true); }}
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

      {/* User Detail Modal */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedUser(null); resetBonusForm(); }} title="User Details">
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-brand-500/20 flex items-center justify-center">
                <span className="text-brand-600 dark:text-brand-400 font-bold text-2xl">
                  {selectedUser.name?.charAt(0).toUpperCase() || "?"}
                </span>
              </div>
              <div>
                <p className="text-surface-900 dark:text-white font-bold text-lg">{selectedUser.name}</p>
                <p className="text-surface-500">{selectedUser.email}</p>
                <div className="flex gap-2 mt-1">
                  <Badge variant={selectedUser.role === "ADMIN" ? "info" : "default"}>{selectedUser.role}</Badge>
                  <Badge variant={selectedUser.status === "ACTIVE" ? "success" : "danger"}>{selectedUser.status}</Badge>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 bg-surface-100 dark:bg-surface-900 rounded-lg p-4">
              <div>
                <label className="text-surface-500 dark:text-surface-400 text-sm">Balance</label>
                <p className="text-surface-900 dark:text-white font-bold text-xl">${selectedUser.balance.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-surface-500 dark:text-surface-400 text-sm">Deposit Balance</label>
                <p className="text-surface-900 dark:text-white font-bold text-xl">${selectedUser.depositBalance.toLocaleString()}</p>
              </div>
              <div>
                <label className="text-surface-500 dark:text-surface-400 text-sm">KYC Status</label>
                <div className="mt-1">
                  <Badge variant={getKYCVariant(selectedUser.kycStatus)}>
                    {selectedUser.kycStatus.replace("_", " ")}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-surface-500 dark:text-surface-400 text-sm">Referrals</label>
                <p className="text-surface-900 dark:text-white font-semibold">{selectedUser.referralCount}</p>
              </div>
            </div>

            {/* Bonus Section */}
            <div className="border-t border-surface-200 dark:border-surface-700 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-surface-900 dark:text-white font-semibold flex items-center gap-2">
                  <Gift className="w-4 h-4 text-emerald-500" />
                  Grant Bonus
                </h4>
                {!showBonusForm && (
                  <Button
                    onClick={() => setShowBonusForm(true)}
                    variant="secondary"
                    size="sm"
                    icon={<DollarSign className="w-4 h-4" />}
                  >
                    Give Bonus
                  </Button>
                )}
              </div>

              {/* Success/Error Messages */}
              {bonusSuccess && (
                <div className="mb-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                  <p className="text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    {bonusSuccess}
                  </p>
                </div>
              )}

              {bonusError && (
                <div className="mb-3 bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-600 dark:text-red-400 text-sm">{bonusError}</p>
                </div>
              )}

              {showBonusForm && (
                <div className="bg-surface-50 dark:bg-surface-900 rounded-lg p-4 space-y-3">
                  <p className="text-surface-500 text-sm">
                    Grant a custom bonus to this user. This is separate from daily profit sharing.
                  </p>
                  <div>
                    <label className="block text-surface-700 dark:text-surface-300 text-sm font-medium mb-1">
                      Bonus Amount (USD)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">$</span>
                      <input
                        type="number"
                        min="1"
                        max="5000"
                        step="0.01"
                        value={bonusAmount}
                        onChange={(e) => setBonusAmount(e.target.value)}
                        placeholder="Enter amount (max $5,000)"
                        className="w-full pl-7 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-surface-900 dark:text-white focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-surface-700 dark:text-surface-300 text-sm font-medium mb-1">
                      Reason (Optional)
                    </label>
                    <input
                      type="text"
                      value={bonusNote}
                      onChange={(e) => setBonusNote(e.target.value)}
                      placeholder="e.g., Performance reward, Loyalty bonus..."
                      className="w-full bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-surface-900 dark:text-white focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleGiveBonus}
                      variant="primary"
                      size="sm"
                      icon={<Gift className="w-4 h-4" />}
                      isLoading={isProcessing}
                      disabled={!bonusAmount || parseFloat(bonusAmount) <= 0}
                    >
                      Grant Bonus
                    </Button>
                    <Button
                      onClick={resetBonusForm}
                      variant="ghost"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
              <Button
                onClick={() => handleToggleStatus(selectedUser)}
                variant={selectedUser.status === "ACTIVE" ? "danger" : "primary"}
                icon={selectedUser.status === "ACTIVE" ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                isLoading={isProcessing && !showBonusForm}
                className="flex-1"
              >
                {selectedUser.status === "ACTIVE" ? "Suspend User" : "Activate User"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
