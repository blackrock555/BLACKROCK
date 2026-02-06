import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { connectDB } from '@/lib/db/connect';
import { User } from '@/lib/db/models';
import bcrypt from 'bcryptjs';
import { verifyOtpSchema } from '@/lib/validators/auth';
import { sendWelcomeEmail } from '@/lib/email/notification-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const MAX_OTP_ATTEMPTS = 5;
const OTP_LOCKOUT_MINUTES = 30;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validation = verifyOtpSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { otp } = validation.data;

    await connectDB();

    const user = await User.findById(session.user.id).select(
      '+emailOtpHash emailOtpExpires emailOtpAttempts emailOtpLockedUntil emailVerified'
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
          error: `Account locked due to too many failed attempts. Try again in ${remainingMinutes} minutes.`,
          lockedUntil: user.emailOtpLockedUntil,
        },
        { status: 429 }
      );
    }

    // Check if OTP exists
    if (!user.emailOtpHash) {
      return NextResponse.json(
        { error: 'No verification code found. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if OTP expired
    if (!user.emailOtpExpires || user.emailOtpExpires < new Date()) {
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Verify OTP
    const isValidOtp = await bcrypt.compare(otp, user.emailOtpHash);

    if (!isValidOtp) {
      const newAttempts = (user.emailOtpAttempts || 0) + 1;
      const remainingAttempts = MAX_OTP_ATTEMPTS - newAttempts;

      // Check if should lock out
      if (newAttempts >= MAX_OTP_ATTEMPTS) {
        const lockoutUntil = new Date(Date.now() + OTP_LOCKOUT_MINUTES * 60 * 1000);
        await User.findByIdAndUpdate(session.user.id, {
          $set: {
            emailOtpAttempts: newAttempts,
            emailOtpLockedUntil: lockoutUntil,
          },
          $unset: {
            emailOtpHash: 1,
            emailOtpExpires: 1,
          },
        });

        return NextResponse.json(
          {
            error: `Too many failed attempts. Account locked for ${OTP_LOCKOUT_MINUTES} minutes.`,
            lockedUntil: lockoutUntil,
            remainingAttempts: 0,
          },
          { status: 429 }
        );
      }

      // Increment attempts
      await User.findByIdAndUpdate(session.user.id, {
        $set: { emailOtpAttempts: newAttempts },
      });

      return NextResponse.json(
        {
          error: 'Invalid verification code',
          remainingAttempts,
        },
        { status: 400 }
      );
    }

    // OTP is valid - mark email as verified and clear OTP fields
    await User.findByIdAndUpdate(session.user.id, {
      $set: {
        emailVerified: new Date(),
      },
      $unset: {
        emailOtpHash: 1,
        emailOtpExpires: 1,
        emailOtpAttempts: 1,
        emailOtpLastSentAt: 1,
        emailOtpLockedUntil: 1,
      },
    });

    // Send welcome email if not already sent
    if (!user.welcomeEmailSent) {
      await sendWelcomeEmail({
        email: user.email,
        name: user.name,
      });
      await User.findByIdAndUpdate(session.user.id, {
        $set: { welcomeEmailSent: true },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    );
  }
}
