import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { connectDB } from '@/lib/db/connect';
import { User } from '@/lib/db/models';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const OTP_COOLDOWN_SECONDS = 60;
const MAX_OTP_ATTEMPTS = 5;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id).select(
      'emailVerified emailOtpExpires emailOtpAttempts emailOtpLastSentAt emailOtpLockedUntil'
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const now = Date.now();

    // Calculate cooldown remaining
    let cooldownRemaining = 0;
    if (user.emailOtpLastSentAt) {
      const secondsSinceLastSent = Math.floor(
        (now - user.emailOtpLastSentAt.getTime()) / 1000
      );
      if (secondsSinceLastSent < OTP_COOLDOWN_SECONDS) {
        cooldownRemaining = OTP_COOLDOWN_SECONDS - secondsSinceLastSent;
      }
    }

    // Calculate OTP expiry remaining
    let otpExpiresIn = 0;
    if (user.emailOtpExpires && user.emailOtpExpires > new Date()) {
      otpExpiresIn = Math.floor(
        (user.emailOtpExpires.getTime() - now) / 1000
      );
    }

    // Calculate lockout remaining
    let lockoutRemaining = 0;
    if (user.emailOtpLockedUntil && user.emailOtpLockedUntil > new Date()) {
      lockoutRemaining = Math.floor(
        (user.emailOtpLockedUntil.getTime() - now) / 1000
      );
    }

    const remainingAttempts = Math.max(0, MAX_OTP_ATTEMPTS - (user.emailOtpAttempts || 0));

    return NextResponse.json({
      emailVerified: !!user.emailVerified,
      verifiedAt: user.emailVerified || null,
      cooldownRemaining,
      otpExpiresIn,
      lockoutRemaining,
      remainingAttempts,
      isLocked: lockoutRemaining > 0,
      hasActiveOtp: otpExpiresIn > 0,
    });
  } catch (error) {
    console.error('Email status error:', error);
    return NextResponse.json(
      { error: 'Failed to get email status' },
      { status: 500 }
    );
  }
}
