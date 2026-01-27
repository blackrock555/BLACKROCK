"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Stepper, Button, Input, FileUpload, CopyButton, Alert, QRCodeDisplay } from "@/components/ui";
import {
  DollarSign,
  Wallet,
  Upload,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  QrCode,
  Info,
  AlertTriangle,
  Check,
  Zap,
} from "lucide-react";
import Link from "next/link";

interface ProfitTier {
  tier: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  dailyRate: number;
}

interface NetworkFees {
  ERC20: number;
  TRC20: number;
  BEP20: number;
}

interface NetworkDepositAddresses {
  ERC20: string;
  TRC20: string;
  BEP20: string;
}

interface PublicSettings {
  profitTiers: ProfitTier[];
  networkFees: NetworkFees;
  networkDepositAddresses: NetworkDepositAddresses;
  transactionLimits: {
    minDeposit: number;
    minWithdrawal: number;
  };
  depositWalletAddress: string;
  platformToggles: {
    depositsEnabled: boolean;
    withdrawalsEnabled: boolean;
    newRegistrationsEnabled: boolean;
  };
}

const QUICK_AMOUNTS = [100, 500, 1000, 5000];

const STEPS = [
  { id: 1, title: "Amount", icon: DollarSign },
  { id: 2, title: "Address", icon: Wallet },
  { id: 3, title: "Proof", icon: Upload },
  { id: 4, title: "Confirm", icon: CheckCircle },
];

