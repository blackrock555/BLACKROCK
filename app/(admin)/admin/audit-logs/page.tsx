"use client";

import { useState, useEffect } from "react";
import { Badge, Button, Select, Skeleton, Pagination } from "@/components/ui";
import {
  FileText,
  RefreshCw,
  Filter,
  User,
  ArrowDownToLine,
  ArrowUpFromLine,
  ShieldCheck,
  DollarSign,
} from "lucide-react";

interface AuditLog {
  _id: string;
  action: string;
  adminId: {
    _id: string;
    name: string;
    email: string;
  };
  targetId?: {
    _id: string;
    name: string;
    email: string;
  };
  entityType: string;
  entityId: string;
  details: Record<string, unknown>;
  createdAt: string;
}

const ACTION_OPTIONS = [
  { value: "", label: "All Actions" },
  { value: "DEPOSIT_APPROVED", label: "Deposit Approved" },
  { value: "DEPOSIT_REJECTED", label: "Deposit Rejected" },
  { value: "WITHDRAWAL_APPROVED", label: "Withdrawal Approved" },
  { value: "WITHDRAWAL_REJECTED", label: "Withdrawal Rejected" },
  { value: "KYC_APPROVED", label: "KYC Approved" },
  { value: "KYC_REJECTED", label: "KYC Rejected" },
  { value: "USER_SUSPENDED", label: "User Suspended" },
  { value: "USER_ACTIVATED", label: "User Activated" },
  { value: "BALANCE_ADJUSTED", label: "Balance Adjusted" },
];

const getActionIcon = (action: string) => {
  if (action.includes("DEPOSIT")) return <ArrowDownToLine className="w-4 h-4" />;
  if (action.includes("WITHDRAWAL")) return <ArrowUpFromLine className="w-4 h-4" />;
  if (action.includes("KYC")) return <ShieldCheck className="w-4 h-4" />;
  if (action.includes("USER")) return <User className="w-4 h-4" />;
  if (action.includes("BALANCE")) return <DollarSign className="w-4 h-4" />;
  return <FileText className="w-4 h-4" />;
};

const getActionColor = (action: string) => {
  if (action.includes("APPROVED") || action.includes("ACTIVATED")) {
    return "bg-green-500/20 text-green-400";
  }
  if (action.includes("REJECTED") || action.includes("SUSPENDED")) {
    return "bg-red-500/20 text-red-400";
  }
  return "bg-surface-500/20 text-surface-400";
};

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState("");

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
      });
      if (actionFilter) params.append("action", actionFilter);

      const response = await fetch(`/api/admin/audit-logs?${params}`);
      const data = await response.json();

      if (response.ok) {
        setLogs(data.logs || []);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
          <p className="text-surface-400 mt-1">
            Track all admin actions on the platform
          </p>
        </div>
        <Button
          onClick={fetchLogs}
          variant="secondary"
          icon={<RefreshCw className="w-4 h-4" />}
        >
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-2 text-surface-400">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter:</span>
          </div>
          <div className="w-full sm:w-64">
            <Select
              options={ACTION_OPTIONS}
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* Audit Logs */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-surface-600 mx-auto mb-4" />
            <p className="text-surface-400">No audit logs found</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-surface-800">
              {logs.map((log) => (
                <div key={log._id} className="p-4 hover:bg-surface-800/50">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-2 rounded-lg ${getActionColor(log.action)}`}
                    >
                      {getActionIcon(log.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="text-white font-medium">
                          {formatAction(log.action)}
                        </span>
                        <Badge variant="info" className="text-xs w-fit">
                          {log.entityType}
                        </Badge>
                      </div>
                      <div className="mt-1 text-sm text-surface-400">
                        <span className="text-surface-300">
                          {log.adminId?.name || "System"}
                        </span>
                        {log.targetId && (
                          <>
                            {" → "}
                            <span className="text-surface-300">
                              {log.targetId?.name}
                            </span>
                            <span className="text-surface-500 ml-1">
                              ({log.targetId?.email})
                            </span>
                          </>
                        )}
                      </div>
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="mt-2 text-xs text-surface-500 bg-surface-800 rounded p-2">
                          {Object.entries(log.details).map(([key, value]) => (
                            <span key={key} className="mr-4">
                              <span className="text-surface-400">{key}:</span>{" "}
                              {typeof value === "number"
                                ? key.toLowerCase().includes("amount")
                                  ? `$${value.toLocaleString()}`
                                  : value
                                : String(value)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-surface-500 text-sm whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
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
    </div>
  );
}
