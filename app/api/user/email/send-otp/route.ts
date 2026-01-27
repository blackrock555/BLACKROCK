import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { connectDB } from '@/lib/db/connect';
import { User } from '@/lib/db/models';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendOTPEmail } from '@/lib/email/notification-service';
import { getOtpSettings } from '@/lib/services/settings-service';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get OTP settings from the settings service
    const otpConfig = await getOtpSettings();

    const user = await User.findById(session.user.id).select(
      '+emailOtpHash emailOtpExpires emailOtpAttempts emailOtpLastSentAt emailOtpLockedUntil emailVerified'
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified' },
        { status: 400 }
      );
    }

    // Check lockout status
    if (user.emailOtpLockedUntil && user.emailOtpLockedUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (user.emailOtpLockedUntil.getTime() - Date.now()) / (1000 * 60)
      );
      return NextResponse.json(
        {
          error: `Too many failed attempts. Try again in ${remainingMinutes} minutes.`,
          lockedUntil: user.emailOtpLockedUntil,
        },
        { status: 429 }
      );
    }

    // Check cooldown
    if (user.emailOtpLastSentAt) {
      const secondsSinceLastSent = Math.floor(
        (Date.now() - user.emailOtpLastSentAt.getTime()) / 1000
      );
      if (secondsSinceLastSent < otpConfig.cooldownSeconds) {
        const remainingSeconds = otpConfig.cooldownSeconds - secondsSinceLastSent;
        return NextResponse.json(
          {
            error: `Please wait ${remainingSeconds} seconds before requesting a new code`,
            cooldownRemaining: remainingSeconds,
          },
          { status: 429 }
        );
      }
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Hash the OTP
    const otpHash = await bcrypt.hash(otp, 10);

    // Calculate expiry from settings
    const otpExpires = new Date(Date.now() + otpConfig.expiryMinutes * 60 * 1000);

    // Update user with new OTP
    await User.findByIdAndUpdate(session.user.id, {
      $set: {
        emailOtpHash: otpHash,
        emailOtpExpires: otpExpires,
        emailOtpAttempts: 0,
        emailOtpLastSentAt: new Date(),
      },
      $unset: {
        emailOtpLockedUntil: 1,
      },
    });

    // Send OTP email
    const emailSent = await sendOTPEmail({
      email: user.email,
      name: user.name,
      otp,
    });

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email',
      expiresIn: otpConfig.expiryMinutes * 60,
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}
