"use client";

import { useSession } from "next-auth/react";
import { Badge, Button } from "@/components/ui";
import { TrendingUp, Check, Star, Zap, Shield, Clock, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";

interface ProfitTier {
  tier: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  dailyRate: number;
}

// Styling configuration for each tier index
const TIER_STYLES = [
  { color: "from-surface-600 to-surface-700", borderColor: "border-surface-600", popular: false },
  { color: "from-brand-600 to-brand-700", borderColor: "border-brand-500", popular: true },
  { color: "from-amber-600 to-amber-700", borderColor: "border-amber-500", popular: false },
  { color: "from-purple-600 to-purple-700", borderColor: "border-purple-500", popular: false },
];

// Features per tier index
const TIER_FEATURES = [
  [
    "Basic dashboard access",
    "Email support",
    "Standard withdrawals",
  ],
  [
    "Advanced analytics",
    "Priority support",
    "Faster withdrawals",
    "Referral bonuses",
  ],
  [
    "VIP dashboard",
    "24/7 dedicated support",
    "Instant withdrawals",
    "Higher referral rewards",
  ],
  [
    "Elite dashboard",
    "Personal account manager",
    "Priority instant withdrawals",
    "Maximum referral rewards",
    "Exclusive opportunities",
  ],
];

function getCurrentTier(depositBalance: number, tiers: ProfitTier[]): ProfitTier | null {
  if (!tiers.length) return null;

  // Find the highest tier the user qualifies for based on deposit balance
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (depositBalance >= tiers[i].minAmount) {
      return tiers[i];
    }
  }
  return tiers[0];
}

