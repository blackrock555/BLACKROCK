"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/branding/Logo";
import { Button, Input, Alert } from "@/components/ui";
import { Lock, CheckCircle, XCircle, Loader2, Eye, EyeOff } from "lucide-react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"form" | "success" | "error">("form");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Invalid reset link. No token provided.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
      } else {
        if (data.error === "Invalid or expired reset token") {
          setStatus("error");
          setError(data.error);
        } else {
          setError(data.error || "Failed to reset password");
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <>
        <div className="text-center mb-8">
          <Logo size="lg" href="/" />
        </div>
        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Invalid Link</h1>
          <p className="text-surface-400 mb-6">
            This password reset link is invalid. Please request a new one.
          </p>
          <Link
            href="/forgot-password"
            className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Request New Link
          </Link>
        </div>
      </>
    );
  }

  if (status === "success") {
    return (
      <>
        <div className="text-center mb-8">
          <Logo size="lg" href="/" />
        </div>
        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Password Reset!
          </h1>
          <p className="text-surface-400 mb-6">
            Your password has been reset successfully. You can now login with your new password.
          </p>
          <Link
            href="/login"
            className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Continue to Login
          </Link>
        </div>
      </>
    );
  }

  if (status === "error") {
    return (
      <>
        <div className="text-center mb-8">
          <Logo size="lg" href="/" />
        </div>
        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Link Expired
          </h1>
          <p className="text-surface-400 mb-6">
            {error || "This password reset link has expired. Please request a new one."}
          </p>
          <Link
            href="/forgot-password"
            className="inline-block bg-brand-600 hover:bg-brand-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Request New Link
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <Logo size="lg" href="/" />
      </div>

      <div className="bg-surface-900 border border-surface-800 rounded-2xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
          <p className="text-surface-400 mt-2">
            Enter your new password below
          </p>
        </div>

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">
              New Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
                minLength={8}
                icon={<Lock className="w-5 h-5" />}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-300 mb-2">
              Confirm Password
            </label>
            <Input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              minLength={8}
              icon={<Lock className="w-5 h-5" />}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isLoading}
          >
            Reset Password
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-surface-400 hover:text-white text-sm"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </>
  );
}

export default function ResetPasswordPage() {
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
          <ResetPasswordContent />
        </Suspense>
      </div>
    </div>
  );
}
