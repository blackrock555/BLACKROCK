"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import {
  Settings,
  DollarSign,
  Users,
  Wallet,
  Shield,
  ToggleLeft,
  Clock,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  CreditCard,
  Copy,
  Check,
} from "lucide-react";

interface ProfitTier {
  tier: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  dailyRate: number;
}

interface ReferralTier {
  minReferrals: number;
  maxReferrals: number;
  rewardAmount: number;
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

interface TransactionLimits {
  minDeposit: number;
  maxDeposit: number;
  minWithdrawal: number;
  maxWithdrawal: number;
  dailyWithdrawalLimit: number;
}

interface OtpSettings {
  cooldownSeconds: number;
  expiryMinutes: number;
  maxAttempts: number;
  lockoutMinutes: number;
}

interface PlatformToggles {
  depositsEnabled: boolean;
  withdrawalsEnabled: boolean;
  profitSharingEnabled: boolean;
  newRegistrationsEnabled: boolean;
  kycRequiredForWithdrawal: boolean;
}

interface SystemSettings {
  profitTiers: ProfitTier[];
  referralTiers: ReferralTier[];
  networkFees: NetworkFees;
  networkDepositAddresses: NetworkDepositAddresses;
  transactionLimits: TransactionLimits;
  otpSettings: OtpSettings;
  platformToggles: PlatformToggles;
  depositWalletAddress: string;
  version: number;
  updatedAt: string;
}

const TABS = [
  { id: "profit-tiers", label: "Profit Tiers", icon: DollarSign },
  { id: "referral-tiers", label: "Referral Rewards", icon: Users },
  { id: "network-fees", label: "Network Fees", icon: Wallet },
  { id: "deposit-addresses", label: "Deposit Addresses", icon: CreditCard },
  { id: "transaction-limits", label: "Transaction Limits", icon: Shield },
  { id: "otp-settings", label: "Security", icon: Clock },
  { id: "platform-toggles", label: "Platform Toggles", icon: ToggleLeft },
  { id: "wallet", label: "Wallet", icon: Settings },
];

export default function AdminSettingsPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "profit-tiers");

  // Update active tab when URL changes
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Local state for editing
  const [profitTiers, setProfitTiers] = useState<ProfitTier[]>([]);
  const [referralTiers, setReferralTiers] = useState<ReferralTier[]>([]);
  const [networkFees, setNetworkFees] = useState<NetworkFees>({ ERC20: 5, TRC20: 1, BEP20: 0.5 });
  const [networkDepositAddresses, setNetworkDepositAddresses] = useState<NetworkDepositAddresses>({
    ERC20: '0xD31ac3Ae422953F60d090d99a401C8a6b53b7A82',
    TRC20: 'TJ8NdhBMJ7X9dJZ28oTveT9gn5e9woxvSx',
    BEP20: '0xD31ac3Ae422953F60d090d99a401C8a6b53b7A82',
  });
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [transactionLimits, setTransactionLimits] = useState<TransactionLimits>({
    minDeposit: 50,
    maxDeposit: 100000,
    minWithdrawal: 50,
    maxWithdrawal: 50000,
    dailyWithdrawalLimit: 10000,
  });
  const [otpSettings, setOtpSettings] = useState<OtpSettings>({
    cooldownSeconds: 60,
    expiryMinutes: 10,
    maxAttempts: 5,
    lockoutMinutes: 30,
  });
  const [platformToggles, setPlatformToggles] = useState<PlatformToggles>({
    depositsEnabled: true,
    withdrawalsEnabled: true,
    profitSharingEnabled: true,
    newRegistrationsEnabled: true,
    kycRequiredForWithdrawal: true,
  });
  const [depositWalletAddress, setDepositWalletAddress] = useState("");

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/admin/settings");
      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }

      const data = await response.json();
      const fetchedSettings = data.settings as SystemSettings;
      setSettings(fetchedSettings);

      // Populate local state
      setProfitTiers(fetchedSettings.profitTiers);
      setReferralTiers(fetchedSettings.referralTiers);
      setNetworkFees(fetchedSettings.networkFees);
      setNetworkDepositAddresses(fetchedSettings.networkDepositAddresses || {
        ERC20: '0xD31ac3Ae422953F60d090d99a401C8a6b53b7A82',
        TRC20: 'TJ8NdhBMJ7X9dJZ28oTveT9gn5e9woxvSx',
        BEP20: '0xD31ac3Ae422953F60d090d99a401C8a6b53b7A82',
      });
      setTransactionLimits(fetchedSettings.transactionLimits);
      setOtpSettings(fetchedSettings.otpSettings);
      setPlatformToggles(fetchedSettings.platformToggles);
      setDepositWalletAddress(fetchedSettings.depositWalletAddress);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetchSettings();
    }
  }, [session, fetchSettings]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccess(null);

      let data: Record<string, unknown> = {};
      switch (activeTab) {
        case "profit-tiers":
          data = { profitTiers };
          break;
        case "referral-tiers":
          data = { referralTiers };
          break;
        case "network-fees":
          data = { networkFees };
          break;
        case "deposit-addresses":
          data = { networkDepositAddresses };
          break;
        case "transaction-limits":
          data = { transactionLimits };
          break;
        case "otp-settings":
          data = { otpSettings };
          break;
        case "platform-toggles":
          data = { platformToggles };
          break;
        case "wallet":
          data = { depositWalletAddress };
          break;
      }

      const response = await fetch(`/api/admin/settings/${activeTab}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save settings");
      }

      setSettings(result.settings);
      setSuccess("Settings saved successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  // Profit Tiers handlers
  const addProfitTier = () => {
    const newTier: ProfitTier = {
      tier: `TIER_${profitTiers.length + 1}`,
      name: `Tier ${profitTiers.length + 1}`,
      minAmount: profitTiers.length > 0 ? profitTiers[profitTiers.length - 1].maxAmount + 0.01 : 0,
      maxAmount: 999999999,
      dailyRate: 5,
    };
    setProfitTiers([...profitTiers, newTier]);
  };

  const removeProfitTier = (index: number) => {
    if (profitTiers.length > 1) {
      setProfitTiers(profitTiers.filter((_, i) => i !== index));
    }
  };

  const updateProfitTier = (index: number, field: keyof ProfitTier, value: string | number) => {
    const updated = [...profitTiers];
    updated[index] = { ...updated[index], [field]: value };
    setProfitTiers(updated);
  };

  // Referral Tiers handlers
  const addReferralTier = () => {
    const newTier: ReferralTier = {
      minReferrals: referralTiers.length > 0 ? referralTiers[referralTiers.length - 1].maxReferrals + 1 : 0,
      maxReferrals: 999999999,
      rewardAmount: 5,
    };
    setReferralTiers([...referralTiers, newTier]);
  };

  const removeReferralTier = (index: number) => {
    if (referralTiers.length > 1) {
      setReferralTiers(referralTiers.filter((_, i) => i !== index));
    }
  };

  const updateReferralTier = (index: number, field: keyof ReferralTier, value: number) => {
    const updated = [...referralTiers];
    updated[index] = { ...updated[index], [field]: value };
    setReferralTiers(updated);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "profit-tiers":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-white">Daily Profit Tiers</h3>
                <p className="text-surface-400 text-sm">Configure profit rates based on user deposit balance</p>
              </div>
              <button
                onClick={addProfitTier}
                className="flex items-center gap-2 px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Tier
              </button>
            </div>

            <div className="space-y-4">
              {profitTiers.map((tier, index) => (
                <div key={index} className="bg-surface-800 border border-surface-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white font-medium">Tier {index + 1}</span>
                    {profitTiers.length > 1 && (
                      <button
                        onClick={() => removeProfitTier(index)}
                        className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm text-surface-400 mb-1">Tier ID</label>
                      <input
                        type="text"
                        value={tier.tier}
                        onChange={(e) => updateProfitTier(index, "tier", e.target.value)}
                        className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-surface-400 mb-1">Name</label>
                      <input
                        type="text"
                        value={tier.name}
                        onChange={(e) => updateProfitTier(index, "name", e.target.value)}
                        className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-surface-400 mb-1">Min Amount ($)</label>
                      <input
                        type="number"
                        value={tier.minAmount}
                        onChange={(e) => updateProfitTier(index, "minAmount", parseFloat(e.target.value) || 0)}
                        className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-surface-400 mb-1">Max Amount ($)</label>
                      <input
                        type="number"
                        value={tier.maxAmount}
                        onChange={(e) => updateProfitTier(index, "maxAmount", parseFloat(e.target.value) || 0)}
                        className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-surface-400 mb-1">Daily Rate (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={tier.dailyRate}
                        onChange={(e) => updateProfitTier(index, "dailyRate", parseFloat(e.target.value) || 0)}
                        className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "referral-tiers":
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-white">Referral Reward Tiers</h3>
                <p className="text-surface-400 text-sm">Configure rewards based on referral count</p>
              </div>
              <button
                onClick={addReferralTier}
                className="flex items-center gap-2 px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Tier
              </button>
            </div>

            <div className="space-y-4">
              {referralTiers.map((tier, index) => (
                <div key={index} className="bg-surface-800 border border-surface-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white font-medium">Tier {index + 1}</span>
                    {referralTiers.length > 1 && (
                      <button
                        onClick={() => removeReferralTier(index)}
                        className="p-1.5 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-surface-400 mb-1">Min Referrals</label>
                      <input
                        type="number"
                        value={tier.minReferrals}
                        onChange={(e) => updateReferralTier(index, "minReferrals", parseInt(e.target.value) || 0)}
                        className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-surface-400 mb-1">Max Referrals</label>
                      <input
                        type="number"
                        value={tier.maxReferrals}
                        onChange={(e) => updateReferralTier(index, "maxReferrals", parseInt(e.target.value) || 0)}
                        className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-surface-400 mb-1">Reward Amount ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={tier.rewardAmount}
                        onChange={(e) => updateReferralTier(index, "rewardAmount", parseFloat(e.target.value) || 0)}
                        className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "network-fees":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Network Withdrawal Fees</h3>
              <p className="text-surface-400 text-sm">Configure fees for each blockchain network</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-surface-800 border border-surface-700 rounded-lg p-4">
                <label className="block text-sm text-surface-400 mb-1">ERC20 (Ethereum)</label>
                <div className="flex items-center gap-2">
                  <span className="text-surface-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={networkFees.ERC20}
                    onChange={(e) => setNetworkFees({ ...networkFees, ERC20: parseFloat(e.target.value) || 0 })}
                    className="flex-1 bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div className="bg-surface-800 border border-surface-700 rounded-lg p-4">
                <label className="block text-sm text-surface-400 mb-1">TRC20 (Tron)</label>
                <div className="flex items-center gap-2">
                  <span className="text-surface-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={networkFees.TRC20}
                    onChange={(e) => setNetworkFees({ ...networkFees, TRC20: parseFloat(e.target.value) || 0 })}
                    className="flex-1 bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
              <div className="bg-surface-800 border border-surface-700 rounded-lg p-4">
                <label className="block text-sm text-surface-400 mb-1">BEP20 (BSC)</label>
                <div className="flex items-center gap-2">
                  <span className="text-surface-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={networkFees.BEP20}
                    onChange={(e) => setNetworkFees({ ...networkFees, BEP20: parseFloat(e.target.value) || 0 })}
                    className="flex-1 bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-white"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case "transaction-limits":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Transaction Limits</h3>
              <p className="text-surface-400 text-sm">Configure minimum and maximum transaction amounts</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-surface-800 border border-surface-700 rounded-lg p-4">
                <h4 className="text-white font-medium mb-4">Deposits</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-surface-400 mb-1">Minimum Deposit ($)</label>
                    <input
                      type="number"
                      value={transactionLimits.minDeposit}
                      onChange={(e) => setTransactionLimits({ ...transactionLimits, minDeposit: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-surface-400 mb-1">Maximum Deposit ($)</label>
                    <input
                      type="number"
                      value={transactionLimits.maxDeposit}
                      onChange={(e) => setTransactionLimits({ ...transactionLimits, maxDeposit: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>
              </div>
              <div className="bg-surface-800 border border-surface-700 rounded-lg p-4">
                <h4 className="text-white font-medium mb-4">Withdrawals</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-surface-400 mb-1">Minimum Withdrawal ($)</label>
                    <input
                      type="number"
                      value={transactionLimits.minWithdrawal}
                      onChange={(e) => setTransactionLimits({ ...transactionLimits, minWithdrawal: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-surface-400 mb-1">Maximum Withdrawal ($)</label>
                    <input
                      type="number"
                      value={transactionLimits.maxWithdrawal}
                      onChange={(e) => setTransactionLimits({ ...transactionLimits, maxWithdrawal: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-surface-400 mb-1">Daily Withdrawal Limit ($)</label>
                    <input
                      type="number"
                      value={transactionLimits.dailyWithdrawalLimit}
                      onChange={(e) => setTransactionLimits({ ...transactionLimits, dailyWithdrawalLimit: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "otp-settings":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white">OTP & Security Settings</h3>
              <p className="text-surface-400 text-sm">Configure email verification and security parameters</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-surface-800 border border-surface-700 rounded-lg p-4">
                <label className="block text-sm text-surface-400 mb-1">Cooldown Between OTPs (seconds)</label>
                <input
                  type="number"
                  value={otpSettings.cooldownSeconds}
                  onChange={(e) => setOtpSettings({ ...otpSettings, cooldownSeconds: parseInt(e.target.value) || 0 })}
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div className="bg-surface-800 border border-surface-700 rounded-lg p-4">
                <label className="block text-sm text-surface-400 mb-1">OTP Expiry (minutes)</label>
                <input
                  type="number"
                  value={otpSettings.expiryMinutes}
                  onChange={(e) => setOtpSettings({ ...otpSettings, expiryMinutes: parseInt(e.target.value) || 0 })}
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div className="bg-surface-800 border border-surface-700 rounded-lg p-4">
                <label className="block text-sm text-surface-400 mb-1">Max OTP Attempts</label>
                <input
                  type="number"
                  value={otpSettings.maxAttempts}
                  onChange={(e) => setOtpSettings({ ...otpSettings, maxAttempts: parseInt(e.target.value) || 0 })}
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
              <div className="bg-surface-800 border border-surface-700 rounded-lg p-4">
                <label className="block text-sm text-surface-400 mb-1">Lockout Duration (minutes)</label>
                <input
                  type="number"
                  value={otpSettings.lockoutMinutes}
                  onChange={(e) => setOtpSettings({ ...otpSettings, lockoutMinutes: parseInt(e.target.value) || 0 })}
                  className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-white"
                />
              </div>
            </div>
          </div>
        );

      case "platform-toggles":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Platform Feature Toggles</h3>
              <p className="text-surface-400 text-sm">Enable or disable platform features</p>
            </div>

            <div className="space-y-4">
              {[
                { key: "depositsEnabled", label: "Deposits Enabled", description: "Allow users to submit deposit requests" },
                { key: "withdrawalsEnabled", label: "Withdrawals Enabled", description: "Allow users to submit withdrawal requests" },
                { key: "profitSharingEnabled", label: "Profit Sharing Enabled", description: "Enable daily profit distribution" },
                { key: "newRegistrationsEnabled", label: "New Registrations Enabled", description: "Allow new user sign-ups" },
                { key: "kycRequiredForWithdrawal", label: "KYC Required for Withdrawal", description: "Require KYC verification before withdrawals" },
              ].map((toggle) => (
                <div key={toggle.key} className="bg-surface-800 border border-surface-700 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">{toggle.label}</h4>
                    <p className="text-surface-400 text-sm">{toggle.description}</p>
                  </div>
                  <button
                    onClick={() => setPlatformToggles({
                      ...platformToggles,
                      [toggle.key]: !platformToggles[toggle.key as keyof PlatformToggles],
                    })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      platformToggles[toggle.key as keyof PlatformToggles] ? "bg-brand-600" : "bg-surface-700"
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        platformToggles[toggle.key as keyof PlatformToggles] ? "translate-x-7" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case "wallet":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Deposit Wallet Address</h3>
              <p className="text-surface-400 text-sm">The wallet address where users send their deposits</p>
            </div>

            <div className="bg-surface-800 border border-surface-700 rounded-lg p-4">
              <label className="block text-sm text-surface-400 mb-1">Wallet Address</label>
              <input
                type="text"
                value={depositWalletAddress}
                onChange={(e) => setDepositWalletAddress(e.target.value)}
                placeholder="0x..."
                className="w-full bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-white font-mono"
              />
              <p className="text-surface-500 text-xs mt-2">
                This address will be displayed to users on the deposit page
              </p>
            </div>
          </div>
        );

      case "deposit-addresses":
        const copyToClipboard = async (text: string, network: string) => {
          await navigator.clipboard.writeText(text);
          setCopiedAddress(network);
          setTimeout(() => setCopiedAddress(null), 2000);
        };

        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Network Deposit Addresses</h3>
              <p className="text-surface-400 text-sm">Configure deposit addresses for each blockchain network</p>
            </div>

            <div className="space-y-4">
              {/* ERC20 Address */}
              <div className="bg-surface-800 border border-surface-700 rounded-lg p-4">
                <label className="block text-sm text-surface-400 mb-1">ERC20 (Ethereum) Address</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={networkDepositAddresses.ERC20}
                    onChange={(e) => setNetworkDepositAddresses({ ...networkDepositAddresses, ERC20: e.target.value })}
                    placeholder="0x..."
                    className="flex-1 bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-white font-mono text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(networkDepositAddresses.ERC20, 'ERC20')}
                    className="p-2 bg-surface-700 hover:bg-surface-600 rounded-lg transition-colors"
                    title="Copy address"
                  >
                    {copiedAddress === 'ERC20' ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-surface-400" />
                    )}
                  </button>
                </div>
                <p className="text-surface-500 text-xs mt-2">
                  Must start with 0x (Ethereum-compatible address)
                </p>
              </div>

              {/* TRC20 Address */}
              <div className="bg-surface-800 border border-surface-700 rounded-lg p-4">
                <label className="block text-sm text-surface-400 mb-1">TRC20 (Tron) Address</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={networkDepositAddresses.TRC20}
                    onChange={(e) => setNetworkDepositAddresses({ ...networkDepositAddresses, TRC20: e.target.value })}
                    placeholder="T..."
                    className="flex-1 bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-white font-mono text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(networkDepositAddresses.TRC20, 'TRC20')}
                    className="p-2 bg-surface-700 hover:bg-surface-600 rounded-lg transition-colors"
                    title="Copy address"
                  >
                    {copiedAddress === 'TRC20' ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-surface-400" />
                    )}
                  </button>
                </div>
                <p className="text-surface-500 text-xs mt-2">
                  Must start with T (Tron network address)
                </p>
              </div>

              {/* BEP20 Address */}
              <div className="bg-surface-800 border border-surface-700 rounded-lg p-4">
                <label className="block text-sm text-surface-400 mb-1">BEP20 (BSC) Address</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={networkDepositAddresses.BEP20}
                    onChange={(e) => setNetworkDepositAddresses({ ...networkDepositAddresses, BEP20: e.target.value })}
                    placeholder="0x..."
                    className="flex-1 bg-surface-900 border border-surface-700 rounded-lg px-3 py-2 text-white font-mono text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(networkDepositAddresses.BEP20, 'BEP20')}
                    className="p-2 bg-surface-700 hover:bg-surface-600 rounded-lg transition-colors"
                    title="Copy address"
                  >
                    {copiedAddress === 'BEP20' ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-surface-400" />
                    )}
                  </button>
                </div>
                <p className="text-surface-500 text-xs mt-2">
                  Must start with 0x (BSC-compatible address)
                </p>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <p className="text-amber-200 text-sm">
                <strong>Important:</strong> These addresses will be shown to users when they select a network for deposits.
                Make sure each address is correct for its respective network to avoid loss of funds.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Settings</h1>
          <p className="text-surface-400 mt-1">
            Configure platform parameters and features
          </p>
        </div>
        <button
          onClick={fetchSettings}
          className="flex items-center gap-2 px-3 py-2 bg-surface-800 hover:bg-surface-700 text-surface-300 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <p className="text-red-200">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          <p className="text-green-200">{success}</p>
        </div>
      )}

      {/* Settings Version Info */}
      {settings && (
        <div className="text-surface-500 text-sm">
          Settings version: {settings.version} | Last updated:{" "}
          {new Date(settings.updatedAt).toLocaleString()}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-surface-800">
        <div className="flex flex-wrap gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-brand-500 text-brand-400"
                  : "border-transparent text-surface-400 hover:text-surface-200 hover:border-surface-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl p-6">
        {renderTabContent()}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-surface-700 text-white rounded-lg transition-colors"
        >
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