export default function PlansPage() {
  const { data: session } = useSession();
  const depositBalance = session?.user?.depositBalance || 0;

  const [tiers, setTiers] = useState<ProfitTier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch tiers from API on mount
  useEffect(() => {
    fetch('/api/settings/public')
      .then(res => res.json())
      .then(data => {
        if (data.settings?.profitTiers && Array.isArray(data.settings.profitTiers)) {
          setTiers(data.settings.profitTiers);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  const currentTier = useMemo(() => getCurrentTier(depositBalance, tiers), [depositBalance, tiers]);
  const currentTierIndex = useMemo(() => {
    if (!currentTier) return 0;
    return tiers.findIndex(t => t.tier === currentTier.tier);
  }, [currentTier, tiers]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!tiers.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="text-surface-500 dark:text-surface-400">Unable to load investment plans.</p>
        <Button variant="secondary" className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Investment Plans</h1>
        <p className="text-surface-600 dark:text-surface-400 mt-1">
          Choose a plan that fits your investment goals
        </p>
      </div>

      {/* Current Plan Status */}
      {depositBalance >= 50 ? (
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-surface-500 dark:text-surface-400 text-sm">Your Current Plan</p>
              <div className="flex items-center gap-3 mt-1">
                <h2 className="text-xl font-bold text-surface-900 dark:text-white">
                  {currentTier?.name} Tier
                </h2>
                <Badge variant="success">Active</Badge>
              </div>
              <p className="text-surface-500 dark:text-surface-400 text-sm mt-2">
                Deposit Balance:{" "}
                <span className="text-surface-900 dark:text-white font-medium">
                  ${depositBalance.toLocaleString()}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-surface-500 dark:text-surface-400 text-sm">Daily Rate</p>
              <p className="text-3xl font-bold text-brand-500 dark:text-brand-400">
                {currentTier?.dailyRate}%
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl p-6">
          <div className="flex flex-col items-center text-center py-4">
            <div className="w-16 h-16 bg-surface-100 dark:bg-surface-800 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-surface-400" />
            </div>
            <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-2">
              No Active Plan Yet
            </h2>
            <p className="text-surface-500 dark:text-surface-400 text-sm mb-4 max-w-md">
              Make a deposit of at least $50 USDT to activate your investment plan and start earning daily returns.
            </p>
            <Button href="/deposit" variant="primary">
              Make Your First Deposit
            </Button>
          </div>
        </div>
      )}

      {/* Plan Cards */}
      <div className={`grid grid-cols-1 gap-6 ${tiers.length === 3 ? 'md:grid-cols-3' : tiers.length === 4 ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-2 lg:grid-cols-3'}`}>
        {tiers.map((tier, index) => {
          const style = TIER_STYLES[index] || TIER_STYLES[0];
          const features = TIER_FEATURES[index] || TIER_FEATURES[0];
          const isCurrentTier = currentTier?.tier === tier.tier;
          const isUpgrade = index > currentTierIndex;

          return (
            <div
              key={tier.tier}
              className={`relative bg-white dark:bg-surface-900 border rounded-xl overflow-hidden ${
                style.popular
                  ? "border-brand-500 ring-1 ring-brand-500/20"
                  : isCurrentTier
                  ? "border-green-500"
                  : "border-surface-200 dark:border-surface-800"
              }`}
            >
              {/* Popular Badge */}
              {style.popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-brand-500 text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
                    Most Popular
                  </div>
                </div>
              )}

              {/* Current Badge */}
              {isCurrentTier && (
                <div className="absolute top-0 left-0">
                  <div className="bg-green-500 text-white text-xs font-medium px-3 py-1 rounded-br-lg">
                    Current Plan
                  </div>
                </div>
              )}

              {/* Header */}
              <div className={`bg-gradient-to-r ${style.color} p-6`}>
                <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                <p className="text-white/80 text-sm mt-1">
                  {tier.maxAmount >= 100000
                    ? `$${tier.minAmount.toLocaleString()}+`
                    : `$${tier.minAmount.toLocaleString()} - $${tier.maxAmount.toLocaleString()}`}
                </p>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-white">
                    {tier.dailyRate}%
                  </span>
                  <span className="text-white/80 text-sm ml-1">daily</span>
                </div>
              </div>

              {/* Features */}
              <div className="p-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-surface-700 dark:text-surface-300 text-sm">{tier.dailyRate}% daily returns</span>
                  </li>
                  {features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-surface-700 dark:text-surface-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  {isCurrentTier ? (
                    <Button variant="secondary" className="w-full" disabled>
                      Current Plan
                    </Button>
                  ) : isUpgrade ? (
                    <Button href="/deposit" variant="primary" className="w-full">
                      Upgrade Now
                    </Button>
                  ) : (
                    <Button variant="ghost" className="w-full" disabled>
                      Lower Tier
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Table */}
      <div className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-surface-200 dark:border-surface-800">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Plan Comparison</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 dark:border-surface-800">
                <th className="text-left text-surface-400 font-medium p-4">
                  Feature
                </th>
                {tiers.map((tier) => (
                  <th
                    key={tier.tier}
                    className="text-center text-surface-400 font-medium p-4"
                  >
                    {tier.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-surface-200 dark:border-surface-800">
                <td className="p-4 text-surface-700 dark:text-surface-300">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-brand-400" />
                    Daily Returns
                  </div>
                </td>
                {tiers.map((tier) => (
                  <td key={tier.tier} className="p-4 text-center text-surface-900 dark:text-white font-medium">
                    {tier.dailyRate}%
                  </td>
                ))}
              </tr>
              <tr className="border-b border-surface-200 dark:border-surface-800">
                <td className="p-4 text-surface-700 dark:text-surface-300">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Withdrawal Speed
                  </div>
                </td>
                {tiers.map((tier, index) => (
                  <td key={tier.tier} className={`p-4 text-center ${index >= tiers.length - 1 ? 'text-surface-900 dark:text-white font-medium' : index >= tiers.length - 2 ? 'text-surface-700 dark:text-surface-300' : 'text-surface-500 dark:text-surface-400'}`}>
                    {index === 0 ? 'Standard' : index === 1 ? 'Fast' : index === 2 ? 'Instant' : 'Priority'}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-surface-200 dark:border-surface-800">
                <td className="p-4 text-surface-700 dark:text-surface-300">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-400" />
                    Support Level
                  </div>
                </td>
                {tiers.map((tier, index) => (
                  <td key={tier.tier} className={`p-4 text-center ${index >= tiers.length - 1 ? 'text-surface-900 dark:text-white font-medium' : index >= tiers.length - 2 ? 'text-surface-700 dark:text-surface-300' : 'text-surface-500 dark:text-surface-400'}`}>
                    {index === 0 ? 'Email' : index === 1 ? 'Priority' : index === 2 ? '24/7 VIP' : 'Dedicated'}
                  </td>
                ))}
              </tr>
              <tr className="border-b border-surface-200 dark:border-surface-800">
                <td className="p-4 text-surface-700 dark:text-surface-300">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-purple-400" />
                    Referral Bonus
                  </div>
                </td>
                {tiers.map((tier, index) => (
                  <td key={tier.tier} className={`p-4 text-center ${index >= tiers.length - 1 ? 'text-surface-900 dark:text-white font-medium' : index >= tiers.length - 2 ? 'text-surface-700 dark:text-surface-300' : 'text-surface-500 dark:text-surface-400'}`}>
                    {index === 0 ? '$5' : index === 1 ? '$5-8' : index === 2 ? '$5-10' : '$10+'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 text-surface-700 dark:text-surface-300">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    Min. Deposit
                  </div>
                </td>
                {tiers.map((tier) => (
                  <td key={tier.tier} className="p-4 text-center text-surface-900 dark:text-white">
                    ${tier.minAmount.toLocaleString()}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk Warning */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
        <p className="text-amber-200 text-sm">
          <strong>Risk Warning:</strong> Trading cryptocurrency involves substantial
          risk and may not be suitable for every investor. The displayed rates are
          targets and not guaranteed. Only invest capital you can afford to lose.
          Seek independent financial advice if unsure.
        </p>
      </div>
    </div>
  );
}
