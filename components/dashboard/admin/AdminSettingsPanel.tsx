"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge, Button, Modal, Skeleton } from "@/components/ui";
import {
  ArrowLeft,
  Settings,
  Wallet,
  DollarSign,
  Shield,
  Clock,
  ToggleLeft,
  ToggleRight,
  Save,
  RefreshCw,
  Plus,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  CheckCircle,
  Users,
  Percent,
  CreditCard,
  Lock,
  Globe,
  ChevronDown,
  ChevronUp,
  Edit3,
  CalendarX,
  Eye,
} from "lucide-react";
import { WeekendBanner } from "../WeekendBanner";

// Interfaces
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
  tradingViewChartEnabled: boolean;
}

interface WeekendBannerSettings {
  enabled: boolean;
  title: string;
  message: string;
}

interface SystemSettings {
  profitTiers: ProfitTier[];
  referralTiers: ReferralTier[];
  networkFees: NetworkFees;
  networkDepositAddresses: NetworkDepositAddresses;
  transactionLimits: TransactionLimits;
  otpSettings: OtpSettings;
  platformToggles: PlatformToggles;
  weekendBanner: WeekendBannerSettings;
  depositWalletAddress: string;
}

interface AdminSettingsPanelProps {
  onBack: () => void;
}

type SettingsSection =
  | "overview"
  | "profit-tiers"
  | "referral-tiers"
  | "network-fees"
  | "deposit-addresses"
  | "transaction-limits"
  | "otp-settings"
  | "platform-toggles"
  | "weekend-banner";

