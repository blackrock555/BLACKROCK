// ===========================================
// BLACKROCK Application Constants
// ===========================================

// Profit Share Tier Configuration
// Users earn daily profit based on their deposit balance
export const PROFIT_TIERS = [
  { min: 0, max: 99.99, rate: 4, tier: 'TIER_1', name: 'Bronze' },
  { min: 100, max: 999.99, rate: 5, tier: 'TIER_2', name: 'Silver' },
  { min: 1000, max: Infinity, rate: 6, tier: 'TIER_3', name: 'Gold' },
] as const;

// Referral Reward Tiers
// Rewards based on total number of referrals
export const REFERRAL_TIERS = [
  { minReferrals: 0, maxReferrals: 9, reward: 5 },
  { minReferrals: 10, maxReferrals: 19, reward: 8 },
  { minReferrals: 20, maxReferrals: 29, reward: 9 },
  { minReferrals: 30, maxReferrals: Infinity, reward: 10 },
] as const;

// Minimum transaction amounts (in USDT)
export const MIN_DEPOSIT = 50;
export const MIN_WITHDRAWAL = 50;

// Deposit wallet address
export const DEPOSIT_WALLET_ADDRESS = process.env.DEPOSIT_WALLET_ADDRESS || '0xDE8b3Da180f806caE004E11C35e69FdFAFddc2dc';

// Supported networks for deposits/withdrawals
export const SUPPORTED_NETWORKS = [
  { value: 'ERC20', label: 'ERC-20 (Ethereum)', icon: 'ethereum' },
  { value: 'TRC20', label: 'TRC-20 (Tron)', icon: 'tron' },
  { value: 'BEP20', label: 'BEP-20 (BSC)', icon: 'binance' },
] as const;

// File upload settings
export const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880'); // 5MB default
export const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

// Rate limiting
export const RATE_LIMIT_CONFIG = {
  auth: { maxRequests: 5, windowMs: 60000 }, // 5 attempts per minute for auth
  api: { maxRequests: 100, windowMs: 60000 }, // 100 requests per minute for API
  upload: { maxRequests: 10, windowMs: 60000 }, // 10 uploads per minute
};

// KYC document types
export const KYC_DOCUMENT_TYPES = [
  { value: 'passport', label: 'Passport' },
  { value: 'national_id', label: 'National ID Card' },
  { value: 'drivers_license', label: "Driver's License" },
] as const;

// User roles
export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const;

// Transaction types
export const TRANSACTION_TYPES = {
  DEPOSIT: 'DEPOSIT',
  WITHDRAWAL: 'WITHDRAWAL',
  PROFIT_SHARE: 'PROFIT_SHARE',
  REFERRAL_REWARD: 'REFERRAL_REWARD',
  ADMIN_ADJUSTMENT: 'ADMIN_ADJUSTMENT',
} as const;

// Request statuses
export const REQUEST_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

// KYC statuses
export const KYC_STATUS = {
  NOT_SUBMITTED: 'NOT_SUBMITTED',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

// Helper functions (legacy - uses hardcoded values)
// For dynamic values from database, use lib/services/settings-service.ts instead
export function getProfitTier(balance: number) {
  return PROFIT_TIERS.find((t) => balance >= t.min && balance <= t.max) ?? PROFIT_TIERS[0];
}

export function getReferralTier(referralCount: number) {
  return REFERRAL_TIERS.find(
    (t) => referralCount >= t.minReferrals && referralCount <= t.maxReferrals
  ) ?? REFERRAL_TIERS[0];
}

// Re-export async functions from settings service for convenience
// These fetch values from the database with caching
export {
  getProfitTierForBalance as getActiveProfitTier,
  getProfitTiers as getActiveProfitTiers,
  getReferralReward as getActiveReferralReward,
  getReferralTiers as getActiveReferralTiers,
  getNetworkFee as getActiveNetworkFee,
  getNetworkFees as getActiveNetworkFees,
  getTransactionLimits as getActiveTransactionLimits,
  getDepositWalletAddress as getActiveDepositWalletAddress,
  isFeatureEnabled,
} from '@/lib/services/settings-service';

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(d);
}
