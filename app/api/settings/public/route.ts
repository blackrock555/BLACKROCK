import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { getPublicSettings } from '@/lib/services/settings-service';

/**
 * GET /api/settings/public
 * Returns non-sensitive settings for frontend use
 * No authentication required
 */
export async function GET() {
  try {
    await connectDB();

    const publicSettings = await getPublicSettings();

    return NextResponse.json({
      success: true,
      settings: publicSettings,
    });
  } catch (error) {
    console.error('Get public settings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}
