import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { connectDB } from '@/lib/db/connect';
import { AuditLog } from '@/lib/db/models';
import { getSettings, updateSettings } from '@/lib/services/settings-service';

type Params = {
  params: Promise<{ section: string }>;
};

const VALID_SECTIONS = [
  'profit-tiers',
  'referral-tiers',
  'network-fees',
  'transaction-limits',
  'otp-settings',
  'platform-toggles',
  'wallet',
  'deposit-addresses',
  'weekend-banner',
];

/**
 * GET /api/admin/settings/[section]
 * Get specific section of settings
 */
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { section } = await params;

    if (!VALID_SECTIONS.includes(section)) {
      return NextResponse.json(
        { error: `Invalid section. Valid sections: ${VALID_SECTIONS.join(', ')}` },
        { status: 400 }
      );
    }

    await connectDB();
    const settings = await getSettings();

    // Return only the requested section
    let sectionData: unknown;
    switch (section) {
      case 'profit-tiers':
        sectionData = settings.profitTiers;
        break;
      case 'referral-tiers':
        sectionData = settings.referralTiers;
        break;
      case 'network-fees':
        sectionData = settings.networkFees;
        break;
      case 'transaction-limits':
        sectionData = settings.transactionLimits;
        break;
      case 'otp-settings':
        sectionData = settings.otpSettings;
        break;
      case 'platform-toggles':
        sectionData = settings.platformToggles;
        break;
      case 'wallet':
        sectionData = { depositWalletAddress: settings.depositWalletAddress };
        break;
      case 'deposit-addresses':
        sectionData = settings.networkDepositAddresses;
        break;
      case 'weekend-banner':
        sectionData = settings.weekendBanner || {
          enabled: false,
          title: 'Markets Closed for the Weekend',
          message: 'Trading markets are currently closed. Profit sharing is paused until markets reopen on Monday. Your investments remain secure.',
        };
        break;
    }

    return NextResponse.json({
      success: true,
      section,
      data: sectionData,
    });
  } catch (error) {
    console.error('Get section settings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch section settings' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/settings/[section]
 * Update specific section of settings
 */
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { section } = await params;

    if (!VALID_SECTIONS.includes(section)) {
      return NextResponse.json(
        { error: `Invalid section. Valid sections: ${VALID_SECTIONS.join(', ')}` },
        { status: 400 }
      );
    }

    await connectDB();

    const body = await request.json();

    // Validate and structure data based on section
    let data: Record<string, unknown> = {};
    switch (section) {
      case 'profit-tiers':
        if (!Array.isArray(body.profitTiers)) {
          return NextResponse.json(
            { error: 'profitTiers must be an array' },
            { status: 400 }
          );
        }
        // Validate each tier
        for (const tier of body.profitTiers) {
          if (typeof tier.tier !== 'string' || typeof tier.name !== 'string' ||
              typeof tier.minAmount !== 'number' || typeof tier.maxAmount !== 'number' ||
              typeof tier.dailyRate !== 'number') {
            return NextResponse.json(
              { error: 'Invalid profit tier format' },
              { status: 400 }
            );
          }
          if (tier.dailyRate < 0 || tier.dailyRate > 100) {
            return NextResponse.json(
              { error: 'Daily rate must be between 0 and 100' },
              { status: 400 }
            );
          }
        }
        data = { profitTiers: body.profitTiers };
        break;

      case 'referral-tiers':
        if (!Array.isArray(body.referralTiers)) {
          return NextResponse.json(
            { error: 'referralTiers must be an array' },
            { status: 400 }
          );
        }
        for (const tier of body.referralTiers) {
          if (typeof tier.minReferrals !== 'number' || typeof tier.maxReferrals !== 'number' ||
              typeof tier.rewardAmount !== 'number') {
            return NextResponse.json(
              { error: 'Invalid referral tier format' },
              { status: 400 }
            );
          }
        }
        data = { referralTiers: body.referralTiers };
        break;

      case 'network-fees':
        if (typeof body.networkFees !== 'object' || body.networkFees === null) {
          return NextResponse.json(
            { error: 'networkFees must be an object' },
            { status: 400 }
          );
        }
        const fees = body.networkFees;
        if (typeof fees.ERC20 !== 'number' || typeof fees.TRC20 !== 'number' ||
            typeof fees.BEP20 !== 'number') {
          return NextResponse.json(
            { error: 'Network fees must include ERC20, TRC20, and BEP20 as numbers' },
            { status: 400 }
          );
        }
        data = { networkFees: fees };
        break;

      case 'transaction-limits':
        if (typeof body.transactionLimits !== 'object' || body.transactionLimits === null) {
          return NextResponse.json(
            { error: 'transactionLimits must be an object' },
            { status: 400 }
          );
        }
        const limits = body.transactionLimits;
        const requiredLimitFields = ['minDeposit', 'maxDeposit', 'minWithdrawal', 'maxWithdrawal', 'dailyWithdrawalLimit'];
        for (const field of requiredLimitFields) {
          if (typeof limits[field] !== 'number' || limits[field] < 0) {
            return NextResponse.json(
              { error: `${field} must be a non-negative number` },
              { status: 400 }
            );
          }
        }
        data = { transactionLimits: limits };
        break;

      case 'otp-settings':
        if (typeof body.otpSettings !== 'object' || body.otpSettings === null) {
          return NextResponse.json(
            { error: 'otpSettings must be an object' },
            { status: 400 }
          );
        }
        const otp = body.otpSettings;
        if (typeof otp.cooldownSeconds !== 'number' || typeof otp.expiryMinutes !== 'number' ||
            typeof otp.maxAttempts !== 'number' || typeof otp.lockoutMinutes !== 'number') {
          return NextResponse.json(
            { error: 'Invalid OTP settings format' },
            { status: 400 }
          );
        }
        data = { otpSettings: otp };
        break;

      case 'platform-toggles':
        if (typeof body.platformToggles !== 'object' || body.platformToggles === null) {
          return NextResponse.json(
            { error: 'platformToggles must be an object' },
            { status: 400 }
          );
        }
        const toggles = body.platformToggles;
        const booleanFields = ['depositsEnabled', 'withdrawalsEnabled', 'profitSharingEnabled',
                              'newRegistrationsEnabled', 'kycRequiredForWithdrawal'];
        for (const field of booleanFields) {
          if (field in toggles && typeof toggles[field] !== 'boolean') {
            return NextResponse.json(
              { error: `${field} must be a boolean` },
              { status: 400 }
            );
          }
        }
        data = { platformToggles: toggles };
        break;

      case 'wallet':
        if (typeof body.depositWalletAddress !== 'string' || !body.depositWalletAddress.trim()) {
          return NextResponse.json(
            { error: 'depositWalletAddress must be a non-empty string' },
            { status: 400 }
          );
        }
        data = { depositWalletAddress: body.depositWalletAddress.trim() };
        break;

      case 'deposit-addresses':
        if (typeof body.networkDepositAddresses !== 'object' || body.networkDepositAddresses === null) {
          return NextResponse.json(
            { error: 'networkDepositAddresses must be an object' },
            { status: 400 }
          );
        }
        const addresses = body.networkDepositAddresses;
        // Validate ERC20 address format (0x...)
        if (typeof addresses.ERC20 !== 'string' || !addresses.ERC20.startsWith('0x')) {
          return NextResponse.json(
            { error: 'ERC20 address must be a valid Ethereum address starting with 0x' },
            { status: 400 }
          );
        }
        // Validate TRC20 address format (T...)
        if (typeof addresses.TRC20 !== 'string' || !addresses.TRC20.startsWith('T')) {
          return NextResponse.json(
            { error: 'TRC20 address must be a valid Tron address starting with T' },
            { status: 400 }
          );
        }
        // Validate BEP20 address format (0x...)
        if (typeof addresses.BEP20 !== 'string' || !addresses.BEP20.startsWith('0x')) {
          return NextResponse.json(
            { error: 'BEP20 address must be a valid BSC address starting with 0x' },
            { status: 400 }
          );
        }
        data = { networkDepositAddresses: addresses };
        break;

      case 'weekend-banner':
        if (typeof body.weekendBanner !== 'object' || body.weekendBanner === null) {
          return NextResponse.json(
            { error: 'weekendBanner must be an object' },
            { status: 400 }
          );
        }
        const banner = body.weekendBanner;
        if (typeof banner.enabled !== 'boolean') {
          return NextResponse.json(
            { error: 'enabled must be a boolean' },
            { status: 400 }
          );
        }
        if (typeof banner.title !== 'string' || !banner.title.trim()) {
          return NextResponse.json(
            { error: 'title must be a non-empty string' },
            { status: 400 }
          );
        }
        if (typeof banner.message !== 'string' || !banner.message.trim()) {
          return NextResponse.json(
            { error: 'message must be a non-empty string' },
            { status: 400 }
          );
        }
        data = { weekendBanner: { enabled: banner.enabled, title: banner.title.trim(), message: banner.message.trim() } };
        break;
    }

    // Update settings
    const { settings, changes } = await updateSettings(section, data, session.user.id);

    // Create audit log
    if (changes.length > 0) {
      await AuditLog.create({
        action: 'SETTINGS_UPDATED',
        adminId: session.user.id,
        entityType: 'SystemSettings',
        entityId: settings._id,
        details: {
          section,
          changes,
          version: settings.version,
        },
      });
    }

    return NextResponse.json({
      success: true,
      section,
      settings,
      changes,
    });
  } catch (error) {
    console.error('Update section settings error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to update settings: ${errorMessage}` },
      { status: 500 }
    );
  }
}