export default function DepositPage() {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [amount, setAmount] = useState<number | "">("");
  const [network, setNetwork] = useState("trc20");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [txHash, setTxHash] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Settings state
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Fetch public settings
  const fetchSettings = useCallback(async () => {
    try {
      setIsLoadingSettings(true);
      const response = await fetch("/api/settings/public");
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setIsLoadingSettings(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Computed values from settings
  const minDeposit = settings?.transactionLimits?.minDeposit ?? 50;
  const depositsEnabled = settings?.platformToggles?.depositsEnabled ?? true;
  const networkFees = settings?.networkFees ?? { ERC20: 5, TRC20: 1, BEP20: 0.5 };
  const profitTiers = settings?.profitTiers ?? [];
  const networkDepositAddresses = settings?.networkDepositAddresses ?? {
    ERC20: '0xD31ac3Ae422953F60d090d99a401C8a6b53b7A82',
    TRC20: 'TJ8NdhBMJ7X9dJZ28oTveT9gn5e9woxvSx',
    BEP20: '0xD31ac3Ae422953F60d090d99a401C8a6b53b7A82',
  };

  // Get deposit address based on selected network
  const getDepositAddress = (): string => {
    switch (network) {
      case 'erc20': return networkDepositAddresses.ERC20;
      case 'trc20': return networkDepositAddresses.TRC20;
      case 'bep20': return networkDepositAddresses.BEP20;
      default: return networkDepositAddresses.BEP20;
    }
  };

  const depositAddress = getDepositAddress();

  const NETWORKS = [
    {
      id: "erc20",
      name: "ERC20",
      network: "Ethereum",
      fee: `~$${networkFees.ERC20}`,
      color: "bg-blue-500",
      lightColor: "bg-blue-500/10",
      textColor: "text-blue-400",
      borderColor: "border-blue-500/50",
    },
    {
      id: "trc20",
      name: "TRC20",
      network: "Tron",
      fee: `~$${networkFees.TRC20}`,
      color: "bg-red-500",
      lightColor: "bg-red-500/10",
      textColor: "text-red-400",
      borderColor: "border-red-500/50",
      recommended: true,
    },
    {
      id: "bep20",
      name: "BEP20",
      network: "BSC",
      fee: `~$${networkFees.BEP20}`,
      color: "bg-yellow-500",
      lightColor: "bg-yellow-500/10",
      textColor: "text-yellow-400",
      borderColor: "border-yellow-500/50",
    },
  ];

  const isValidAmount = typeof amount === "number" && amount >= minDeposit;

  // Get profit tier for the current amount
  const getProfitTierForAmount = (amt: number): ProfitTier | undefined => {
    return profitTiers.find(t => amt >= t.minAmount && amt <= t.maxAmount);
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!proofFile || !isValidAmount) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("amount", String(amount));
      formData.append("network", network);
      formData.append("proof", proofFile);
      if (txHash) formData.append("txHash", txHash);

      const response = await fetch("/api/deposits", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setIsComplete(true);
        setCurrentStep(4);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to submit deposit request");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                Deposit Amount (USDT)
              </label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value ? Number(e.target.value) : "")
                }
                icon={<DollarSign className="w-5 h-5" />}
              />
              <p className="text-surface-500 text-sm mt-2">
                Minimum deposit: ${minDeposit}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-3">
                Quick Select
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {QUICK_AMOUNTS.map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => setAmount(quickAmount)}
                    className={`p-3 rounded-xl border-2 text-center font-semibold transition-all duration-200 ${
                      amount === quickAmount
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10"
                        : "bg-surface-800/50 border-surface-700 text-surface-300 hover:border-surface-600 hover:bg-surface-800"
                    }`}
                  >
                    ${quickAmount.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-3">
                Select Network
              </label>
              <div className="space-y-3">
                {NETWORKS.map((net) => (
                  <button
                    key={net.id}
                    onClick={() => setNetwork(net.id)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      network === net.id
                        ? `bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/10`
                        : "bg-surface-800/50 border-surface-700 hover:border-surface-600 hover:bg-surface-800"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Network Color Indicator */}
                        <div className={`w-3 h-3 rounded-full ${net.color}`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{net.name}</span>
                            <span className="text-surface-500 text-sm">({net.network})</span>
                            {net.recommended && (
                              <span className="flex items-center gap-1 text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                                <Zap className="w-3 h-3" />
                                Low Fee
                              </span>
                            )}
                          </div>
                          <span className="text-surface-400 text-sm">
                            Network Fee: {net.fee}
                          </span>
                        </div>
                      </div>
                      {/* Selection Indicator */}
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        network === net.id
                          ? "bg-emerald-500 border-emerald-500"
                          : "border-surface-600 bg-transparent"
                      }`}>
                        {network === net.id && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Profit Tier Info */}
            {isValidAmount && typeof amount === "number" && (
              <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 border border-emerald-500/30 rounded-xl p-4">
                <p className="text-surface-400 text-sm">
                  With ${amount.toLocaleString()} deposit, you&apos;ll earn:
                </p>
                <p className="text-2xl font-bold text-emerald-400 mt-1">
                  {getProfitTierForAmount(amount)?.dailyRate ?? 4}% daily
                </p>
                <p className="text-emerald-400/70 text-sm mt-1">
                  ≈ ${((amount * (getProfitTierForAmount(amount)?.dailyRate ?? 4)) / 100).toFixed(2)}/day potential earnings
                </p>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <Alert variant="info" icon={<Info className="w-5 h-5" />}>
              Send exactly{" "}
              <span className="font-bold text-surface-900 dark:text-white">
                ${typeof amount === "number" ? amount.toLocaleString() : 0} USDT
              </span>{" "}
              to the address below via{" "}
              <span className="font-bold text-surface-900 dark:text-white">
                {NETWORKS.find((n) => n.id === network)?.name}
              </span>
            </Alert>

            <div className="bg-surface-800 border border-surface-700 rounded-xl p-6">
              <div className="flex items-center justify-center mb-6">
                <QRCodeDisplay
                  data={depositAddress}
                  size={192}
                  label="Scan to get wallet address"
                  showDownload={true}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-400 mb-2">
                  Wallet Address ({NETWORKS.find((n) => n.id === network)?.name})
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-surface-900 border border-surface-700 rounded-lg p-3 font-mono text-sm text-surface-300 break-all">
                    {depositAddress}
                  </div>
                  <CopyButton value={depositAddress} />
                </div>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <h4 className="font-medium text-amber-200 mb-2">Important:</h4>
              <ul className="text-amber-200/80 text-sm space-y-1">
                <li>• Only send USDT on the selected network</li>
                <li>• Sending other tokens may result in loss</li>
                <li>• Allow 1-24 hours for manual verification</li>
                <li>• Keep your transaction hash for reference</li>
              </ul>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                Upload Payment Proof
              </label>
              <p className="text-surface-500 text-sm mb-4">
                Please upload a screenshot or PDF of your completed transaction
              </p>
              <FileUpload
                accept="image/*,.pdf"
                maxSize={5 * 1024 * 1024}
                onChange={(file) => setProofFile(file)}
                value={proofFile}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-300 mb-2">
                Transaction Hash (Optional)
              </label>
              <Input
                type="text"
                placeholder="0x..."
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
              />
              <p className="text-surface-500 text-sm mt-2">
                Providing the transaction hash helps speed up verification
              </p>
            </div>

            <div className="bg-surface-800 border border-surface-700 rounded-xl p-4">
              <h4 className="font-medium text-white mb-3">
                Deposit Summary
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-surface-400">Amount:</span>
                  <span className="text-white font-medium">
                    ${typeof amount === "number" ? amount.toLocaleString() : 0} USDT
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-400">Network:</span>
                  <span className="text-white">
                    {NETWORKS.find((n) => n.id === network)?.name} ({NETWORKS.find((n) => n.id === network)?.network})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-400">Daily Rate:</span>
                  <span className="text-emerald-400 font-medium">
                    {typeof amount === "number" ? `${getProfitTierForAmount(amount)?.dailyRate ?? 4}%` : "4%"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center py-8">
            {isComplete ? (
              <>
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Deposit Request Submitted!
                </h2>
                <p className="text-surface-400 mb-6 max-w-md mx-auto">
                  Your deposit request for{" "}
                  <span className="text-white font-medium">
                    ${typeof amount === "number" ? amount.toLocaleString() : 0} USDT
                  </span>{" "}
                  has been submitted. Our team will verify your payment within
                  1-24 hours.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button href="/transactions" variant="secondary">
                    View Transactions
                  </Button>
                  <Button href="/dashboard" variant="primary">
                    Back to Dashboard
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-white mb-4">
                  Ready to Submit?
                </h2>
                <div className="bg-surface-800 border border-surface-700 rounded-xl p-4 mb-6 max-w-md mx-auto text-left">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-surface-400">Amount:</span>
                      <span className="text-white font-medium">
                        ${typeof amount === "number" ? amount.toLocaleString() : 0} USDT
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-surface-400">Network:</span>
                      <span className="text-white">
                        {NETWORKS.find((n) => n.id === network)?.name} ({NETWORKS.find((n) => n.id === network)?.network})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-surface-400">Proof:</span>
                      <span className="text-white truncate max-w-[200px]">
                        {proofFile?.name || "Not uploaded"}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleSubmit}
                  variant="primary"
                  isLoading={isSubmitting}
                  disabled={!proofFile}
                >
                  Submit Deposit Request
                </Button>
              </>
            )}
          </div>
        );

      default:
        return null;
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

  // Deposits disabled
  if (!depositsEnabled) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-8 text-center">
          <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Deposits Temporarily Disabled
          </h2>
          <p className="text-surface-400 mb-6">
            Deposits are currently disabled. Please try again later or contact support for assistance.
          </p>
          <Button href="/dashboard" variant="primary">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Deposit Funds</h1>
        <p className="text-surface-400 mt-1">
          Add funds to your investment account
        </p>
      </div>

      {/* Stepper */}
      <Stepper
        steps={STEPS.map((s) => s.title)}
        currentStep={currentStep}
        completedSteps={
          isComplete ? [1, 2, 3, 4] : Array.from({ length: currentStep - 1 }, (_, i) => i + 1)
        }
      />

      {/* Step Content */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl p-6">
        {renderStepContent()}
      </div>

      {/* Navigation */}
      {!isComplete && currentStep < 4 && (
        <div className="flex justify-between">
          <Button
            onClick={handleBack}
            variant="ghost"
            icon={<ArrowLeft className="w-4 h-4" />}
            disabled={currentStep === 1}
          >
            Back
          </Button>
          <Button
            onClick={currentStep === 3 ? handleSubmit : handleNext}
            variant="primary"
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
            disabled={
              (currentStep === 1 && !isValidAmount) ||
              (currentStep === 3 && !proofFile)
            }
            isLoading={currentStep === 3 && isSubmitting}
          >
            {currentStep === 3 ? "Submit" : "Continue"}
          </Button>
        </div>
      )}
    </div>
  );
}
