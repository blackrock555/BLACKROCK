"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/branding/Logo";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. No token provided.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`, {
          redirect: 'follow'
        });

        const finalUrl = response.url;

        if (finalUrl.includes("verified=true")) {
          setStatus("success");
          setMessage("Your email has been verified successfully!");
        } else if (finalUrl.includes("error=invalid_token")) {
          setStatus("error");
          setMessage("This verification link is invalid or has expired.");
        } else if (finalUrl.includes("error=missing_token")) {
          setStatus("error");
          setMessage("Invalid verification link. No token provided.");
        } else if (finalUrl.includes("error=")) {
          setStatus("error");
          setMessage("Verification failed. Please try again.");
        } else if (response.ok) {
          setStatus("success");
          setMessage("Your email has been verified successfully!");
        } else {
          setStatus("error");
          setMessage("Verification failed. Please try again.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred. Please try again.");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <>
      {/* Logo */}
      <div className="text-center mb-8">
        <Logo size="lg" href="/" />
      </div>

      {/* Status Card */}
      <div className="bg-surface-900 border border-surface-800 rounded-2xl p-8 text-center">
        {status === "loading" && (
          <>
            <div className="w-16 h-16 bg-brand-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Verifying Your Email
            </h1>
            <p className="text-surface-400">
              Please wait while we verify your email address...
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Email Verified!
            </h1>
            <p className="text-surface-400 mb-6">{message}</p>
            <Link
              href="/login"
              className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Continue to Login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Verification Failed
            </h1>
            <p className="text-surface-400 mb-6">{message}</p>
            <Link
              href="/login"
              className="inline-block bg-surface-800 hover:bg-surface-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Back to Login
            </Link>
          </>
        )}
      </div>
    </>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Suspense fallback={
          <div className="text-center">
            <div className="w-16 h-16 bg-brand-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-brand-400 animate-spin" />
            </div>
            <p className="text-surface-400">Loading...</p>
          </div>
        }>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
