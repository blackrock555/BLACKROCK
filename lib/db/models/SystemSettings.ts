import mongoose, { Schema, Document, Model } from 'mongoose';

// Type definitions for settings sections
export interface IProfitTier {
  tier: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  dailyRate: number;
}

export interface IReferralTier {
  minReferrals: number;
  maxReferrals: number;
  rewardAmount: number;
}

export interface INetworkFees {
  ERC20: number;
  TRC20: number;
  BEP20: number;
}

export interface INetworkDepositAddresses {
  ERC20: string;
  TRC20: string;
  BEP20: string;
}

export interface ITransactionLimits {
  minDeposit: number;
  maxDeposit: number;
  minWithdrawal: number;
  maxWithdrawal: number;
  dailyWithdrawalLimit: number;
}

export interface IOtpSettings {
  cooldownSeconds: number;
  expiryMinutes: number;
  maxAttempts: number;
  lockoutMinutes: number;
}

export interface IPlatformToggles {
  depositsEnabled: boolean;
  withdrawalsEnabled: boolean;
  profitSharingEnabled: boolean;
  newRegistrationsEnabled: boolean;
  kycRequiredForWithdrawal: boolean;
  tradingViewChartEnabled: boolean;
}

export interface IWeekendBannerSettings {
  enabled: boolean;
  title: string;
  message: string;
}

