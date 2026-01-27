"use client";

import { useState, useEffect } from "react";
import { Badge, Button, Modal, Skeleton, Pagination } from "@/components/ui";
import {
  FileText,
  Eye,
  RefreshCw,
  ArrowLeft,
  User,
  Shield,
  Activity,
  Calendar,
  Filter,
} from "lucide-react";

interface AuditLog {
  _id: string;
  action: string;
  category: "AUTH" | "USER" | "TRANSACTION" | "KYC" | "ADMIN" | "SYSTEM";
  description: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
  };
  adminId?: {
    _id: string;
    name: string;
    email: string;
  };
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

interface AdminAuditLogsPanelProps {
  onBack: () => void;
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  AUTH: { bg: "bg-blue-500/10 dark:bg-blue-500/20", text: "text-blue-600 dark:text-blue-400" },
  USER: { bg: "bg-purple-500/10 dark:bg-purple-500/20", text: "text-purple-600 dark:text-purple-400" },
  TRANSACTION: { bg: "bg-emerald-500/10 dark:bg-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400" },
  KYC: { bg: "bg-amber-500/10 dark:bg-amber-500/20", text: "text-amber-600 dark:text-amber-400" },
  ADMIN: { bg: "bg-red-500/10 dark:bg-red-500/20", text: "text-red-600 dark:text-red-400" },
  SYSTEM: { bg: "bg-surface-500/10 dark:bg-surface-500/20", text: "text-surface-600 dark:text-surface-400" },
};

export function AdminAuditLogsPanel({ onBack }: AdminAuditLogsPanelProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const fetchAuditLogs = async () => {
    setIsLoading(true);
    try {
      const categoryParam = categoryFilter !== "all" ? `&category=${categoryFilter}` : "";
      const response = await fetch(`/api/admin/audit-logs?page=${page}${categoryParam}`);
      const data = await response.json();
      if (response.ok) {
        setAuditLogs(data.logs || []);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [page, categoryFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getCategoryStyle = (category: string) => {
    return categoryColors[category] || categoryColors.SYSTEM;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
            Audit Logs
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-700 rounded-lg px-3 py-2 text-sm text-surface-900 dark:text-white focus:outline-none focus:border-brand-500"
          >
            <option value="all">All Categories</option>
            <option value="AUTH">Authentication</option>
            <option value="USER">User Actions</option>
            <option value="TRANSACTION">Transactions</option>
            <option value="KYC">KYC</option>
            <option value="ADMIN">Admin Actions</option>
            <option value="SYSTEM">System</option>
          </select>
          <Button onClick={fetchAuditLogs} variant="secondary" size="sm" icon={<RefreshCw className="w-4 h-4" />}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700/50 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(10)].map((_, i) => (
              <Skeleton key={i} className="h-14" />
            ))}
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-surface-400 mx-auto mb-4" />
            <p className="text-surface-600 dark:text-surface-400">No audit logs found</p>
            <p className="text-surface-500 text-sm">System activity will be logged here</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-200 dark:border-surface-700">
                    <th className="text-left text-surface-600 dark:text-surface-400 font-medium p-4 text-sm">Action</th>
                    <th className="text-left text-surface-600 dark:text-surface-400 font-medium p-4 text-sm">Category</th>
                    <th className="text-left text-surface-600 dark:text-surface-400 font-medium p-4 text-sm">User</th>
                    <th className="text-left text-surface-600 dark:text-surface-400 font-medium p-4 text-sm">Date</th>
                    <th className="text-right text-surface-600 dark:text-surface-400 font-medium p-4 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => {
                    const categoryStyle = getCategoryStyle(log.category);
                    return (
                      <tr key={log._id} className="border-b border-surface-100 dark:border-surface-700/50 last:border-0 hover:bg-surface-50 dark:hover:bg-surface-700/30">
                        <td className="p-4">
                          <p className="text-surface-900 dark:text-white font-medium">{log.action}</p>
                          <p className="text-surface-500 text-sm line-clamp-1">{log.description}</p>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${categoryStyle.bg} ${categoryStyle.text}`}>
                            {log.category}
                          </span>
                        </td>
                        <td className="p-4">
                          {log.userId ? (
                            <div>
                              <p className="text-surface-900 dark:text-white font-medium text-sm">{log.userId.name}</p>
                              <p className="text-surface-500 text-xs">{log.userId.email}</p>
                            </div>
                          ) : log.adminId ? (
                            <div className="flex items-center gap-1">
                              <Shield className="w-3 h-3 text-brand-500" />
                              <div>
                                <p className="text-surface-900 dark:text-white font-medium text-sm">{log.adminId.name}</p>
                                <p className="text-surface-500 text-xs">{log.adminId.email}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-surface-500 text-sm">System</span>
                          )}
                        </td>
                        <td className="p-4 text-surface-500 dark:text-surface-400 text-sm whitespace-nowrap">
                          {formatDate(log.createdAt)}
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            onClick={() => { setSelectedLog(log); setIsModalOpen(true); }}
                            variant="secondary"
                            size="sm"
                            icon={<Eye className="w-4 h-4" />}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
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
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedLog(null); }} title="Audit Log Details">
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-surface-500 dark:text-surface-400 text-sm">Action</label>
                <p className="text-surface-900 dark:text-white font-medium">{selectedLog.action}</p>
              </div>
              <div>
                <label className="text-surface-500 dark:text-surface-400 text-sm">Category</label>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getCategoryStyle(selectedLog.category).bg} ${getCategoryStyle(selectedLog.category).text}`}>
                    {selectedLog.category}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-surface-500 dark:text-surface-400 text-sm">Description</label>
              <p className="text-surface-900 dark:text-white">{selectedLog.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {selectedLog.userId && (
                <div>
                  <label className="text-surface-500 dark:text-surface-400 text-sm">User</label>
                  <p className="text-surface-900 dark:text-white font-medium">{selectedLog.userId.name}</p>
                  <p className="text-surface-500 text-sm">{selectedLog.userId.email}</p>
                </div>
              )}
              {selectedLog.adminId && (
                <div>
                  <label className="text-surface-500 dark:text-surface-400 text-sm">Admin</label>
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-brand-500" />
                    <div>
                      <p className="text-surface-900 dark:text-white font-medium">{selectedLog.adminId.name}</p>
                      <p className="text-surface-500 text-sm">{selectedLog.adminId.email}</p>
                    </div>
                  </div>
                </div>
              )}
              <div>
                <label className="text-surface-500 dark:text-surface-400 text-sm">Date & Time</label>
                <p className="text-surface-900 dark:text-white">{formatDate(selectedLog.createdAt)}</p>
              </div>
            </div>

            {selectedLog.ipAddress && (
              <div>
                <label className="text-surface-500 dark:text-surface-400 text-sm">IP Address</label>
                <p className="text-surface-900 dark:text-white font-mono text-sm">{selectedLog.ipAddress}</p>
              </div>
            )}

            {selectedLog.userAgent && (
              <div>
                <label className="text-surface-500 dark:text-surface-400 text-sm">User Agent</label>
                <p className="text-surface-900 dark:text-white text-sm break-all">{selectedLog.userAgent}</p>
              </div>
            )}

            {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
              <div>
                <label className="text-surface-500 dark:text-surface-400 text-sm">Additional Data</label>
                <pre className="mt-1 p-3 bg-surface-100 dark:bg-surface-900 rounded-lg text-xs text-surface-900 dark:text-white overflow-x-auto">
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
              <Button onClick={() => { setIsModalOpen(false); setSelectedLog(null); }} variant="secondary" className="flex-1">
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
