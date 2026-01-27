import { connectDB } from '@/lib/db/connect';
import {
  SystemSettings,
  ISystemSettings,
  IProfitTier,
  IReferralTier,
  INetworkFees,
  INetworkDepositAddresses,
  ITransactionLimits,
  IOtpSettings,
  IPlatformToggles,
  IWeekendBannerSettings,
  DEFAULT_SETTINGS,
} from '@/lib/db/models';

// Cache configuration
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let settingsCache: ISystemSettings | null = null;
let cacheTimestamp: number = 0;

/**
 * Invalidate the settings cache
 */
export function invalidateSettingsCache(): void {
  settingsCache = null;
  cacheTimestamp = 0;
}

/**
 * Initialize settings with defaults if no settings exist
 */
export async function initializeSettings(): Promise<ISystemSettings> {
  await connectDB();

  let settings = await SystemSettings.findOne();

  if (!settings) {
    settings = await SystemSettings.create({
      ...DEFAULT_SETTINGS,
      version: 1,
    });
  }

  return settings;
}

/**
 * Get all settings with caching
 */
export async function getSettings(): Promise<ISystemSettings> {
  const now = Date.now();

  // Return cached settings if valid
  if (settingsCache && now - cacheTimestamp < CACHE_TTL_MS) {
    return settingsCache;
  }

  await connectDB();

  let settings = await SystemSettings.findOne().lean() as ISystemSettings | null;

  // Initialize if not exists
  if (!settings) {
    settings = await initializeSettings();
  }

  // Auto-detect weekend (Saturday = 6, Sunday = 0)
  const isWeekend = [0, 6].includes(new Date().getDay());

  // Ensure all fields have values (for existing documents missing new fields)
  const weekendBannerSettings = settings.weekendBanner || DEFAULT_SETTINGS.weekendBanner;
  const settingsWithDefaults = {
    ...settings,
    weekendBanner: {
      ...weekendBannerSettings,
      // Auto-enable on weekends if not manually disabled
      enabled: weekendBannerSettings.enabled || isWeekend,
    },
  } as ISystemSettings;

  // Update cache
  settingsCache = settingsWithDefaults;
  cacheTimestamp = now;

  return settingsWithDefaults;
}

/**
 * Update a specific section of settings
 */
export async function updateSettings(
  section: string,
  data: Partial<ISystemSettings>,
  adminId: string
): Promise<{ settings: ISystemSettings; changes: Array<{ field: string; previousValue: unknown; newValue: unknown }> }> {
  await connectDB();

  const currentSettings = await SystemSettings.findOne();
  if (!currentSettings) {
    throw new Error('Settings not found');
  }

  // Track changes for audit log
  const changes: Array<{ field: string; previousValue: unknown; newValue: unknown }> = [];

  // Build update object based on section
  const updateData: Record<string, unknown> = {};

  switch (section) {
    case 'profit-tiers':
      if (data.profitTiers) {
        changes.push({
          field: 'profitTiers',
          previousValue: currentSettings.profitTiers,
          newValue: data.profitTiers,
        });
        updateData.profitTiers = data.profitTiers;
      }
      break;

    case 'referral-tiers':
      if (data.referralTiers) {
        changes.push({
          field: 'referralTiers',
          previousValue: currentSettings.referralTiers,
          newValue: data.referralTiers,
        });
        updateData.referralTiers = data.referralTiers;
      }
      break;

    case 'network-fees':
      if (data.networkFees) {
        changes.push({
          field: 'networkFees',
          previousValue: currentSettings.networkFees,
          newValue: data.networkFees,
        });
        updateData.networkFees = data.networkFees;
      }
      break;

    case 'transaction-limits':
      if (data.transactionLimits) {
        changes.push({
          field: 'transactionLimits',
          previousValue: currentSettings.transactionLimits,
          newValue: data.transactionLimits,
        });
        updateData.transactionLimits = data.transactionLimits;
      }
      break;

    case 'otp-settings':
      if (data.otpSettings) {
        changes.push({
          field: 'otpSettings',
          previousValue: currentSettings.otpSettings,
          newValue: data.otpSettings,
        });
        updateData.otpSettings = data.otpSettings;
      }
      break;

    case 'platform-toggles':
      if (data.platformToggles) {
        changes.push({
          field: 'platformToggles',
          previousValue: currentSettings.platformToggles,
          newValue: data.platformToggles,
        });
        updateData.platformToggles = data.platformToggles;
      }
      break;

    case 'wallet':
      if (data.depositWalletAddress) {
        changes.push({
          field: 'depositWalletAddress',
          previousValue: currentSettings.depositWalletAddress,
          newValue: data.depositWalletAddress,
        });
        updateData.depositWalletAddress = data.depositWalletAddress;
      }
      break;

    case 'deposit-addresses':
      if (data.networkDepositAddresses) {
        changes.push({
          field: 'networkDepositAddresses',
          previousValue: currentSettings.networkDepositAddresses,
          newValue: data.networkDepositAddresses,
        });
        updateData.networkDepositAddresses = data.networkDepositAddresses;
      }
      break;

    case 'weekend-banner':
      if (data.weekendBanner) {
        changes.push({
          field: 'weekendBanner',
          previousValue: currentSettings.weekendBanner || DEFAULT_SETTINGS.weekendBanner,
          newValue: data.weekendBanner,
        });
        updateData.weekendBanner = data.weekendBanner;
      }
      break;

    default:
      throw new Error(`Unknown section: ${section}`);
  }

  if (Object.keys(updateData).length === 0) {
    return { settings: currentSettings, changes: [] };
  }

  // Update with version increment
  const updatedSettings = await SystemSettings.findOneAndUpdate(
    { _id: currentSettings._id },
    {
      $set: {
        ...updateData,
        lastModifiedBy: adminId,
      },
      $inc: { version: 1 },
    },
    { new: true }
  );

  if (!updatedSettings) {
    throw new Error('Failed to update settings');
  }

  // Invalidate cache
  invalidateSettingsCache();

  return { settings: updatedSettings, changes };
}

