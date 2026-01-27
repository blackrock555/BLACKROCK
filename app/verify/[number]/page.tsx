"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Logo } from "@/components/branding/Logo";
import {
  CheckCircle,
  XCircle,
  Award,
  Loader2,
  AlertTriangle,
  Shield,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface VerificationResult {
  valid: boolean;
  message: string;
  certificate?: {
    certificateNumber: string;
    userName: string;
    amount: number;
    network: string;
    toAddress: string;
    issueDate: string;
    status: string;
  };
}

export default function VerifyCertificatePage() {
  const params = useParams();
  const number = params.number as string;
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyCertificate = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Add cache-busting timestamp to ensure fresh data
        const response = await fetch(`/api/certificates/verify/${number}?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          },
        });
        const data = await response.json();

        if (response.status === 500) {
          throw new Error(data.error || "Verification failed");
        }

        setResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Verification failed");
      } finally {
        setIsLoading(false);
      }
    };

    verifyCertificate();
  }, [number]);

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

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col">
      {/* Header */}
      <header className="border-b border-[#1a2035] bg-[#0d1225]/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
              <Award className="w-4 h-4 text-[#0a0e1a]" />
            </div>
            <span className="text-amber-400 font-semibold tracking-wider">BLACKROCK</span>
          </div>
          <div className="flex items-center gap-2 text-surface-400">
            <Shield className="w-4 h-4" />
            <span className="text-sm">Certificate Verification</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full"
        >
          {/* Loading State */}
          {isLoading && (
            <div className="bg-[#0d1225] border-2 border-[#1a2035] rounded-2xl p-12 text-center">
              <Loader2 className="w-16 h-16 text-amber-400 animate-spin mx-auto mb-6" />
              <p className="text-white text-xl font-semibold mb-2">Verifying Certificate...</p>
              <p className="text-surface-400 font-mono text-sm">
                {number}
              </p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-[#0d1225] border-2 border-[#1a2035] rounded-2xl p-12 text-center">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                <AlertTriangle className="w-10 h-10 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                Verification Error
              </h2>
              <p className="text-surface-400 mb-8">{error}</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-surface-800 hover:bg-surface-700 text-white rounded-xl font-medium transition-colors"
              >
                Return Home
              </Link>
            </div>
          )}

          {/* Result */}
          {result && !isLoading && (
            <div className="space-y-4">
              {/* Status Banner */}
              <div
                className={`p-6 rounded-xl border-2 flex items-center justify-center gap-4 ${
                  result.valid
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-red-500/10 border-red-500/30"
                }`}
              >
                {result.valid ? (
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-400" />
                )}
                <div>
                  <p
                    className={`text-xl font-bold ${
                      result.valid ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {result.valid ? "Valid Certificate" : "Invalid Certificate"}
                  </p>
                  <p className="text-surface-400 text-sm">{result.message}</p>
                </div>
              </div>

              {/* Certificate Display */}
              {result.certificate && (
                <div
                  className="relative bg-gradient-to-br from-[#0d1225] via-[#0a0e1a] to-[#0d1225] rounded-xl overflow-hidden"
                  style={{
                    border: "3px solid #1a2035",
                    borderRight: "4px solid #3b5998",
                    borderBottom: "4px solid #3b5998",
                  }}
                >
                  {/* Watermark */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-[180px] font-bold text-[#3b5998]/[0.03] select-none">B</span>
                  </div>

                  {/* Laurel decorations */}
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 opacity-[0.08]">
                    <svg width="70" height="180" viewBox="0 0 100 250" className="fill-[#8b9dc3]">
                      <ellipse cx="70" cy="50" rx="25" ry="12" transform="rotate(30 70 50)"/>
                      <ellipse cx="65" cy="80" rx="25" ry="12" transform="rotate(20 65 80)"/>
                      <ellipse cx="60" cy="110" rx="25" ry="12" transform="rotate(10 60 110)"/>
                      <ellipse cx="60" cy="140" rx="25" ry="12" transform="rotate(-10 60 140)"/>
                      <ellipse cx="65" cy="170" rx="25" ry="12" transform="rotate(-20 65 170)"/>
                      <ellipse cx="70" cy="200" rx="25" ry="12" transform="rotate(-30 70 200)"/>
                      <path d="M50 30 Q55 125 50 220" stroke="#8b9dc3" strokeWidth="3" fill="none"/>
                    </svg>
                  </div>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-[0.08] scale-x-[-1]">
                    <svg width="70" height="180" viewBox="0 0 100 250" className="fill-[#8b9dc3]">
                      <ellipse cx="70" cy="50" rx="25" ry="12" transform="rotate(30 70 50)"/>
                      <ellipse cx="65" cy="80" rx="25" ry="12" transform="rotate(20 65 80)"/>
                      <ellipse cx="60" cy="110" rx="25" ry="12" transform="rotate(10 60 110)"/>
                      <ellipse cx="60" cy="140" rx="25" ry="12" transform="rotate(-10 60 140)"/>
                      <ellipse cx="65" cy="170" rx="25" ry="12" transform="rotate(-20 65 170)"/>
                      <ellipse cx="70" cy="200" rx="25" ry="12" transform="rotate(-30 70 200)"/>
                      <path d="M50 30 Q55 125 50 220" stroke="#8b9dc3" strokeWidth="3" fill="none"/>
                    </svg>
                  </div>

                  <div className="relative p-8 sm:p-10">
                    {/* Header */}
                    <div className="text-center mb-6">
                      <div className="flex items-center justify-center gap-3 mb-5">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
                          <Award className="w-5 h-5 text-[#0a0e1a]" />
                        </div>
                        <span className="text-amber-400 text-2xl font-semibold tracking-wider">BLACKROCK</span>
                      </div>

                      <div className="flex items-center justify-center gap-6 mb-2">
                        <span className="h-px w-16 bg-gradient-to-r from-transparent to-surface-600" />
                        <span className="text-[#8b9dc3] text-sm tracking-[0.3em] uppercase">Payout</span>
                        <span className="h-px w-16 bg-gradient-to-l from-transparent to-surface-600" />
                      </div>

                      <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-[0.15em] uppercase">
                        Certificate
                      </h2>
                    </div>

                    {/* Amount Section */}
                    <div className="text-center my-8">
                      <p className="text-[#8b9dc3] text-sm tracking-[0.2em] uppercase mb-2">For the Amount of</p>
                      <p className="text-5xl sm:text-6xl font-bold text-amber-400 drop-shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                        {formatCurrency(result.certificate.amount)}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-center text-[#8b9dc3] text-sm leading-relaxed max-w-lg mx-auto mb-6">
                      This investor has successfully completed a withdrawal, demonstrating their commitment
                      to smart investment strategies. Their disciplined approach to portfolio management
                      has culminated in this achievement, proving their success with BLACKROCK.
                    </p>

                    {/* Recipient Name */}
                    <div className="text-center mb-8">
                      <p className="text-3xl sm:text-4xl text-white font-serif italic mb-2" style={{ fontFamily: "Georgia, serif" }}>
                        {result.certificate.userName}
                      </p>
                      <div className="w-56 h-px bg-gradient-to-r from-transparent via-surface-600 to-transparent mx-auto" />
                    </div>

                    {/* Footer */}
                    <div className="flex flex-wrap items-end justify-between gap-4 pt-6 border-t border-surface-700/30">
                      <div>
                        <p className="text-surface-500 text-xs uppercase tracking-wider mb-1">Date</p>
                        <p className="text-white font-medium">{formatDate(result.certificate.issueDate)}</p>
                      </div>
                      <div>
                        <p className="text-surface-500 text-xs uppercase tracking-wider mb-1">Certificate #</p>
                        <p className="text-white font-medium">{result.certificate.certificateNumber.split("-").pop()}</p>
                      </div>
                      <div>
                        <p className="text-surface-500 text-xs uppercase tracking-wider mb-1">Network</p>
                        <p className="text-white font-medium">{result.certificate.network}</p>
                      </div>
                      <div>
                        <p className="text-surface-500 text-xs uppercase tracking-wider mb-1">CEO</p>
                        <p className="text-white font-serif italic text-lg" style={{ fontFamily: "Georgia, serif" }}>James Mitchell</p>
                      </div>

                      {/* Seal */}
                      <div className="w-14 h-14 border-2 border-[#3b5998] rounded-full flex items-center justify-center relative">
                        <div className="absolute w-12 h-12 border border-[#3b5998] rounded-full" />
                        <div className="w-9 h-9 border border-[#3b5998] rounded-full flex items-center justify-center bg-gradient-to-br from-[#1a2035] to-[#0d1225]">
                          <Award className="w-4 h-4 text-[#3b5998]" />
                        </div>
                      </div>
                    </div>

                    {/* Destination Address */}
                    <div className="mt-6 p-3 bg-[#0a0e1a]/50 rounded-lg border border-surface-800">
                      <p className="text-surface-500 text-xs uppercase tracking-wider mb-1">Destination Address</p>
                      <p className="text-white font-mono text-sm break-all">{result.certificate.toAddress}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Link
                  href="/"
                  className="flex-1 text-center px-6 py-3 bg-surface-800 hover:bg-surface-700 text-white rounded-xl font-medium transition-colors"
                >
                  Return to BLACKROCK
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1a2035] py-6 text-center bg-[#0d1225]/50">
        <p className="text-surface-500 text-sm">
          &copy; {new Date().getFullYear()} BLACKROCK Investment Platform. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
