"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge, Button, Input, Skeleton, Alert } from "@/components/ui";
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Shield,
  Ban,
  CheckCircle,
  RefreshCw,
  Plus,
  Minus,
  Users,
} from "lucide-react";
import Link from "next/link";

interface UserData {
  _id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED" | "LOCKED";
  balance: number;
  depositBalance: number;
  referralCode: string;
  referralCount: number;
  kycStatus: "NOT_SUBMITTED" | "PENDING" | "APPROVED" | "REJECTED";
  phone?: string;
  country?: string;
  createdAt: string;
  updatedAt: string;
}

interface Transaction {
  _id: string;
  type: string;
  amount: number;
  status: string;
  metadata?: {
    description?: string;
  };
  createdAt: string;
}

interface Stats {
  totalDeposits: number;
  depositCount: number;
  totalWithdrawals: number;
  withdrawalCount: number;
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<UserData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActioning, setIsActioning] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Balance adjustment
  const [showAdjustment, setShowAdjustment] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustNote, setAdjustNote] = useState("");

  const fetchUser = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setTransactions(data.transactions || []);
        setStats(data.stats);
      } else {
        setError(data.error || "Failed to fetch user");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const handleAction = async (action: string) => {
    if (!confirm(`Are you sure you want to ${action.replace("_", " ")} this user?`)) {
      return;
    }

    setIsActioning(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`User ${action.replace("_", " ")} successful`);
        fetchUser();
      } else {
        setError(data.error || "Action failed");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setIsActioning(false);
    }
  };

  const handleBalanceAdjustment = async (isAdd: boolean) => {
    const amount = parseFloat(adjustAmount);
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setIsActioning(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "adjust_balance",
          amount: isAdd ? amount : -amount,
          note: adjustNote,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Balance ${isAdd ? "added" : "deducted"} successfully`);
        setShowAdjustment(false);
        setAdjustAmount("");
        setAdjustNote("");
        fetchUser();
      } else {
        setError(data.error || "Adjustment failed");
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setIsActioning(false);
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

  const getStatusVariant = (status: string): "success" | "danger" | "warning" => {
    switch (status) {
      case "ACTIVE":
      case "COMPLETED":
      case "APPROVED":
        return "success";
      case "SUSPENDED":
      case "FAILED":
      case "REJECTED":
        return "danger";
      default:
        return "warning";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-surface-400">User not found</p>
        <Link href="/admin/users">
          <Button variant="secondary" className="mt-4">
            Back to Users
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="secondary" size="sm" icon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{user.name}</h1>
          <p className="text-surface-400">{user.email}</p>
        </div>
        <Button
          onClick={fetchUser}
          variant="secondary"
          icon={<RefreshCw className="w-4 h-4" />}
        >
          Refresh
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* User Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Basic Info */}
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">User Info</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-surface-400" />
              <span className="text-surface-300">{user.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-surface-400" />
              <span className="text-surface-300">{user.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-surface-400" />
              <span className="text-surface-300">Joined {formatDate(user.createdAt)}</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-surface-400" />
              <span className="text-surface-300">{user.referralCount} referrals</span>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Badge variant={user.role === "ADMIN" ? "info" : "default"}>
                {user.role}
              </Badge>
              <Badge variant={getStatusVariant(user.status)}>
                {user.status}
              </Badge>
              <Badge variant={getStatusVariant(user.kycStatus)}>
                KYC: {user.kycStatus.replace("_", " ")}
              </Badge>
            </div>
          </div>
        </div>

        {/* Balance */}
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Balance</h3>
          <div className="space-y-4">
            <div>
              <p className="text-surface-400 text-sm">Available Balance</p>
              <p className="text-3xl font-bold text-white">
                ${(user.balance || 0).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-surface-400 text-sm">Deposit Balance</p>
              <p className="text-xl font-semibold text-brand-400">
                ${(user.depositBalance || 0).toLocaleString()}
              </p>
            </div>
            <Button
              onClick={() => setShowAdjustment(!showAdjustment)}
              variant="secondary"
              className="w-full"
            >
              {showAdjustment ? "Cancel" : "Adjust Balance"}
            </Button>

            {showAdjustment && (
              <div className="space-y-3 pt-2 border-t border-surface-800">
                <Input
                  type="number"
                  placeholder="Amount"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                />
                <Input
                  type="text"
                  placeholder="Note (optional)"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleBalanceAdjustment(true)}
                    variant="primary"
                    size="sm"
                    isLoading={isActioning}
                    icon={<Plus className="w-4 h-4" />}
                    className="flex-1"
                  >
                    Add
                  </Button>
                  <Button
                    onClick={() => handleBalanceAdjustment(false)}
                    variant="danger"
                    size="sm"
                    isLoading={isActioning}
                    icon={<Minus className="w-4 h-4" />}
                    className="flex-1"
                  >
                    Deduct
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <span className="text-surface-300">Total Deposits</span>
              </div>
              <span className="text-white font-semibold">
                ${(stats?.totalDeposits || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-400" />
                <span className="text-surface-300">Total Withdrawals</span>
              </div>
              <span className="text-white font-semibold">
                ${(stats?.totalWithdrawals || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-surface-400">Deposit Count</span>
              <span className="text-surface-300">{stats?.depositCount || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-surface-400">Withdrawal Count</span>
              <span className="text-surface-300">{stats?.withdrawalCount || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
        <div className="flex flex-wrap gap-3">
          {user.status === "ACTIVE" ? (
            <Button
              onClick={() => handleAction("suspend")}
              variant="danger"
              isLoading={isActioning}
              icon={<Ban className="w-4 h-4" />}
            >
              Suspend User
            </Button>
          ) : (
            <Button
              onClick={() => handleAction("activate")}
              variant="primary"
              isLoading={isActioning}
              icon={<CheckCircle className="w-4 h-4" />}
            >
              Activate User
            </Button>
          )}

          {user.role === "USER" ? (
            <Button
              onClick={() => handleAction("make_admin")}
              variant="secondary"
              isLoading={isActioning}
              icon={<Shield className="w-4 h-4" />}
            >
              Make Admin
            </Button>
          ) : (
            <Button
              onClick={() => handleAction("remove_admin")}
              variant="secondary"
              isLoading={isActioning}
              icon={<Shield className="w-4 h-4" />}
            >
              Remove Admin
            </Button>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-surface-800">
          <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 text-center text-surface-500">
            No transactions found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-800">
                  <th className="text-left text-surface-400 font-medium p-4 text-sm">Type</th>
                  <th className="text-left text-surface-400 font-medium p-4 text-sm">Amount</th>
                  <th className="text-left text-surface-400 font-medium p-4 text-sm">Status</th>
                  <th className="text-left text-surface-400 font-medium p-4 text-sm">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id} className="border-b border-surface-800 last:border-0">
                    <td className="p-4">
                      <span className="text-white">{tx.type.replace("_", " ")}</span>
                      {tx.metadata?.description && (
                        <p className="text-surface-500 text-sm">{tx.metadata.description}</p>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={tx.amount >= 0 ? "text-green-400" : "text-red-400"}>
                        {tx.amount >= 0 ? "+" : ""}${Math.abs(tx.amount).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge variant={getStatusVariant(tx.status)}>{tx.status}</Badge>
                    </td>
                    <td className="p-4 text-surface-400 text-sm">{formatDate(tx.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