export function AdminSettingsPanel({ onBack }: AdminSettingsPanelProps) {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<SettingsSection>("overview");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Editable states for each section
  const [editedProfitTiers, setEditedProfitTiers] = useState<ProfitTier[]>([]);
  const [editedReferralTiers, setEditedReferralTiers] = useState<ReferralTier[]>([]);
  const [editedNetworkFees, setEditedNetworkFees] = useState<NetworkFees>({ ERC20: 0, TRC20: 0, BEP20: 0 });
  const [editedDepositAddresses, setEditedDepositAddresses] = useState<NetworkDepositAddresses>({ ERC20: '', TRC20: '', BEP20: '' });
  const [editedTransactionLimits, setEditedTransactionLimits] = useState<TransactionLimits>({
    minDeposit: 0, maxDeposit: 0, minWithdrawal: 0, maxWithdrawal: 0, dailyWithdrawalLimit: 0
  });
  const [editedOtpSettings, setEditedOtpSettings] = useState<OtpSettings>({
    cooldownSeconds: 0, expiryMinutes: 0, maxAttempts: 0, lockoutMinutes: 0
  });
  const [editedPlatformToggles, setEditedPlatformToggles] = useState<PlatformToggles>({
    depositsEnabled: true, withdrawalsEnabled: true, profitSharingEnabled: true,
    newRegistrationsEnabled: true, kycRequiredForWithdrawal: true, tradingViewChartEnabled: true
  });
  const [editedWeekendBanner, setEditedWeekendBanner] = useState<WeekendBannerSettings>({
    enabled: false, title: 'Markets Closed for the Weekend',
    message: 'Trading markets are currently closed. Profit sharing is paused until markets reopen on Monday. Your investments remain secure.'
  });

  // Fetch all settings
  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/settings");
      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettings(data.settings);
          // Initialize editable states
          setEditedProfitTiers(data.settings.profitTiers || []);
          setEditedReferralTiers(data.settings.referralTiers || []);
          setEditedNetworkFees(data.settings.networkFees || { ERC20: 5, TRC20: 1, BEP20: 0.5 });
          setEditedDepositAddresses(data.settings.networkDepositAddresses || { ERC20: '', TRC20: '', BEP20: '' });
          setEditedTransactionLimits(data.settings.transactionLimits || {
            minDeposit: 50, maxDeposit: 100000, minWithdrawal: 50, maxWithdrawal: 50000, dailyWithdrawalLimit: 10000
          });
          setEditedOtpSettings(data.settings.otpSettings || {
            cooldownSeconds: 60, expiryMinutes: 10, maxAttempts: 5, lockoutMinutes: 30
          });
          setEditedPlatformToggles(data.settings.platformToggles || {
            depositsEnabled: true, withdrawalsEnabled: true, profitSharingEnabled: true,
            newRegistrationsEnabled: true, kycRequiredForWithdrawal: true, tradingViewChartEnabled: true
          });
          setEditedWeekendBanner(data.settings.weekendBanner || {
            enabled: false, title: 'Markets Closed for the Weekend',
            message: 'Trading markets are currently closed. Profit sharing is paused until markets reopen on Monday. Your investments remain secure.'
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Save settings for a specific section
  const saveSettings = async (section: string, data: Record<string, unknown>) => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(null);

    try {
      const response = await fetch(`/api/admin/settings/${section}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save settings");
      }

      setSaveSuccess("Settings saved successfully!");
      fetchSettings(); // Refresh settings
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string, network: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedAddress(network);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  // Profit Tier handlers
  const addProfitTier = () => {
    const newTier: ProfitTier = {
      tier: `TIER_${editedProfitTiers.length + 1}`,
      name: `Tier ${editedProfitTiers.length + 1}`,
      minAmount: editedProfitTiers.length > 0 ? editedProfitTiers[editedProfitTiers.length - 1].maxAmount + 1 : 0,
      maxAmount: 999999,
      dailyRate: 5,
    };
    setEditedProfitTiers([...editedProfitTiers, newTier]);
  };

  const removeProfitTier = (index: number) => {
    if (editedProfitTiers.length > 1) {
      setEditedProfitTiers(editedProfitTiers.filter((_, i) => i !== index));
    }
  };

  const updateProfitTier = (index: number, field: keyof ProfitTier, value: string | number) => {
    const updated = [...editedProfitTiers];
    updated[index] = { ...updated[index], [field]: value };
    setEditedProfitTiers(updated);
  };

  // Referral Tier handlers
  const addReferralTier = () => {
    const newTier: ReferralTier = {
      minReferrals: editedReferralTiers.length > 0 ? editedReferralTiers[editedReferralTiers.length - 1].maxReferrals + 1 : 0,
      maxReferrals: 999999,
      rewardAmount: 5,
    };
    setEditedReferralTiers([...editedReferralTiers, newTier]);
  };

  const removeReferralTier = (index: number) => {
    if (editedReferralTiers.length > 1) {
      setEditedReferralTiers(editedReferralTiers.filter((_, i) => i !== index));
    }
  };

  const updateReferralTier = (index: number, field: keyof ReferralTier, value: number) => {
    const updated = [...editedReferralTiers];
    updated[index] = { ...updated[index], [field]: value };
    setEditedReferralTiers(updated);
  };

  // Section cards for overview
  const settingsSections = [
    {
      id: "profit-tiers" as SettingsSection,
      title: "Profit Tiers",
      description: "Configure daily profit rates based on deposit balance",
      icon: Percent,
      color: "emerald",
      count: settings?.profitTiers?.length || 0,
    },
    {
      id: "referral-tiers" as SettingsSection,
      title: "Referral Tiers",
      description: "Set referral bonus amounts based on referral count",
      icon: Users,
      color: "purple",
      count: settings?.referralTiers?.length || 0,
    },
    {
      id: "network-fees" as SettingsSection,
      title: "Network Fees",
      description: "Withdrawal fees for each blockchain network",
      icon: CreditCard,
      color: "blue",
      count: 3,
    },
    {
      id: "deposit-addresses" as SettingsSection,
      title: "Deposit Addresses",
      description: "Wallet addresses shown to users for deposits",
      icon: Wallet,
      color: "amber",
      count: 3,
    },
    {
      id: "transaction-limits" as SettingsSection,
      title: "Transaction Limits",
      description: "Min/max amounts for deposits and withdrawals",
      icon: DollarSign,
      color: "green",
      count: 5,
    },
    {
      id: "otp-settings" as SettingsSection,
      title: "OTP Settings",
      description: "Security settings for one-time passwords",
      icon: Lock,
      color: "red",
      count: 4,
    },
    {
      id: "platform-toggles" as SettingsSection,
      title: "Platform Controls",
      description: "Enable/disable platform features",
      icon: Globe,
      color: "indigo",
      count: 6,
    },
    {
      id: "weekend-banner" as SettingsSection,
      title: "Weekend Banner",
      description: "Display market closed notice to all users",
      icon: CalendarX,
      color: "amber",
      count: 3,
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      emerald: { bg: "bg-emerald-500/10 dark:bg-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/30" },
      purple: { bg: "bg-purple-500/10 dark:bg-purple-500/20", text: "text-purple-600 dark:text-purple-400", border: "border-purple-500/30" },
      blue: { bg: "bg-blue-500/10 dark:bg-blue-500/20", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500/30" },
      amber: { bg: "bg-amber-500/10 dark:bg-amber-500/20", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/30" },
      green: { bg: "bg-green-500/10 dark:bg-green-500/20", text: "text-green-600 dark:text-green-400", border: "border-green-500/30" },
      red: { bg: "bg-red-500/10 dark:bg-red-500/20", text: "text-red-600 dark:text-red-400", border: "border-red-500/30" },
      indigo: { bg: "bg-indigo-500/10 dark:bg-indigo-500/20", text: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-500/30" },
    };
    return colors[color] || colors.blue;
  };

  // Render Overview
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} icon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-500/10 dark:bg-brand-500/20">
              <Settings className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
                Platform Settings
              </h3>
              <p className="text-surface-500 text-sm">Configure all platform parameters</p>
            </div>
          </div>
        </div>
        <Button onClick={fetchSettings} variant="secondary" size="sm" icon={<RefreshCw className="w-4 h-4" />}>
          Refresh
        </Button>
      </div>

      {/* Settings Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {settingsSections.map((section) => {
            const colors = getColorClasses(section.color);
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className="text-left group"
              >
                <div className={`bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl p-5 hover:border-brand-500/50 transition-all hover:shadow-lg`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2.5 rounded-lg ${colors.bg}`}>
                      <Icon className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <Badge variant="default" className="text-xs">
                      {section.count} items
                    </Badge>
                  </div>
                  <h4 className="text-surface-900 dark:text-white font-semibold mb-1">
                    {section.title}
                  </h4>
                  <p className="text-surface-500 text-sm">
                    {section.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Quick Status */}
      {settings && (
        <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl p-5">
          <h4 className="text-surface-900 dark:text-white font-semibold mb-4">Platform Status</h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Deposits", enabled: settings.platformToggles.depositsEnabled },
              { label: "Withdrawals", enabled: settings.platformToggles.withdrawalsEnabled },
              { label: "Profit Sharing", enabled: settings.platformToggles.profitSharingEnabled },
              { label: "Registrations", enabled: settings.platformToggles.newRegistrationsEnabled },
              { label: "KYC Required", enabled: settings.platformToggles.kycRequiredForWithdrawal },
              { label: "TradingView Chart", enabled: settings.platformToggles.tradingViewChartEnabled },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${item.enabled ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-surface-600 dark:text-surface-400 text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Render Profit Tiers Section
  const renderProfitTiers = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setActiveSection("overview")} icon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white">Profit Tiers</h3>
        </div>
        <div className="flex gap-2">
          <Button onClick={addProfitTier} variant="secondary" size="sm" icon={<Plus className="w-4 h-4" />}>
            Add Tier
          </Button>
          <Button
            onClick={() => saveSettings("profit-tiers", { profitTiers: editedProfitTiers })}
            variant="primary"
            size="sm"
            icon={<Save className="w-4 h-4" />}
            isLoading={isSaving}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {renderAlerts()}

      <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl p-4">
        <p className="text-surface-500 text-sm mb-4">
          Configure daily profit rates based on user's deposit balance. Users will receive the specified percentage as daily profit.
        </p>
        <div className="space-y-3">
          {editedProfitTiers.map((tier, index) => (
            <div key={index} className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-surface-900 dark:text-white font-medium">Tier {index + 1}</span>
                {editedProfitTiers.length > 1 && (
                  <button
                    onClick={() => removeProfitTier(index)}
                    className="p-1.5 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <label className="block text-xs text-surface-500 mb-1">Tier ID</label>
                  <input
                    type="text"
                    value={tier.tier}
                    onChange={(e) => updateProfitTier(index, "tier", e.target.value)}
                    className="w-full bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-sm text-surface-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-surface-500 mb-1">Name</label>
                  <input
                    type="text"
                    value={tier.name}
                    onChange={(e) => updateProfitTier(index, "name", e.target.value)}
                    className="w-full bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-sm text-surface-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-surface-500 mb-1">Min Amount ($)</label>
                  <input
                    type="number"
                    value={tier.minAmount}
                    onChange={(e) => updateProfitTier(index, "minAmount", parseFloat(e.target.value) || 0)}
                    className="w-full bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-sm text-surface-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-surface-500 mb-1">Max Amount ($)</label>
                  <input
                    type="number"
                    value={tier.maxAmount}
                    onChange={(e) => updateProfitTier(index, "maxAmount", parseFloat(e.target.value) || 0)}
                    className="w-full bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-sm text-surface-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-surface-500 mb-1">Daily Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={tier.dailyRate}
                    onChange={(e) => updateProfitTier(index, "dailyRate", parseFloat(e.target.value) || 0)}
                    className="w-full bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-sm text-surface-900 dark:text-white font-semibold text-brand-600 dark:text-brand-400 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render Referral Tiers Section
  const renderReferralTiers = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setActiveSection("overview")} icon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white">Referral Tiers</h3>
        </div>
        <div className="flex gap-2">
          <Button onClick={addReferralTier} variant="secondary" size="sm" icon={<Plus className="w-4 h-4" />}>
            Add Tier
          </Button>
          <Button
            onClick={() => saveSettings("referral-tiers", { referralTiers: editedReferralTiers })}
            variant="primary"
            size="sm"
            icon={<Save className="w-4 h-4" />}
            isLoading={isSaving}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {renderAlerts()}

      <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl p-4">
        <p className="text-surface-500 text-sm mb-4">
          Configure referral bonus amounts based on the total number of referrals a user has.
        </p>
        <div className="space-y-3">
          {editedReferralTiers.map((tier, index) => (
            <div key={index} className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-surface-900 dark:text-white font-medium">Tier {index + 1}</span>
                {editedReferralTiers.length > 1 && (
                  <button
                    onClick={() => removeReferralTier(index)}
                    className="p-1.5 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-surface-500 mb-1">Min Referrals</label>
                  <input
                    type="number"
                    value={tier.minReferrals}
                    onChange={(e) => updateReferralTier(index, "minReferrals", parseInt(e.target.value) || 0)}
                    className="w-full bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-sm text-surface-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-surface-500 mb-1">Max Referrals</label>
                  <input
                    type="number"
                    value={tier.maxReferrals}
                    onChange={(e) => updateReferralTier(index, "maxReferrals", parseInt(e.target.value) || 0)}
                    className="w-full bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-sm text-surface-900 dark:text-white focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-surface-500 mb-1">Reward Amount ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={tier.rewardAmount}
                    onChange={(e) => updateReferralTier(index, "rewardAmount", parseFloat(e.target.value) || 0)}
                    className="w-full bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-sm text-surface-900 dark:text-white font-semibold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render Network Fees Section
  const renderNetworkFees = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setActiveSection("overview")} icon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white">Network Fees</h3>
        </div>
        <Button
          onClick={() => saveSettings("network-fees", { networkFees: editedNetworkFees })}
          variant="primary"
          size="sm"
          icon={<Save className="w-4 h-4" />}
          isLoading={isSaving}
        >
          Save Changes
        </Button>
      </div>

      {renderAlerts()}

      <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl p-4">
        <p className="text-surface-500 text-sm mb-4">
          Set withdrawal fees for each blockchain network. These fees are deducted from the withdrawal amount.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-surface-700 dark:text-surface-300 font-medium">ERC20 (Ethereum)</label>
              <span className="text-xs bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">ETH</span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500">$</span>
              <input
                type="number"
                step="0.1"
                value={editedNetworkFees.ERC20}
                onChange={(e) => setEditedNetworkFees({ ...editedNetworkFees, ERC20: parseFloat(e.target.value) || 0 })}
                className="w-full pl-7 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-surface-900 dark:text-white font-semibold focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
          <div className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-surface-700 dark:text-surface-300 font-medium">TRC20 (Tron)</label>
              <span className="text-xs bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded">TRX</span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500">$</span>
              <input
                type="number"
                step="0.1"
                value={editedNetworkFees.TRC20}
                onChange={(e) => setEditedNetworkFees({ ...editedNetworkFees, TRC20: parseFloat(e.target.value) || 0 })}
                className="w-full pl-7 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-surface-900 dark:text-white font-semibold focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
          <div className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-surface-700 dark:text-surface-300 font-medium">BEP20 (BSC)</label>
              <span className="text-xs bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded">BNB</span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-500">$</span>
              <input
                type="number"
                step="0.1"
                value={editedNetworkFees.BEP20}
                onChange={(e) => setEditedNetworkFees({ ...editedNetworkFees, BEP20: parseFloat(e.target.value) || 0 })}
                className="w-full pl-7 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-surface-900 dark:text-white font-semibold focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Deposit Addresses Section
  const renderDepositAddresses = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setActiveSection("overview")} icon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white">Deposit Addresses</h3>
        </div>
        <Button
          onClick={() => {
            if (confirm("Are you sure you want to update the deposit addresses? This will affect all users.")) {
              saveSettings("deposit-addresses", { networkDepositAddresses: editedDepositAddresses });
            }
          }}
          variant="primary"
          size="sm"
          icon={<Save className="w-4 h-4" />}
          isLoading={isSaving}
        >
          Save Changes
        </Button>
      </div>

      {renderAlerts()}

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-amber-700 dark:text-amber-200 text-sm font-medium">System-wide Change</p>
          <p className="text-amber-600 dark:text-amber-200/70 text-sm">
            These addresses are shown to all users on the deposit page. Changes will take effect immediately.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl p-4 space-y-4">
        {/* ERC20 */}
        <div className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-surface-700 dark:text-surface-300 font-medium">ERC20 (Ethereum)</label>
            <span className="text-xs bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">ETH Network</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editedDepositAddresses.ERC20}
              onChange={(e) => setEditedDepositAddresses({ ...editedDepositAddresses, ERC20: e.target.value })}
              placeholder="0x..."
              className="flex-1 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-surface-900 dark:text-white font-mono text-sm focus:outline-none focus:border-brand-500"
            />
            <button
              onClick={() => copyToClipboard(editedDepositAddresses.ERC20, 'ERC20')}
              className="p-2 bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600 rounded-lg transition-colors"
            >
              {copiedAddress === 'ERC20' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-surface-500" />}
            </button>
          </div>
        </div>

        {/* TRC20 */}
        <div className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-surface-700 dark:text-surface-300 font-medium">TRC20 (Tron)</label>
            <span className="text-xs bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-0.5 rounded">TRON Network</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editedDepositAddresses.TRC20}
              onChange={(e) => setEditedDepositAddresses({ ...editedDepositAddresses, TRC20: e.target.value })}
              placeholder="T..."
              className="flex-1 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-surface-900 dark:text-white font-mono text-sm focus:outline-none focus:border-brand-500"
            />
            <button
              onClick={() => copyToClipboard(editedDepositAddresses.TRC20, 'TRC20')}
              className="p-2 bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600 rounded-lg transition-colors"
            >
              {copiedAddress === 'TRC20' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-surface-500" />}
            </button>
          </div>
        </div>

        {/* BEP20 */}
        <div className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-surface-700 dark:text-surface-300 font-medium">BEP20 (BSC)</label>
            <span className="text-xs bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded">BSC Network</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editedDepositAddresses.BEP20}
              onChange={(e) => setEditedDepositAddresses({ ...editedDepositAddresses, BEP20: e.target.value })}
              placeholder="0x..."
              className="flex-1 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-surface-900 dark:text-white font-mono text-sm focus:outline-none focus:border-brand-500"
            />
            <button
              onClick={() => copyToClipboard(editedDepositAddresses.BEP20, 'BEP20')}
              className="p-2 bg-surface-200 dark:bg-surface-700 hover:bg-surface-300 dark:hover:bg-surface-600 rounded-lg transition-colors"
            >
              {copiedAddress === 'BEP20' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-surface-500" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Transaction Limits Section
  const renderTransactionLimits = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setActiveSection("overview")} icon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white">Transaction Limits</h3>
        </div>
        <Button
          onClick={() => saveSettings("transaction-limits", { transactionLimits: editedTransactionLimits })}
          variant="primary"
          size="sm"
          icon={<Save className="w-4 h-4" />}
          isLoading={isSaving}
        >
          Save Changes
        </Button>
      </div>

      {renderAlerts()}

      <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl p-4">
        <p className="text-surface-500 text-sm mb-4">
          Set minimum and maximum amounts for deposits and withdrawals.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Deposit Limits */}
          <div className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg p-4">
            <h5 className="text-surface-900 dark:text-white font-medium mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" /> Deposit Limits
            </h5>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-surface-500 mb-1">Minimum Deposit ($)</label>
                <input
                  type="number"
                  value={editedTransactionLimits.minDeposit}
                  onChange={(e) => setEditedTransactionLimits({ ...editedTransactionLimits, minDeposit: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-surface-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs text-surface-500 mb-1">Maximum Deposit ($)</label>
                <input
                  type="number"
                  value={editedTransactionLimits.maxDeposit}
                  onChange={(e) => setEditedTransactionLimits({ ...editedTransactionLimits, maxDeposit: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-surface-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>

          {/* Withdrawal Limits */}
          <div className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg p-4">
            <h5 className="text-surface-900 dark:text-white font-medium mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-red-500" /> Withdrawal Limits
            </h5>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-surface-500 mb-1">Minimum Withdrawal ($)</label>
                <input
                  type="number"
                  value={editedTransactionLimits.minWithdrawal}
                  onChange={(e) => setEditedTransactionLimits({ ...editedTransactionLimits, minWithdrawal: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-surface-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs text-surface-500 mb-1">Maximum Withdrawal ($)</label>
                <input
                  type="number"
                  value={editedTransactionLimits.maxWithdrawal}
                  onChange={(e) => setEditedTransactionLimits({ ...editedTransactionLimits, maxWithdrawal: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-surface-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-xs text-surface-500 mb-1">Daily Withdrawal Limit ($)</label>
                <input
                  type="number"
                  value={editedTransactionLimits.dailyWithdrawalLimit}
                  onChange={(e) => setEditedTransactionLimits({ ...editedTransactionLimits, dailyWithdrawalLimit: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-surface-900 dark:text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render OTP Settings Section
  const renderOtpSettings = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setActiveSection("overview")} icon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white">OTP Settings</h3>
        </div>
        <Button
          onClick={() => saveSettings("otp-settings", { otpSettings: editedOtpSettings })}
          variant="primary"
          size="sm"
          icon={<Save className="w-4 h-4" />}
          isLoading={isSaving}
        >
          Save Changes
        </Button>
      </div>

      {renderAlerts()}

      <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl p-4">
        <p className="text-surface-500 text-sm mb-4">
          Configure security settings for one-time password verification.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg p-4">
            <label className="block text-surface-700 dark:text-surface-300 font-medium mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Cooldown Between Requests
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={editedOtpSettings.cooldownSeconds}
                onChange={(e) => setEditedOtpSettings({ ...editedOtpSettings, cooldownSeconds: parseInt(e.target.value) || 0 })}
                className="flex-1 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-surface-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
              <span className="text-surface-500 text-sm">seconds</span>
            </div>
          </div>
          <div className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg p-4">
            <label className="block text-surface-700 dark:text-surface-300 font-medium mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              OTP Expiry Time
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={editedOtpSettings.expiryMinutes}
                onChange={(e) => setEditedOtpSettings({ ...editedOtpSettings, expiryMinutes: parseInt(e.target.value) || 0 })}
                className="flex-1 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-surface-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
              <span className="text-surface-500 text-sm">minutes</span>
            </div>
          </div>
          <div className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg p-4">
            <label className="block text-surface-700 dark:text-surface-300 font-medium mb-2">
              <Shield className="w-4 h-4 inline mr-2" />
              Max Wrong Attempts
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={editedOtpSettings.maxAttempts}
                onChange={(e) => setEditedOtpSettings({ ...editedOtpSettings, maxAttempts: parseInt(e.target.value) || 0 })}
                className="flex-1 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-surface-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
              <span className="text-surface-500 text-sm">attempts</span>
            </div>
          </div>
          <div className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg p-4">
            <label className="block text-surface-700 dark:text-surface-300 font-medium mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              Lockout Duration
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={editedOtpSettings.lockoutMinutes}
                onChange={(e) => setEditedOtpSettings({ ...editedOtpSettings, lockoutMinutes: parseInt(e.target.value) || 0 })}
                className="flex-1 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg px-3 py-2 text-surface-900 dark:text-white focus:outline-none focus:border-brand-500"
              />
              <span className="text-surface-500 text-sm">minutes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Platform Toggles Section
  const renderPlatformToggles = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setActiveSection("overview")} icon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white">Platform Controls</h3>
        </div>
        <Button
          onClick={() => saveSettings("platform-toggles", { platformToggles: editedPlatformToggles })}
          variant="primary"
          size="sm"
          icon={<Save className="w-4 h-4" />}
          isLoading={isSaving}
        >
          Save Changes
        </Button>
      </div>

      {renderAlerts()}

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-amber-700 dark:text-amber-200 text-sm font-medium">Critical Settings</p>
          <p className="text-amber-600 dark:text-amber-200/70 text-sm">
            Disabling these features will immediately affect all users on the platform.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl p-4 space-y-4">
        {[
          { key: "depositsEnabled", label: "Deposits", description: "Allow users to make deposits" },
          { key: "withdrawalsEnabled", label: "Withdrawals", description: "Allow users to withdraw funds" },
          { key: "profitSharingEnabled", label: "Profit Sharing", description: "Enable daily profit distribution" },
          { key: "newRegistrationsEnabled", label: "New Registrations", description: "Allow new users to sign up" },
          { key: "kycRequiredForWithdrawal", label: "KYC Required for Withdrawal", description: "Require identity verification before withdrawing" },
          { key: "tradingViewChartEnabled", label: "TradingView Chart", description: "Display real-time XAUUSD chart on user dashboard" },
        ].map((toggle) => (
          <div
            key={toggle.key}
            className="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg"
          >
            <div>
              <p className="text-surface-900 dark:text-white font-medium">{toggle.label}</p>
              <p className="text-surface-500 text-sm">{toggle.description}</p>
            </div>
            <button
              onClick={() => setEditedPlatformToggles({
                ...editedPlatformToggles,
                [toggle.key]: !editedPlatformToggles[toggle.key as keyof PlatformToggles]
              })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                editedPlatformToggles[toggle.key as keyof PlatformToggles]
                  ? 'bg-green-500'
                  : 'bg-surface-300 dark:bg-surface-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  editedPlatformToggles[toggle.key as keyof PlatformToggles] ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  // Render Weekend Banner Section
  const renderWeekendBanner = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setActiveSection("overview")} icon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white">Weekend Banner</h3>
        </div>
        <Button
          onClick={() => saveSettings("weekend-banner", { weekendBanner: editedWeekendBanner })}
          variant="primary"
          size="sm"
          icon={<Save className="w-4 h-4" />}
          isLoading={isSaving}
        >
          Save Changes
        </Button>
      </div>

      {renderAlerts()}

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-amber-700 dark:text-amber-200 text-sm font-medium">System-wide Notification</p>
          <p className="text-amber-600 dark:text-amber-200/70 text-sm">
            When enabled, this banner will be displayed to ALL users on their dashboard.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl p-4 space-y-6">
        {/* Enable Toggle */}
        <div className="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg">
          <div>
            <p className="text-surface-900 dark:text-white font-medium">Display Weekend Banner</p>
            <p className="text-surface-500 text-sm">Show the banner on all user dashboards</p>
          </div>
          <button
            onClick={() => setEditedWeekendBanner({ ...editedWeekendBanner, enabled: !editedWeekendBanner.enabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              editedWeekendBanner.enabled
                ? 'bg-amber-500'
                : 'bg-surface-300 dark:bg-surface-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                editedWeekendBanner.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
            Banner Title
          </label>
          <input
            type="text"
            value={editedWeekendBanner.title}
            onChange={(e) => setEditedWeekendBanner({ ...editedWeekendBanner, title: e.target.value })}
            placeholder="Enter banner title..."
            className="w-full bg-white dark:bg-surface-900 border border-surface-300 dark:border-surface-600 rounded-lg px-4 py-2.5 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Message Textarea */}
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
            Banner Message
          </label>
          <textarea
            value={editedWeekendBanner.message}
            onChange={(e) => setEditedWeekendBanner({ ...editedWeekendBanner, message: e.target.value })}
            placeholder="Enter banner message..."
            rows={4}
            className="w-full bg-white dark:bg-surface-900 border border-surface-300 dark:border-surface-600 rounded-lg px-4 py-2.5 text-surface-900 dark:text-white placeholder-surface-400 focus:outline-none focus:border-brand-500 resize-none"
          />
        </div>

        {/* Live Preview */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Eye className="w-4 h-4 text-surface-500" />
            <label className="text-sm font-medium text-surface-700 dark:text-surface-300">
              Live Preview
            </label>
          </div>
          <div className="border border-surface-200 dark:border-surface-700 rounded-xl p-4 bg-surface-50 dark:bg-surface-900/50">
            <WeekendBanner title={editedWeekendBanner.title} message={editedWeekendBanner.message} />
          </div>
        </div>
      </div>
    </div>
  );

  // Render alerts helper
  const renderAlerts = () => (
    <>
      {saveError && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-600 dark:text-red-400 text-sm">{saveError}</p>
        </div>
      )}
      {saveSuccess && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
          <p className="text-green-600 dark:text-green-400 text-sm">{saveSuccess}</p>
        </div>
      )}
    </>
  );

  // Main render based on active section
  switch (activeSection) {
    case "profit-tiers":
      return renderProfitTiers();
    case "referral-tiers":
      return renderReferralTiers();
    case "network-fees":
      return renderNetworkFees();
    case "deposit-addresses":
      return renderDepositAddresses();
    case "transaction-limits":
      return renderTransactionLimits();
    case "otp-settings":
      return renderOtpSettings();
    case "platform-toggles":
      return renderPlatformToggles();
    case "weekend-banner":
      return renderWeekendBanner();
    default:
      return renderOverview();
  }
}
