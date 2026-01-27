"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardBody, Button, Alert } from "@/components/ui";
import {
  Award,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Eye,
  RefreshCw,
  X,
  Calendar,
  Hash,
  Wifi,
  User,
  Download,
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import html2canvas from "html2canvas";

interface Certificate {
  id: string;
  certificateNumber: string;
  amount: number;
  network: string;
  toAddress: string;
  issueDate: string;
  status: "ACTIVE" | "REVOKED";
}

export default function CertificatesPage() {
  const { data: session } = useSession();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  const handleDownload = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!certificateRef.current || !selectedCertificate) return;

    setIsDownloading(true);
    try {
      // Small delay to ensure animations are complete
      await new Promise((resolve) => setTimeout(resolve, 300));

      const element = certificateRef.current;

      const canvas = await html2canvas(element, {
        backgroundColor: "#0a0a0a",
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        removeContainer: true,
        foreignObjectRendering: false,
        imageTimeout: 0,
        onclone: (_clonedDoc, clonedElement) => {
          // Set explicit dimensions
          clonedElement.style.width = "480px";
          clonedElement.style.minWidth = "480px";
          clonedElement.style.position = "relative";
          clonedElement.style.overflow = "visible";
          clonedElement.style.transform = "none";
          clonedElement.style.opacity = "1";

          // Remove all background images that might cause issues
          const allElements = clonedElement.querySelectorAll("*");
          allElements.forEach((el) => {
            if (el instanceof HTMLElement) {
              el.style.visibility = "visible";
              el.style.opacity = "1";
              // Remove background-image patterns that can cause issues
              const bgImage = window.getComputedStyle(el).backgroundImage;
              if (bgImage && bgImage !== "none" && bgImage.includes("url")) {
                el.style.backgroundImage = "none";
              }
            }
          });

          // Fix SVG elements
          const svgs = clonedElement.querySelectorAll("svg");
          svgs.forEach((svg) => {
            svg.style.display = "inline-block";
            svg.style.visibility = "visible";
            svg.setAttribute("width", svg.getAttribute("width") || "80");
            svg.setAttribute("height", svg.getAttribute("height") || "300");
          });
        },
      });

      // Create download
      const dataUrl = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.download = `BLACKROCK-Certificate-${selectedCertificate.certificateNumber}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to download certificate:", err);

      // Last resort: create a simple canvas manually
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 960;
        canvas.height = 1200;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          // Dark background
          ctx.fillStyle = "#0a0a0a";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Certificate text
          ctx.fillStyle = "#22d3ee";
          ctx.font = "bold 48px Arial";
          ctx.textAlign = "center";
          ctx.fillText("CERTIFICATE", canvas.width / 2, 200);

          ctx.fillStyle = "#ffffff";
          ctx.font = "24px Arial";
          ctx.fillText("of Payout", canvas.width / 2, 250);

          ctx.font = "italic 36px Georgia";
          ctx.fillText(session?.user?.name || "Investor", canvas.width / 2, 380);

          ctx.fillStyle = "#22d3ee";
          ctx.font = "bold 56px Arial";
          ctx.fillText(`$${selectedCertificate.amount.toLocaleString()}`, canvas.width / 2, 500);

          ctx.fillStyle = "#888888";
          ctx.font = "14px Arial";
          ctx.fillText(`Certificate #: ${selectedCertificate.certificateNumber}`, canvas.width / 2, 700);
          ctx.fillText(`Date: ${new Date(selectedCertificate.issueDate).toLocaleDateString()}`, canvas.width / 2, 730);

          const dataUrl = canvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.download = `BLACKROCK-Certificate-${selectedCertificate.certificateNumber}.png`;
          link.href = dataUrl;
          link.click();
        }
      } catch (fallbackErr) {
        console.error("Fallback download also failed:", fallbackErr);
        alert("Unable to download certificate. Please try taking a screenshot instead.");
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const fetchCertificates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/certificates");
      if (!response.ok) throw new Error("Failed to fetch certificates");
      const data = await response.json();
      setCertificates(data.certificates || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load certificates");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
    });
  };

  const formatFullDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-400" />
            Payout Certificates
          </h1>
          <p className="text-surface-400 mt-1">
            View and share your withdrawal certificates
          </p>
        </div>
        <Button
          variant="ghost"
          icon={<RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />}
          onClick={fetchCertificates}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="error" icon={<AlertTriangle className="w-5 h-5" />}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && !certificates.length && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-gradient-to-br from-[#0d1225] to-[#0a0e1a] border-2 border-[#1a2035] rounded-xl p-6 animate-pulse"
            >
              <div className="h-8 bg-surface-700/50 rounded w-1/2 mx-auto mb-6" />
              <div className="h-12 bg-surface-700/50 rounded w-2/3 mx-auto mb-6" />
              <div className="h-4 bg-surface-700/50 rounded w-full mb-4" />
              <div className="h-4 bg-surface-700/50 rounded w-3/4 mx-auto" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && certificates.length === 0 && (
        <Card>
          <CardBody className="py-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
              <Award className="w-10 h-10 text-amber-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No Certificates Yet
            </h3>
            <p className="text-surface-400 mb-6 max-w-md mx-auto">
              Certificates are automatically generated when your withdrawals are approved.
              Complete a withdrawal to receive your first payout certificate.
            </p>
            <Button href="/withdraw" variant="primary">
              Request Withdrawal
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Certificates Grid */}
      {certificates.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {certificates.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Certificate Card with new design */}
              <div
                className="relative bg-[#0a0a0a] rounded-lg overflow-hidden cursor-pointer group hover:ring-2 hover:ring-cyan-500/30 transition-all duration-300"
                onClick={() => setSelectedCertificate(cert)}
              >
                {/* Geometric polygon decoration */}
                <div className="absolute left-0 top-0 bottom-0 w-16 overflow-hidden">
                  <svg viewBox="0 0 60 200" width="60" height="200" className="h-full w-full" preserveAspectRatio="none">
                    <polygon points="0,0 50,25 35,50 50,75 25,100 45,125 30,150 50,175 0,200" fill="#0d4f5a" opacity="0.8"/>
                    <polygon points="0,12 40,37 25,62 40,87 18,112 35,137 22,162 40,187 0,195" fill="#1a7a8a" opacity="0.6"/>
                    <polygon points="0,30 28,50 18,75 32,100 14,125 25,150 0,170" fill="#22a5b5" opacity="0.4"/>
                  </svg>
                </div>

                <div className="relative p-5">
                  {/* BLACKROCK Branding */}
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded flex items-center justify-center">
                      <Award className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-white text-sm font-bold tracking-wider">BLACKROCK</span>
                  </div>

                  {/* Header */}
                  <div className="text-center mb-3">
                    <h3 className="text-xl font-bold text-cyan-400 tracking-wider uppercase mb-0.5">
                      Certificate
                    </h3>
                    <p className="text-white text-xs tracking-widest uppercase">of Payout</p>
                  </div>

                  {/* Presented To */}
                  <div className="text-center mb-3">
                    <p className="text-cyan-400 text-[10px] italic tracking-wider mb-1">Is Presented To :</p>
                    <p className="text-lg text-white font-serif italic" style={{ fontFamily: "Georgia, serif" }}>
                      {session?.user?.name || "Investor"}
                    </p>
                    <div className="w-32 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto mt-1" />
                  </div>

                  {/* Amount */}
                  <div className="text-center mb-3">
                    <p className="text-2xl font-bold text-cyan-400">
                      {formatCurrency(cert.amount)}
                    </p>
                  </div>

                  {/* Ribbon Seal */}
                  <div className="flex justify-center mb-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg border-2 border-amber-300">
                        <Award className="w-5 h-5 text-amber-900" />
                      </div>
                      {/* Ribbon tails */}
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-0.5">
                        <div className="w-2 h-4 bg-gradient-to-b from-amber-500 to-amber-700 transform -skew-x-12 rounded-b" />
                        <div className="w-2 h-4 bg-gradient-to-b from-amber-500 to-amber-700 transform skew-x-12 rounded-b" />
                      </div>
                    </div>
                  </div>

                  {/* Footer info */}
                  <div className="flex items-center justify-between text-[10px] pt-3 border-t border-gray-800">
                    <div className="text-center">
                      <p className="text-white font-medium">{formatDate(cert.issueDate)}</p>
                      <p className="text-cyan-400 text-[9px] uppercase tracking-wider">Date</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-medium">{cert.certificateNumber.split("-").pop()}</p>
                      <p className="text-cyan-400 text-[9px] uppercase tracking-wider">Cert #</p>
                    </div>
                    <div className="text-center">
                      <p className="text-white font-medium">{cert.network}</p>
                      <p className="text-cyan-400 text-[9px] uppercase tracking-wider">Network</p>
                    </div>
                  </div>

                  {/* Status badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        cert.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      {cert.status}
                    </span>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg text-white text-xs font-medium flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      View Certificate
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Certificate Modal */}
      <AnimatePresence>
        {selectedCertificate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm overflow-y-auto"
            onClick={() => setSelectedCertificate(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full my-8"
            >
              {/* Close button */}
              <button
                onClick={() => setSelectedCertificate(null)}
                className="absolute -top-10 right-0 p-2 text-surface-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Certificate Design - Compact */}
              <div ref={certificateRef} className="relative bg-[#0a0a0a] rounded-lg overflow-hidden">
                {/* Geometric polygon decoration - left side */}
                <div className="absolute left-0 top-0 bottom-0 w-20 overflow-hidden">
                  <svg viewBox="0 0 80 300" width="80" height="300" className="h-full w-full" preserveAspectRatio="none">
                    <polygon points="0,0 70,35 50,70 70,105 35,140 60,175 45,210 70,245 0,300" fill="#0d4f5a" opacity="0.9"/>
                    <polygon points="0,15 55,50 35,85 55,120 25,155 50,190 30,225 55,260 0,285" fill="#1a7a8a" opacity="0.7"/>
                    <polygon points="0,35 40,65 25,100 45,135 18,170 38,205 22,240 0,265" fill="#22a5b5" opacity="0.5"/>
                    <polygon points="0,55 25,80 15,115 30,150 10,185 22,220 0,245" fill="#2dd4bf" opacity="0.3"/>
                  </svg>
                </div>

                <div className="relative p-6 sm:p-8">
                  {/* BLACKROCK Branding */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                      <Award className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white text-lg font-bold tracking-wider">BLACKROCK</span>
                  </div>

                  {/* Header */}
                  <div className="text-center mb-5">
                    <h2 className="text-3xl sm:text-4xl font-bold text-cyan-400 tracking-wider uppercase mb-1">
                      Certificate
                    </h2>
                    <p className="text-white text-sm tracking-[0.2em] uppercase">of Payout</p>
                  </div>

                  {/* Presented To */}
                  <div className="text-center mb-4">
                    <p className="text-cyan-400 text-xs italic tracking-wider mb-2">Is Presented To :</p>
                    <p className="text-2xl sm:text-3xl text-white font-serif italic mb-1" style={{ fontFamily: "Georgia, serif" }}>
                      {session?.user?.name || "Investor"}
                    </p>
                    <div className="w-56 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent mx-auto" />
                  </div>

                  {/* Amount */}
                  <div className="text-center my-5">
                    <p className="text-3xl sm:text-4xl font-bold text-cyan-400">
                      {formatCurrency(selectedCertificate.amount)}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-center text-gray-400 text-xs leading-relaxed max-w-sm mx-auto mb-4">
                    This investor has successfully completed a payout withdrawal.
                    Through discipline and smart investment strategies, this investor has proven themselves capable of
                    achieving their financial goals within our platform.
                  </p>

                  {/* Official Statement */}
                  <p className="text-center text-white text-xs mb-6">
                    This investor is officially a BLACKROCK Verified Investor.
                  </p>

                  {/* Signatures and Seal */}
                  <div className="flex items-end justify-between px-2">
                    {/* Left Signature */}
                    <div className="text-center">
                      <p className="text-white text-sm font-semibold">James Mitchell</p>
                      <p className="text-cyan-400 text-[10px] uppercase tracking-wider">Chief Executive</p>
                    </div>

                    {/* Center Ribbon Seal */}
                    <div className="relative flex flex-col items-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30 border-2 border-amber-300">
                        <Award className="w-6 h-6 text-amber-900" />
                      </div>
                      {/* Ribbon tails */}
                      <div className="flex gap-1 -mt-1">
                        <div className="w-3 h-6 bg-gradient-to-b from-amber-500 to-amber-700 transform -skew-x-12 rounded-b" />
                        <div className="w-3 h-6 bg-gradient-to-b from-amber-500 to-amber-700 transform skew-x-12 rounded-b" />
                      </div>
                    </div>

                    {/* Right Signature */}
                    <div className="text-center">
                      <p className="text-white text-sm font-semibold">Sarah Williams</p>
                      <p className="text-cyan-400 text-[10px] uppercase tracking-wider">Finance Director</p>
                    </div>
                  </div>

                  {/* Certificate Details Footer */}
                  <div className="flex items-center justify-center gap-6 mt-6 pt-3 border-t border-gray-800 text-[10px]">
                    <div className="text-center">
                      <p className="text-gray-500 uppercase tracking-wider">Date</p>
                      <p className="text-white">{formatFullDate(selectedCertificate.issueDate)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500 uppercase tracking-wider">Certificate #</p>
                      <p className="text-white text-[9px]">{selectedCertificate.certificateNumber}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-500 uppercase tracking-wider">Network</p>
                      <p className="text-white">{selectedCertificate.network}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setSelectedCertificate(null)}
                >
                  Close
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1 bg-gradient-to-r from-amber-500/10 to-amber-600/10 hover:from-amber-500/20 hover:to-amber-600/20 border-amber-500/30 text-amber-400"
                  icon={<Download className={`w-4 h-4 ${isDownloading ? "animate-bounce" : ""}`} />}
                  onClick={(e) => handleDownload(e)}
                  disabled={isDownloading}
                >
                  {isDownloading ? "Downloading..." : "Download"}
                </Button>
                <Link
                  href={`/verify/${selectedCertificate.certificateNumber}`}
                  target="_blank"
                  className="flex-1"
                >
                  <Button
                    variant="primary"
                    className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 border-none"
                    icon={<ExternalLink className="w-4 h-4" />}
                  >
                    Verify
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
