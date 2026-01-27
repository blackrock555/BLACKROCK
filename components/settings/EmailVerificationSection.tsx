"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle, Mail, Send, AlertTriangle, Clock, Lock } from "lucide-react";
import { Button, Alert } from "@/components/ui";
import { OTPInput } from "./OTPInput";

interface EmailVerificationSectionProps {
  email: string;
  isVerified: boolean;
  onVerificationComplete?: () => void;
}

interface EmailStatus {
  emailVerified: boolean;
  cooldownRemaining: number;
  otpExpiresIn: number;
  lockoutRemaining: number;
  remainingAttempts: number;
  isLocked: boolean;
  hasActiveOtp: boolean;
}

export function EmailVerificationSection({
  email,
  isVerified: initialIsVerified,
  onVerificationComplete,
}: EmailVerificationSectionProps) {
  const [isVerified, setIsVerified] = useState(initialIsVerified);
  const [status, setStatus] = useState<EmailStatus | null>(null);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);

  // Countdown timers
  const [cooldownTimer, setCooldownTimer] = useState(0);
  const [expiryTimer, setExpiryTimer] = useState(0);
  const [lockoutTimer, setLockoutTimer] = useState(0);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch("/api/user/email/status");
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
        setIsVerified(data.emailVerified);
        setCooldownTimer(data.cooldownRemaining);
        setExpiryTimer(data.otpExpiresIn);
        setLockoutTimer(data.lockoutRemaining);
        if (data.hasActiveOtp) {
          setShowOtpInput(true);
        }
      }
    } catch (err) {
      console.error("Failed to fetch email status:", err);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Cooldown timer
  useEffect(() => {
    if (cooldownTimer > 0) {
      const interval = setInterval(() => {
        setCooldownTimer((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [cooldownTimer]);

  // Expiry timer
  useEffect(() => {
    if (expiryTimer > 0) {
      const interval = setInterval(() => {
        setExpiryTimer((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [expiryTimer]);

  // Lockout timer
  useEffect(() => {
    if (lockoutTimer > 0) {
      const interval = setInterval(() => {
        setLockoutTimer((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockoutTimer]);

  const handleSendOtp = async () => {
    setIsSending(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/user/email/send-otp", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Verification code sent to your email");
        setShowOtpInput(true);
        setOtp("");
        setCooldownTimer(60);
        setExpiryTimer(data.expiresIn || 600);
        await fetchStatus();
      } else {
        setError(data.error || "Failed to send verification code");
        if (data.cooldownRemaining) {
          setCooldownTimer(data.cooldownRemaining);
        }
        if (data.lockedUntil) {
          const lockoutMs = new Date(data.lockedUntil).getTime() - Date.now();
          setLockoutTimer(Math.ceil(lockoutMs / 1000));
        }
      }
    } catch (err) {
      setError("Failed to send verification code. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/user/email/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Email verified successfully!");
        setIsVerified(true);
        setShowOtpInput(false);
        setOtp("");
        onVerificationComplete?.();
      } else {
        setError(data.error || "Invalid verification code");
        if (data.remainingAttempts !== undefined) {
          setStatus((prev) =>
            prev ? { ...prev, remainingAttempts: data.remainingAttempts } : null
          );
        }
        if (data.lockedUntil) {
          const lockoutMs = new Date(data.lockedUntil).getTime() - Date.now();
          setLockoutTimer(Math.ceil(lockoutMs / 1000));
          setShowOtpInput(false);
        }
      }
    } catch (err) {
      setError("Failed to verify code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Already verified state
  if (isVerified) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-green-400 font-medium">Email Verified</p>
            <p className="text-surface-400 text-sm">{email}</p>
          </div>
        </div>
      </div>
    );
  }

  // Locked out state
  if (lockoutTimer > 0) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
            <Lock className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="text-red-400 font-medium">Account Temporarily Locked</p>
            <p className="text-surface-400 text-sm">Too many failed attempts</p>
          </div>
        </div>
        <div className="text-center">
          <p className="text-surface-300 mb-2">Try again in</p>
          <p className="text-2xl font-bold text-white">{formatTime(lockoutTimer)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-800/50 border border-surface-700 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center">
          <Mail className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <p className="text-white font-medium">Email Not Verified</p>
          <p className="text-surface-400 text-sm">{email}</p>
        </div>
      </div>

      {error && (
        <Alert variant="error" icon={<AlertTriangle className="w-4 h-4" />} className="mb-4">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" icon={<CheckCircle className="w-4 h-4" />} className="mb-4">
          {success}
        </Alert>
      )}

      {!showOtpInput ? (
        <div>
          <p className="text-surface-400 text-sm mb-4">
            Verify your email to unlock all features and secure your account.
          </p>
          <Button
            onClick={handleSendOtp}
            variant="primary"
            isLoading={isSending}
            disabled={cooldownTimer > 0}
            icon={<Send className="w-4 h-4" />}
          >
            {cooldownTimer > 0
              ? `Resend in ${cooldownTimer}s`
              : "Send Verification Code"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-surface-300 text-sm text-center">
            Enter the 6-digit code sent to your email
          </p>

          <OTPInput
            value={otp}
            onChange={setOtp}
            disabled={isLoading}
            autoFocus
          />

          {expiryTimer > 0 && (
            <div className="flex items-center justify-center gap-2 text-surface-400 text-sm">
              <Clock className="w-4 h-4" />
              <span>Code expires in {formatTime(expiryTimer)}</span>
            </div>
          )}

          {status?.remainingAttempts !== undefined && status.remainingAttempts < 5 && (
            <p className="text-amber-400 text-sm text-center">
              {status.remainingAttempts} attempts remaining
            </p>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleVerifyOtp}
              variant="primary"
              isLoading={isLoading}
              disabled={otp.length !== 6}
              className="flex-1"
            >
              Verify
            </Button>
            <Button
              onClick={handleSendOtp}
              variant="outline"
              disabled={cooldownTimer > 0 || isSending}
              isLoading={isSending}
            >
              {cooldownTimer > 0 ? `${cooldownTimer}s` : "Resend"}
            </Button>
          </div>

          <button
            onClick={() => {
              setShowOtpInput(false);
              setOtp("");
              setError("");
            }}
            className="text-surface-400 text-sm hover:text-surface-300 w-full text-center"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

export default EmailVerificationSection;
