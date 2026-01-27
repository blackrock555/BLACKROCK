"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/branding/Logo";
import { Button, Input, Alert } from "@/components/ui";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        setError(data.error || "Failed to send reset email");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-surface-900 border border-surface-800 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Check Your Email
            </h1>
            <p className="text-surface-400 mb-6">
              If an account exists for <span className="text-white">{email}</span>,
              you will receive a password reset link shortly.
            </p>
            <Link
              href="/login"
              className="text-brand-400 hover:text-brand-300 font-medium"
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Logo size="lg" href="/" />
        </div>

        {/* Form Card */}
        <div className="bg-surface-900 border border-surface-800 rounded-2xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white">Forgot Password?</h1>
            <p className="text-surface-400 mt-2">
              Enter your email and we&apos;ll send you a reset link
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
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                icon={<Mail className="w-5 h-5" />}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
            >
              Send Reset Link
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-surface-400 hover:text-white text-sm inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
