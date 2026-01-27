"use client";

import { useState, useEffect } from "react";
import { Badge, Button, Modal, Skeleton, Pagination } from "@/components/ui";
import {
  ShieldCheck,
  Eye,
  Check,
  X,
  RefreshCw,
  ExternalLink,
  User,
  Calendar,
  MapPin,
  ArrowLeft,
} from "lucide-react";

interface KYCRequest {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  fullName: string;
  dateOfBirth: string;
  country: string;
  address: string;
  idFrontUrl: string;
  idBackUrl: string;
  selfieUrl: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  adminNote?: string;
  createdAt: string;
}

interface AdminKYCPanelProps {
  onBack: () => void;
}

export function AdminKYCPanel({ onBack }: AdminKYCPanelProps) {
  const [kycRequests, setKycRequests] = useState<KYCRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedKYC, setSelectedKYC] = useState<KYCRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const fetchKYCRequests = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/kyc?page=${page}&status=PENDING`);
      const data = await response.json();
      if (response.ok) {
        setKycRequests(data.kycRequests || []);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch KYC requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKYCRequests();
  }, [page]);

  const handleApprove = async (kyc: KYCRequest) => {
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/kyc/${kyc._id}/approve`, { method: "POST" });
      if (response.ok) {
        fetchKYCRequests();
        setIsModalOpen(false);
        setSelectedKYC(null);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to approve KYC");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedKYC) return;
    setIsProcessing(true);
    try {
      const response = await fetch(`/api/admin/kyc/${selectedKYC._id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      if (response.ok) {
        fetchKYCRequests();
        setShowRejectModal(false);
        setIsModalOpen(false);
        setSelectedKYC(null);
        setRejectReason("");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to reject KYC");
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
            Pending KYC Requests
          </h3>
        </div>
        <Button onClick={fetchKYCRequests} variant="secondary" size="sm" icon={<RefreshCw className="w-4 h-4" />}>
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
        ) : kycRequests.length === 0 ? (
          <div className="p-8 text-center">
            <ShieldCheck className="w-12 h-12 text-surface-400 mx-auto mb-4" />
            <p className="text-surface-600 dark:text-surface-400">No pending KYC requests</p>
            <p className="text-surface-500 text-sm">All KYC submissions have been reviewed</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-surface-200 dark:border-surface-700">
                    <th className="text-left text-surface-600 dark:text-surface-400 font-medium p-4 text-sm">User</th>
                    <th className="text-left text-surface-600 dark:text-surface-400 font-medium p-4 text-sm">Full Name</th>
                    <th className="text-left text-surface-600 dark:text-surface-400 font-medium p-4 text-sm">Country</th>
                    <th className="text-left text-surface-600 dark:text-surface-400 font-medium p-4 text-sm">Submitted</th>
                    <th className="text-right text-surface-600 dark:text-surface-400 font-medium p-4 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {kycRequests.map((kyc) => (
                    <tr key={kyc._id} className="border-b border-surface-100 dark:border-surface-700/50 last:border-0 hover:bg-surface-50 dark:hover:bg-surface-700/30">
                      <td className="p-4">
                        <p className="text-surface-900 dark:text-white font-medium">{kyc.userId?.name || "Unknown"}</p>
                        <p className="text-surface-500 text-sm">{kyc.userId?.email || ""}</p>
                      </td>
                      <td className="p-4 text-surface-900 dark:text-white">{kyc.fullName}</td>
                      <td className="p-4 text-surface-700 dark:text-surface-300">{kyc.country}</td>
                      <td className="p-4 text-surface-500 dark:text-surface-400 text-sm">{formatDate(kyc.createdAt)}</td>
                      <td className="p-4 text-right">
                        <Button
                          onClick={() => { setSelectedKYC(kyc); setIsModalOpen(true); }}
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
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setSelectedKYC(null); }} title="Review KYC Submission" size="lg">
        {selectedKYC && (
          <div className="space-y-6">
            <div className="bg-surface-100 dark:bg-surface-900 rounded-lg p-4">
              <h4 className="text-surface-500 dark:text-surface-400 text-sm mb-3">Account Info</h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <p className="text-surface-900 dark:text-white font-medium">{selectedKYC.userId?.name}</p>
                  <p className="text-surface-500 text-sm">{selectedKYC.userId?.email}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-surface-500 dark:text-surface-400 text-sm flex items-center gap-2">
                  <User className="w-4 h-4" /> Full Legal Name
                </label>
                <p className="text-surface-900 dark:text-white font-medium mt-1">{selectedKYC.fullName}</p>
              </div>
              <div>
                <label className="text-surface-500 dark:text-surface-400 text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Date of Birth
                </label>
                <p className="text-surface-900 dark:text-white mt-1">{formatDate(selectedKYC.dateOfBirth)}</p>
              </div>
              <div>
                <label className="text-surface-500 dark:text-surface-400 text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Country
                </label>
                <p className="text-surface-900 dark:text-white mt-1">{selectedKYC.country}</p>
              </div>
              <div>
                <label className="text-surface-500 dark:text-surface-400 text-sm flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Address
                </label>
                <p className="text-surface-900 dark:text-white mt-1">{selectedKYC.address}</p>
              </div>
            </div>
            <div>
              <h4 className="text-surface-500 dark:text-surface-400 text-sm mb-3">Documents</h4>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "ID Front", url: selectedKYC.idFrontUrl },
                  { label: "ID Back", url: selectedKYC.idBackUrl },
                  { label: "Selfie with ID", url: selectedKYC.selfieUrl },
                ].map((doc) => (
                  <div key={doc.label}>
                    <label className="text-surface-500 text-xs mb-2 block">{doc.label}</label>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="block bg-surface-100 dark:bg-surface-900 rounded-lg p-4 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors">
                      <div className="flex flex-col items-center gap-2">
                        <ExternalLink className="w-6 h-6 text-brand-600 dark:text-brand-400" />
                        <span className="text-brand-600 dark:text-brand-400 text-sm">View</span>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
              <Button onClick={() => handleApprove(selectedKYC)} variant="primary" icon={<Check className="w-4 h-4" />} isLoading={isProcessing} className="flex-1">
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
      <Modal isOpen={showRejectModal} onClose={() => { setShowRejectModal(false); setRejectReason(""); }} title="Reject KYC">
        <div className="space-y-4">
          <div>
            <label className="block text-surface-600 dark:text-surface-400 text-sm mb-2">Rejection Reason</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Documents unclear, name mismatch..."
              className="w-full bg-white dark:bg-surface-900 border border-surface-300 dark:border-surface-700 rounded-lg p-3 text-surface-900 dark:text-white placeholder-surface-400 dark:placeholder-surface-500 focus:outline-none focus:border-brand-500 resize-none"
              rows={3}
            />
          </div>
          <div className="flex gap-3">
            <Button onClick={() => { setShowRejectModal(false); setRejectReason(""); }} variant="secondary" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleReject} variant="danger" isLoading={isProcessing} className="flex-1">
              Reject KYC
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