export interface ISystemSettings extends Document {
  _id: mongoose.Types.ObjectId;
  profitTiers: IProfitTier[];
  referralTiers: IReferralTier[];
  networkFees: INetworkFees;
  networkDepositAddresses: INetworkDepositAddresses;
  transactionLimits: ITransactionLimits;
  otpSettings: IOtpSettings;
  platformToggles: IPlatformToggles;
  weekendBanner: IWeekendBannerSettings;
  depositWalletAddress: string;
  version: number;
  lastModifiedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Default settings values
export const DEFAULT_SETTINGS = {
  profitTiers: [
    { tier: 'TIER_1', name: 'Starter', minAmount: 50, maxAmount: 100, dailyRate: 3 },
    { tier: 'TIER_2', name: 'Growth', minAmount: 100, maxAmount: 500, dailyRate: 4 },
    { tier: 'TIER_3', name: 'Premium', minAmount: 500, maxAmount: 5000, dailyRate: 6 },
    { tier: 'TIER_4', name: 'Elite', minAmount: 5000, maxAmount: 100000, dailyRate: 8 },
  ],
  referralTiers: [
    { minReferrals: 0, maxReferrals: 9, rewardAmount: 5 },
    { minReferrals: 10, maxReferrals: 19, rewardAmount: 8 },
    { minReferrals: 20, maxReferrals: 29, rewardAmount: 9 },
    { minReferrals: 30, maxReferrals: 999999999, rewardAmount: 10 },
  ],
  networkFees: {
    ERC20: 5,
    TRC20: 1,
    BEP20: 0.5,
  },
  networkDepositAddresses: {
    ERC20: '0xD31ac3Ae422953F60d090d99a401C8a6b53b7A82',
    TRC20: 'TJ8NdhBMJ7X9dJZ28oTveT9gn5e9woxvSx',
    BEP20: '0xD31ac3Ae422953F60d090d99a401C8a6b53b7A82',
  },
  transactionLimits: {
    minDeposit: 50,
    maxDeposit: 100000,
    minWithdrawal: 50,
    maxWithdrawal: 50000,
    dailyWithdrawalLimit: 10000,
  },
  otpSettings: {
    cooldownSeconds: 60,
    expiryMinutes: 10,
    maxAttempts: 5,
    lockoutMinutes: 30,
  },
  platformToggles: {
    depositsEnabled: true,
    withdrawalsEnabled: true,
    profitSharingEnabled: true,
    newRegistrationsEnabled: true,
    kycRequiredForWithdrawal: true,
    tradingViewChartEnabled: true,
  },
  weekendBanner: {
    enabled: false,
    title: 'Markets Closed for the Weekend',
    message: 'Trading markets are currently closed. Profit sharing is paused until markets reopen on Monday. Your investments remain secure.',
  },
  depositWalletAddress: '0x1eb17E4367F8D6aAF8C3cEC631f8e01103d7A716',
};

const profitTierSchema = new Schema<IProfitTier>(
  {
    tier: { type: String, required: true },
    name: { type: String, required: true },
    minAmount: { type: Number, required: true, min: 0 },
    maxAmount: { type: Number, required: true },
    dailyRate: { type: Number, required: true, min: 0, max: 100 },
  },
  { _id: false }
);

const referralTierSchema = new Schema<IReferralTier>(
  {
    minReferrals: { type: Number, required: true, min: 0 },
    maxReferrals: { type: Number, required: true },
    rewardAmount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const networkFeesSchema = new Schema<INetworkFees>(
  {
    ERC20: { type: Number, required: true, min: 0 },
    TRC20: { type: Number, required: true, min: 0 },
    BEP20: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const networkDepositAddressesSchema = new Schema<INetworkDepositAddresses>(
  {
    ERC20: { type: String, default: '0xD31ac3Ae422953F60d090d99a401C8a6b53b7A82' },
    TRC20: { type: String, default: 'TJ8NdhBMJ7X9dJZ28oTveT9gn5e9woxvSx' },
    BEP20: { type: String, default: '0xD31ac3Ae422953F60d090d99a401C8a6b53b7A82' },
  },
  { _id: false }
);

const transactionLimitsSchema = new Schema<ITransactionLimits>(
  {
    minDeposit: { type: Number, required: true, min: 0 },
    maxDeposit: { type: Number, required: true, min: 0 },
    minWithdrawal: { type: Number, required: true, min: 0 },
    maxWithdrawal: { type: Number, required: true, min: 0 },
    dailyWithdrawalLimit: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const otpSettingsSchema = new Schema<IOtpSettings>(
  {
    cooldownSeconds: { type: Number, required: true, min: 0 },
    expiryMinutes: { type: Number, required: true, min: 1 },
    maxAttempts: { type: Number, required: true, min: 1 },
    lockoutMinutes: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const platformTogglesSchema = new Schema<IPlatformToggles>(
  {
    depositsEnabled: { type: Boolean, default: true },
    withdrawalsEnabled: { type: Boolean, default: true },
    profitSharingEnabled: { type: Boolean, default: true },
    newRegistrationsEnabled: { type: Boolean, default: true },
    kycRequiredForWithdrawal: { type: Boolean, default: true },
    tradingViewChartEnabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const weekendBannerSettingsSchema = new Schema<IWeekendBannerSettings>(
  {
    enabled: { type: Boolean, default: false },
    title: { type: String, default: 'Markets Closed for the Weekend' },
    message: { type: String, default: 'Trading markets are currently closed. Profit sharing is paused until markets reopen on Monday. Your investments remain secure.' },
  },
  { _id: false }
);

const systemSettingsSchema = new Schema<ISystemSettings>(
  {
    profitTiers: {
      type: [profitTierSchema],
      default: DEFAULT_SETTINGS.profitTiers,
    },
    referralTiers: {
      type: [referralTierSchema],
      default: DEFAULT_SETTINGS.referralTiers,
    },
    networkFees: {
      type: networkFeesSchema,
      default: DEFAULT_SETTINGS.networkFees,
    },
    networkDepositAddresses: {
      type: networkDepositAddressesSchema,
      default: DEFAULT_SETTINGS.networkDepositAddresses,
    },
    transactionLimits: {
      type: transactionLimitsSchema,
      default: DEFAULT_SETTINGS.transactionLimits,
    },
    otpSettings: {
      type: otpSettingsSchema,
      default: DEFAULT_SETTINGS.otpSettings,
    },
    platformToggles: {
      type: platformTogglesSchema,
      default: DEFAULT_SETTINGS.platformToggles,
    },
    weekendBanner: {
      type: weekendBannerSettingsSchema,
      default: DEFAULT_SETTINGS.weekendBanner,
    },
    depositWalletAddress: {
      type: String,
      default: DEFAULT_SETTINGS.depositWalletAddress,
    },
    version: {
      type: Number,
      default: 1,
    },
    lastModifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one settings document exists (singleton pattern)
systemSettingsSchema.index({ _id: 1 }, { unique: true });

export const SystemSettings: Model<ISystemSettings> =
  mongoose.models.SystemSettings ||
  mongoose.model<ISystemSettings>('SystemSettings', systemSettingsSchema);
