import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { connectDB } from '@/lib/db/connect';
import { AuditLog } from '@/lib/db/models';
import { getSettings, updateSettings, initializeSettings } from '@/lib/services/settings-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/admin/settings
 * Fetch all settings (admin only)
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const settings = await getSettings();

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/settings
 * Update settings (admin only)
 * Body: { section: string, data: object }
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { section, data } = body;

    if (!section || !data) {
      return NextResponse.json(
        { error: 'Section and data are required' },
        { status: 400 }
      );
    }

    // Validate section
    const validSections = [
      'profit-tiers',
      'referral-tiers',
      'network-fees',
      'transaction-limits',
      'otp-settings',
      'platform-toggles',
      'wallet',
    ];

    if (!validSections.includes(section)) {
      return NextResponse.json(
        { error: `Invalid section. Valid sections: ${validSections.join(', ')}` },
        { status: 400 }
      );
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
      settings,
      changes,
    });
  } catch (error) {
    console.error('Update settings error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to update settings: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/settings
 * Initialize settings with defaults (admin only)
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const settings = await initializeSettings();

    return NextResponse.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error('Initialize settings error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize settings' },
      { status: 500 }
    );
  }
}