/**
 * Get the applicable profit tier for a given balance
 */
export async function getProfitTierForBalance(balance: number): Promise<IProfitTier> {
  const settings = await getSettings();
  const tier = settings.profitTiers.find(
    (t) => balance >= t.minAmount && balance <= t.maxAmount
  );
  return tier || settings.profitTiers[0];
}

/**
 * Get all profit tiers
 */
export async function getProfitTiers(): Promise<IProfitTier[]> {
  const settings = await getSettings();
  return settings.profitTiers;
}

/**
 * Get network fee for a specific network
 */
export async function getNetworkFee(network: string): Promise<number> {
  const settings = await getSettings();
  const normalizedNetwork = network.toUpperCase() as keyof INetworkFees;
  return settings.networkFees[normalizedNetwork] || 0;
}

/**
 * Get all network fees
 */
export async function getNetworkFees(): Promise<INetworkFees> {
  const settings = await getSettings();
  return settings.networkFees;
}

/**
 * Get referral reward amount based on referral count
 */
export async function getReferralReward(referralCount: number): Promise<number> {
  const settings = await getSettings();
  const tier = settings.referralTiers.find(
    (t) => referralCount >= t.minReferrals && referralCount <= t.maxReferrals
  );
  return tier?.rewardAmount || settings.referralTiers[0].rewardAmount;
}

/**
 * Get all referral tiers
 */
export async function getReferralTiers(): Promise<IReferralTier[]> {
  const settings = await getSettings();
  return settings.referralTiers;
}

/**
 * Get transaction limits
 */
export async function getTransactionLimits(): Promise<ITransactionLimits> {
  const settings = await getSettings();
  return settings.transactionLimits;
}

/**
 * Get OTP settings
 */
export async function getOtpSettings(): Promise<IOtpSettings> {
  const settings = await getSettings();
  return settings.otpSettings;
}

/**
 * Get platform toggles
 */
export async function getPlatformToggles(): Promise<IPlatformToggles> {
  const settings = await getSettings();
  return settings.platformToggles;
}

/**
 * Check if a specific feature is enabled
 */
export async function isFeatureEnabled(
  feature: keyof IPlatformToggles
): Promise<boolean> {
  const settings = await getSettings();
  return settings.platformToggles[feature] ?? true;
}

/**
 * Get deposit wallet address
 */
export async function getDepositWalletAddress(): Promise<string> {
  const settings = await getSettings();
  return settings.depositWalletAddress;
}

/**
 * Get all network deposit addresses
 */
export async function getNetworkDepositAddresses(): Promise<INetworkDepositAddresses> {
  const settings = await getSettings();
  return settings.networkDepositAddresses || DEFAULT_SETTINGS.networkDepositAddresses;
}

/**
 * Get deposit address for specific network
 */
export async function getDepositAddressForNetwork(network: 'ERC20' | 'TRC20' | 'BEP20'): Promise<string> {
  const settings = await getSettings();
  const addresses = settings.networkDepositAddresses || DEFAULT_SETTINGS.networkDepositAddresses;
  return addresses[network];
}

/**
 * Get public settings (non-sensitive data for frontend)
 */
export async function getPublicSettings(): Promise<{
  profitTiers: IProfitTier[];
  networkFees: INetworkFees;
  networkDepositAddresses: INetworkDepositAddresses;
  transactionLimits: Pick<ITransactionLimits, 'minDeposit' | 'minWithdrawal'>;
  depositWalletAddress: string;
  platformToggles: Pick<IPlatformToggles, 'depositsEnabled' | 'withdrawalsEnabled' | 'newRegistrationsEnabled' | 'tradingViewChartEnabled'>;
  weekendBanner: IWeekendBannerSettings;
}> {
  const settings = await getSettings();
  return {
    profitTiers: settings.profitTiers,
    networkFees: settings.networkFees,
    networkDepositAddresses: settings.networkDepositAddresses || DEFAULT_SETTINGS.networkDepositAddresses,
    transactionLimits: {
      minDeposit: settings.transactionLimits.minDeposit,
      minWithdrawal: settings.transactionLimits.minWithdrawal,
    },
    depositWalletAddress: settings.depositWalletAddress,
    platformToggles: {
      depositsEnabled: settings.platformToggles.depositsEnabled,
      withdrawalsEnabled: settings.platformToggles.withdrawalsEnabled,
      newRegistrationsEnabled: settings.platformToggles.newRegistrationsEnabled,
      tradingViewChartEnabled: settings.platformToggles.tradingViewChartEnabled ?? true,
    },
    weekendBanner: settings.weekendBanner || DEFAULT_SETTINGS.weekendBanner,
  };
}
