"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardBody, Badge, Button, Skeleton } from "@/components/ui";
import {
  Shield,
  ArrowDownToLine,
  ArrowUpFromLine,
  ShieldCheck,
  Users,
  TrendingUp,
  FileText,
  ChevronRight,
  DollarSign,
  AlertTriangle,
  Settings,
} from "lucide-react";
import { AdminStatsCard } from "./AdminStatsCard";
import { AdminPendingQueues } from "./AdminPendingQueues";
import { AdminDepositsPanel } from "./AdminDepositsPanel";
import { AdminWithdrawalsPanel } from "./AdminWithdrawalsPanel";
import { AdminKYCPanel } from "./AdminKYCPanel";
import { AdminUsersPanel } from "./AdminUsersPanel";
import { AdminProfitSharePanel } from "./AdminProfitSharePanel";
import { AdminAuditLogsPanel } from "./AdminAuditLogsPanel";
import { AdminSettingsPanel } from "./AdminSettingsPanel";
import AdminSupportPanel from "./AdminSupportPanel";
import { AdminView } from "@/lib/adminNavConfig";

interface AdminStats {
  totalDeposits: number;
  totalWithdrawals: number;
  totalUsers: number;
  verifiedUsers: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  pendingKYC: number;
  totalProfitShared: number;
}

interface RecentActivity {
  _id: string;
  type: "DEPOSIT" | "WITHDRAWAL" | "KYC" | "PROFIT_SHARE";
  description: string;
  amount?: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

interface AdminSectionProps {
  initialView?: AdminView;
  onBack?: () => void;
}

export function AdminSection({ initialView, onBack }: AdminSectionProps) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<AdminView>(initialView || "overview");

  // Sync with initialView prop when it changes
  useEffect(() => {
    if (initialView) {
      setCurrentView(initialView);
    }
  }, [initialView]);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/dashboard");
      const data = await response.json();
      if (response.ok) {
        setStats(data.stats);
        setRecentActivity(data.recentActivity || []);
      }
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSelectSection = (section: string) => {
    setCurrentView(section as AdminView);
  };

  const handleBack = () => {
    if (onBack) {
      // Use the parent's back handler for URL navigation
      onBack();
    } else {
      // Fallback to internal state for overview mode
      setCurrentView("overview");
      fetchAdminData();
    }
  };

  // Total pending count for alert
  const totalPending = (stats?.pendingDeposits || 0) + (stats?.pendingWithdrawals || 0) + (stats?.pendingKYC || 0);

  // Render different views based on currentView
  if (currentView === "deposits") {
    return <AdminDepositsPanel onBack={handleBack} />;
  }

  if (currentView === "withdrawals") {
    return <AdminWithdrawalsPanel onBack={handleBack} />;
  }

  if (currentView === "kyc") {
    return <AdminKYCPanel onBack={handleBack} />;
  }

  if (currentView === "users") {
    return <AdminUsersPanel onBack={handleBack} />;
  }

  if (currentView === "profit-share") {
    return <AdminProfitSharePanel onBack={handleBack} />;
  }

  if (currentView === "audit-logs") {
    return <AdminAuditLogsPanel onBack={handleBack} />;
  }

  if (currentView === "support") {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          ← Back to Admin
        </Button>
        <AdminSupportPanel />
      </div>
    );
  }

  if (currentView === "settings") {
    return <AdminSettingsPanel onBack={handleBack} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Admin Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-500/10 dark:bg-brand-500/20">
            <Shield className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-surface-900 dark:text-white">
              Admin Controls
            </h2>
            <p className="text-surface-500 dark:text-surface-400 text-sm">
              Platform management and oversight
            </p>
          </div>
        </div>
        {totalPending > 0 && (
          <Badge variant="warning" className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {totalPending} pending
          </Badge>
        )}
      </div>

      {/* Admin Stats */}
      <AdminStatsCard stats={stats} isLoading={isLoading} />

      {/* Pending Queues */}
      <AdminPendingQueues
        stats={stats}
        isLoading={isLoading}
        onSelectSection={handleSelectSection}
      />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setCurrentView("users")}
          className="text-left"
        >
          <Card variant="elevated" className="h-full hover:border-brand-500/50 transition-colors">
            <CardBody compact>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 dark:bg-purple-500/20">
                    <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-surface-900 dark:text-white font-medium">Users</span>
                </div>
                <ChevronRight className="w-5 h-5 text-surface-400" />
              </div>
            </CardBody>
          </Card>
        </button>

        <button
          onClick={() => setCurrentView("profit-share")}
          className="text-left"
        >
          <Card variant="elevated" className="h-full hover:border-brand-500/50 transition-colors">
            <CardBody compact>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20">
                    <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-surface-900 dark:text-white font-medium">Profit Share</span>
                </div>
                <ChevronRight className="w-5 h-5 text-surface-400" />
              </div>
            </CardBody>
          </Card>
        </button>

        <button
          onClick={() => setCurrentView("audit-logs")}
          className="text-left"
        >
          <Card variant="elevated" className="h-full hover:border-brand-500/50 transition-colors">
            <CardBody compact>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-surface-900 dark:text-white font-medium">Audit Logs</span>
                </div>
                <ChevronRight className="w-5 h-5 text-surface-400" />
              </div>
            </CardBody>
          </Card>
        </button>

        <button
          onClick={() => setCurrentView("settings")}
          className="text-left"
        >
          <Card variant="elevated" className="h-full hover:border-brand-500/50 transition-colors">
            <CardBody compact>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 dark:bg-amber-500/20">
                    <Settings className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-surface-900 dark:text-white font-medium">Settings</span>
                </div>
                <ChevronRight className="w-5 h-5 text-surface-400" />
              </div>
            </CardBody>
          </Card>
        </button>
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="p-5 border-b border-surface-200 dark:border-surface-700/50 flex items-center justify-between">
          <h3 className="text-base font-semibold text-surface-900 dark:text-white">
            Recent Admin Activity
          </h3>
        </div>
        {isLoading ? (
          <div className="p-5 space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : recentActivity.length === 0 ? (
          <div className="p-8 text-center text-surface-500 dark:text-surface-400">
            No recent activity
          </div>
        ) : (
          <div className="divide-y divide-surface-100 dark:divide-surface-700/50">
            {recentActivity.slice(0, 5).map((activity) => (
              <div key={activity._id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-lg ${
                      activity.type === "DEPOSIT"
                        ? "bg-emerald-500/10 dark:bg-emerald-500/20"
                        : activity.type === "WITHDRAWAL"
                        ? "bg-red-500/10 dark:bg-red-500/20"
                        : activity.type === "KYC"
                        ? "bg-blue-500/10 dark:bg-blue-500/20"
                        : "bg-purple-500/10 dark:bg-purple-500/20"
                    }`}
                  >
                    {activity.type === "DEPOSIT" ? (
                      <ArrowDownToLine className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : activity.type === "WITHDRAWAL" ? (
                      <ArrowUpFromLine className="w-4 h-4 text-red-600 dark:text-red-400" />
                    ) : activity.type === "KYC" ? (
                      <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-surface-900 dark:text-white font-medium">
                      {activity.description}
                    </p>
                    <p className="text-surface-500 dark:text-surface-400 text-sm">
                      {formatDate(activity.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {activity.amount && (
                    <span className="text-surface-900 dark:text-white font-medium">
                      ${activity.amount.toLocaleString()}
                    </span>
                  )}
                  <Badge
                    variant={
                      activity.status === "APPROVED"
                        ? "success"
                        : activity.status === "PENDING"
                        ? "warning"
                        : "danger"
                    }
                  >
                    {activity.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
