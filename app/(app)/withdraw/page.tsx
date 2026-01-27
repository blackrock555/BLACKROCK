"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Button, Input, Select, Alert } from "@/components/ui";
import {
  Wallet,
  ArrowUpFromLine,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Info,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

interface NetworkFees {
  ERC20: number;
  TRC20: number;
  BEP20: number;
}

interface PublicSettings {
  networkFees: NetworkFees;
  transactionLimits: {
    minDeposit: number;
    minWithdrawal: number;
  };
  platformToggles: {
    depositsEnabled: boolean;
    withdrawalsEnabled: boolean;
    newRegistrationsEnabled: boolean;
  };
}

export default function WithdrawPage() {
  const { data: session, update } = useSession();
  const [amount, setAmount] = useState<number | "">("");
  const [network, setNetwork] = useState("trc20");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState("");

  // Real-time balance state
  const [balance, setBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  // Settings state
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  const kycStatus = session?.user?.kycStatus || "NOT_SUBMITTED";
  const isKYCApproved = kycStatus === "APPROVED";

  // Fetch public settings
  const fetchSettings = useCallback(async () => {
    try {
      setIsLoadingSettings(true);
      const response = await fetch("/api/settings/public");
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    } finally {
      setIsLoadingSettings(false);
    }
  }, []);

  // Fetch real-time balance from API
  const fetchBalance = useCallback(async () => {
    try {
      setIsLoadingBalance(true);
      setBalanceError(null);
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) throw new Error('Failed to fetch balance');
      const data = await response.json();
      setBalance(data.balance || 0);
    } catch (err) {
      setBalanceError(err instanceof Error ? err.message : 'Failed to load balance');
      setBalance(0);
    } finally {
      setIsLoadingBalance(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    if (session?.user) {
      fetchBalance();
    }
  }, [session?.user, fetchBalance, fetchSettings]);

  // Computed values from settings
  const networkFees = settings?.networkFees ?? { ERC20: 5, TRC20: 1, BEP20: 0.5 };
  const minWithdrawalLimit = settings?.transactionLimits?.minWithdrawal ?? 50;
  const withdrawalsEnabled = settings?.platformToggles?.withdrawalsEnabled ?? true;

  const NETWORKS = [
    { value: "erc20", label: "ERC20 (Ethereum)", fee: networkFees.ERC20 },
    { value: "trc20", label: "TRC20 (Tron)", fee: networkFees.TRC20 },
    { value: "bep20", label: "BEP20 (BSC)", fee: networkFees.BEP20 },
  ];

  const selectedNetwork = NETWORKS.find((n) => n.value === network);
  const fee = selectedNetwork?.fee || 0;
  const minWithdrawal = minWithdrawalLimit;
  const maxWithdrawal = balance;

  const netAmount = typeof amount === "number" ? amount - fee : 0;
  const isValidAmount =
    typeof amount === "number" &&
    amount >= minWithdrawal &&
    amount <= maxWithdrawal;
  const isValidAddress = address.length >= 20;

  const handleSubmit = async () => {
    if (!isValidAmount || !isValidAddress || !isKYCApproved) return;

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/withdrawals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          network,
          address,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsComplete(true);
        // Refresh balance and session
        await Promise.all([fetchBalance(), update()]);
      } else {
        setError(data.error || "Failed to submit withdrawal request");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Withdrawals disabled
  if (!withdrawalsEnabled) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Withdrawals Temporarily Disabled
          </h2>
          <p className="text-surface-400 mb-6">
            Withdrawals are currently disabled. Please try again later or contact support for assistance.
          </p>
          <Button href="/dashboard" variant="primary">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // KYC Required Gate
  if (!isKYCApproved) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            KYC Verification Required
          </h2>
          <p className="text-surface-400 mb-6">
            {kycStatus === "PENDING"
              ? "Your KYC verification is currently under review. Please wait for approval before making withdrawals."
              : "To make withdrawals, you need to complete KYC verification first. This helps us ensure the security of your funds."}
          </p>
          {kycStatus !== "PENDING" && (
            <Button href="/settings?tab=kyc" variant="primary">
              Complete KYC Verification
            </Button>
          )}
          {kycStatus === "PENDING" && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <p className="text-blue-200 text-sm">
                <Info className="w-4 h-4 inline mr-2" />
                Your documents are being reviewed. This usually takes 1-24 hours.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Success State
  if (isComplete) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-8 text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Withdrawal Request Submitted!
          </h2>
          <p className="text-surface-400 mb-6">
            Your withdrawal request for{" "}
            <span className="text-white font-medium">
              ${typeof amount === "number" ? amount.toLocaleString() : 0} USDT
            </span>{" "}
            has been submitted. Our team will process it within 1-24 hours.
          </p>
          <div className="bg-surface-800 border border-surface-700 rounded-lg p-4 mb-6 text-left">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-surface-400">Amount:</span>
                <span className="text-white">
                  ${typeof amount === "number" ? amount.toLocaleString() : 0} USDT
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-400">Network Fee:</span>
                <span className="text-white">-${fee} USDT</span>
              </div>
              <div className="flex justify-between border-t border-surface-700 pt-2">
                <span className="text-surface-400">You&apos;ll Receive:</span>
                <span className="text-brand-400 font-medium">
                  ${netAmount.toLocaleString()} USDT
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-400">To Address:</span>
                <span className="text-white font-mono text-xs">
                  {address.slice(0, 10)}...{address.slice(-8)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button href="/transactions" variant="secondary">
              View Transactions
            </Button>
            <Button href="/dashboard" variant="primary">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Withdraw Funds</h1>
        <p className="text-surface-400 mt-1">
          Transfer funds from your account to your wallet
        </p>
      </div>

      {/* Balance Card */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-1">
          <p className="text-surface-400 text-sm">Available Balance</p>
          <button
            onClick={fetchBalance}
            disabled={isLoadingBalance}
            className="p-1.5 rounded-lg hover:bg-surface-800 text-surface-400 hover:text-white transition-colors disabled:opacity-50"
            title="Refresh balance"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingBalance ? 'animate-spin' : ''}`} />
          </button>
        </div>
        {isLoadingBalance ? (
          <div className="h-9 w-36 bg-surface-800 rounded animate-pulse mt-1" />
        ) : balanceError ? (
          <div className="flex items-center gap-2 mt-1">
            <p className="text-red-400 text-sm">{balanceError}</p>
            <button
              onClick={fetchBalance}
              className="text-brand-400 hover:text-brand-300 text-sm"
            >
              Retry
            </button>
          </div>
        ) : (
          <p className="text-3xl font-bold text-white mt-1">
            ${balance.toLocaleString()}
          </p>
        )}
      </div>

      {/* Withdrawal Form */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl p-6 space-y-6">
        {error && (
          <Alert variant="error" icon={<AlertTriangle className="w-5 h-5" />}>
            {error}
          </Alert>
        )}

        <div>
          <label className="block text-sm font-medium text-surface-300 mb-2">
            Amount (USDT)
          </label>
          <Input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value ? Number(e.target.value) : "")
            }
            icon={<Wallet className="w-5 h-5" />}
          />
          <div className="flex justify-between mt-2 text-sm">
            <span className="text-surface-500">Min: ${minWithdrawal}</span>
            <button
              onClick={() => setAmount(balance)}
              className="text-brand-400 hover:text-brand-300"
            >
              Max: ${balance.toLocaleString()}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-300 mb-2">
            Network
          </label>
          <Select
            options={NETWORKS}
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-300 mb-2">
            Wallet Address
          </label>
          <Input
            type="text"
            placeholder={
              network === "trc20" ? "T..." : network === "bep20" ? "0x..." : "0x..."
            }
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        {/* Fee Summary */}
        {isValidAmount && (
          <div className="bg-surface-800 border border-surface-700 rounded-lg p-4">
            <h4 className="font-medium text-surface-200 mb-3">Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-surface-400">Withdrawal Amount:</span>
                <span className="text-white">
                  ${typeof amount === "number" ? amount.toLocaleString() : 0} USDT
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-400">Network Fee:</span>
                <span className="text-red-400">-${fee} USDT</span>
              </div>
              <div className="flex justify-between border-t border-surface-700 pt-2">
                <span className="text-surface-400">You&apos;ll Receive:</span>
                <span className="text-brand-400 font-semibold">
                  ${netAmount.toLocaleString()} USDT
                </span>
              </div>
            </div>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          variant="primary"
          className="w-full"
          icon={<ArrowUpFromLine className="w-4 h-4" />}
          disabled={!isValidAmount || !isValidAddress}
          isLoading={isSubmitting}
        >
          Request Withdrawal
        </Button>
      </div>

      {/* Important Notice */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
        <h4 className="font-medium text-amber-200 mb-2">
          <AlertTriangle className="w-4 h-4 inline mr-2" />
          Important:
        </h4>
        <ul className="text-amber-200/80 text-sm space-y-1">
          <li>• Withdrawals require admin approval (1-24 hours)</li>
          <li>• Double-check your wallet address before submitting</li>
          <li>• Ensure you&apos;re withdrawing to the correct network</li>
          <li>• Wrong network may result in permanent loss of funds</li>
        </ul>
      </div>
    </div>
  );
}
