"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Badge, Button, CopyButton, Skeleton, EmptyState, QRCodeDisplay } from "@/components/ui";
import {
  Users,
  Gift,
  DollarSign,
  Share2,
  QrCode,
  TrendingUp,
  Twitter,
  Facebook,
  Link as LinkIcon,
  Award,
} from "lucide-react";

const REWARD_TIERS = [
  { min: 0, max: 9, reward: 5, label: "Starter" },
  { min: 10, max: 19, reward: 8, label: "Bronze" },
  { min: 20, max: 29, reward: 9, label: "Silver" },
  { min: 30, max: Infinity, reward: 10, label: "Gold" },
];

interface Referral {
  _id: string;
  referredUserName: string;
  referredUserEmail: string;
  amount: number;
  status: "PENDING" | "CREDITED";
  createdAt: string;
}

export default function AffiliatePage() {
  const { data: session } = useSession();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    activeReferrals: 0,
    totalEarned: 0,
  });

  const referralCode = session?.user?.referralCode || "";
  const referralCount = session?.user?.referralCount || 0;
  const referralLink = typeof window !== "undefined"
    ? `${window.location.origin}/signup?ref=${referralCode}`
    : "";

  // Get current tier
  const getCurrentTier = () => {
    return REWARD_TIERS.find(
      (tier) => referralCount >= tier.min && referralCount <= tier.max
    ) || REWARD_TIERS[0];
  };

  const currentTier = getCurrentTier();
  const nextTier = REWARD_TIERS[REWARD_TIERS.indexOf(currentTier) + 1];

  useEffect(() => {
    const fetchReferrals = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/referrals");
        const data = await response.json();

        if (response.ok) {
          setReferrals(data.referrals || []);
          setStats({
            totalReferrals: data.stats?.totalReferrals || 0,
            activeReferrals: data.stats?.activeReferrals || 0,
            totalEarned: data.stats?.totalEarned || 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch referrals:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReferrals();
  }, []);

  const handleShare = (platform: string) => {
    const text = `Join BLACKROCK and earn up to 6% daily returns! Use my referral code: ${referralCode}`;
    const url = referralLink;

    switch (platform) {
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "telegram":
        window.open(
          `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
          "_blank"
        );
        break;
      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
          "_blank"
        );
        break;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">BlackRock Partners</h1>
        <p className="text-surface-400 mt-1">
          Partner with BlackRock and earn rewards for every referral
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-brand-500/20">
              <Users className="w-5 h-5 text-brand-400" />
            </div>
            <span className="text-surface-400">Total Referrals</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.totalReferrals}</p>
        </div>
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-surface-400">Active Referrals</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.activeReferrals}</p>
        </div>
        <div className="bg-surface-900 border border-surface-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-amber-500/20">
              <DollarSign className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-surface-400">Total Earned</span>
          </div>
          <p className="text-3xl font-bold text-white">
            ${stats.totalEarned.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Referral Link Card */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Your Referral Link
        </h2>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Link Section */}
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm text-surface-400 mb-2">
                Referral Code
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-surface-800 border border-surface-700 rounded-lg px-4 py-3 font-mono text-lg text-brand-400">
                  {referralCode}
                </div>
                <CopyButton value={referralCode} showLabel />
              </div>
            </div>
            <div>
              <label className="block text-sm text-surface-400 mb-2">
                Referral Link
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-surface-800 border border-surface-700 rounded-lg px-4 py-3 font-mono text-sm text-surface-300 truncate">
                  {referralLink}
                </div>
                <CopyButton value={referralLink} showLabel />
              </div>
            </div>
            {/* Share Buttons */}
            <div>
              <label className="block text-sm text-surface-400 mb-2">
                Share via
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleShare("twitter")}
                  className="p-3 bg-[#1DA1F2]/20 hover:bg-[#1DA1F2]/30 rounded-lg transition-colors"
                >
                  <Twitter className="w-5 h-5 text-[#1DA1F2]" />
                </button>
                <button
                  onClick={() => handleShare("facebook")}
                  className="p-3 bg-[#4267B2]/20 hover:bg-[#4267B2]/30 rounded-lg transition-colors"
                >
                  <Facebook className="w-5 h-5 text-[#4267B2]" />
                </button>
                <button
                  onClick={() => handleShare("telegram")}
                  className="p-3 bg-[#0088cc]/20 hover:bg-[#0088cc]/30 rounded-lg transition-colors"
                >
                  <Share2 className="w-5 h-5 text-[#0088cc]" />
                </button>
                <button
                  onClick={() => handleShare("whatsapp")}
                  className="p-3 bg-[#25D366]/20 hover:bg-[#25D366]/30 rounded-lg transition-colors"
                >
                  <LinkIcon className="w-5 h-5 text-[#25D366]" />
                </button>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <QRCodeDisplay
            data={referralLink}
            size={160}
            label="Scan to sign up"
            showDownload={true}
          />
        </div>
      </div>

      {/* Reward Tiers */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Reward Tiers</h2>
          <Badge variant="success">
            <Award className="w-3 h-3 mr-1" />
            {currentTier.label}
          </Badge>
        </div>

        {/* Progress to next tier */}
        {nextTier && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-surface-400">
                Progress to {nextTier.label}
              </span>
              <span className="text-white">
                {referralCount} / {nextTier.min} referrals
              </span>
            </div>
            <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    (referralCount / nextTier.min) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {REWARD_TIERS.map((tier, index) => {
            const isActive = tier === currentTier;
            const isUnlocked = referralCount >= tier.min;

            return (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  isActive
                    ? "bg-brand-500/10 border-brand-500"
                    : isUnlocked
                    ? "bg-surface-800 border-surface-700"
                    : "bg-surface-800/50 border-surface-700/50 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">{tier.label}</span>
                  {isActive && (
                    <Badge variant="success" className="text-xs">Current</Badge>
                  )}
                </div>
                <p className="text-2xl font-bold text-brand-400">
                  ${tier.reward}
                </p>
                <p className="text-surface-400 text-sm">per referral</p>
                <p className="text-surface-500 text-xs mt-2">
                  {tier.max === Infinity
                    ? `${tier.min}+ referrals`
                    : `${tier.min}-${tier.max} referrals`}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Referral History */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-surface-800">
          <h2 className="text-lg font-semibold text-white">Referral History</h2>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : referrals.length === 0 ? (
          <EmptyState
            icon={<Users className="w-12 h-12" />}
            title="No referrals yet"
            description="Share your referral link to start earning rewards"
          />
        ) : (
          <div className="divide-y divide-surface-800">
            {referrals.map((referral) => (
              <div
                key={referral._id}
                className="p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center">
                    <span className="text-brand-400 font-medium">
                      {referral.referredUserName?.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {referral.referredUserName}
                    </p>
                    <p className="text-surface-500 text-sm">
                      {formatDate(referral.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-semibold">
                    +${referral.amount}
                  </p>
                  <Badge
                    variant={
                      referral.status === "CREDITED" ? "success" : "warning"
                    }
                  >
                    {referral.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How It Works */}
      <div className="bg-surface-900 border border-surface-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-brand-500/20 flex items-center justify-center mx-auto mb-3">
              <span className="text-brand-400 font-bold text-lg">1</span>
            </div>
            <h3 className="font-medium text-white mb-1">Share Your Link</h3>
            <p className="text-surface-400 text-sm">
              Share your unique referral link with friends and family
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-brand-500/20 flex items-center justify-center mx-auto mb-3">
              <span className="text-brand-400 font-bold text-lg">2</span>
            </div>
            <h3 className="font-medium text-white mb-1">They Sign Up</h3>
            <p className="text-surface-400 text-sm">
              Your referrals create an account using your code
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-brand-500/20 flex items-center justify-center mx-auto mb-3">
              <span className="text-brand-400 font-bold text-lg">3</span>
            </div>
            <h3 className="font-medium text-white mb-1">Earn Rewards</h3>
            <p className="text-surface-400 text-sm">
              Get rewarded when they make their first deposit
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
