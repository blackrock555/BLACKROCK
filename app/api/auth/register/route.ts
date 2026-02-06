import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db/connect';
import { User } from '@/lib/db/models';
import { registerSchema } from '@/lib/validators/auth';
import { generateReferralCode, generateToken } from '@/lib/utils/helpers';
import { rateLimitAsync } from '@/lib/utils/rate-limiter';
import { sendEmail, isEmailConfigured } from '@/lib/email/transporter';
import { getVerificationEmailTemplate } from '@/lib/email/templates/verification';
import { notifyWelcome } from '@/lib/services/notification-service';
import { sendAdminNotification } from '@/lib/email/notification-service';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const isDev = process.env.NODE_ENV !== 'production';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting (uses Redis in production)
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = await rateLimitAsync(`register:${ip}`, {
      maxRequests: 5,
      windowMs: 60000, // 5 attempts per minute
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password, referralCode } = validationResult.data;

    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Handle referral
    let referredBy;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
      if (referrer) {
        referredBy = referrer._id;
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // In development without email configured, auto-verify users
    const shouldAutoVerify = isDev && !isEmailConfigured;

    // Generate email verification token (only if not auto-verifying)
    const emailVerificationToken = shouldAutoVerify ? undefined : generateToken(32);
    const emailVerificationExpires = shouldAutoVerify
      ? undefined
      : new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = new User({
      name,
      email,
      passwordHash,
      referralCode: generateReferralCode(),
      referredBy,
      emailVerificationToken,
      emailVerificationExpires,
      emailVerified: shouldAutoVerify ? new Date() : undefined, // Auto-verify in dev
      provider: 'credentials',
    });

    await user.save();

    // Create welcome notification
    try {
      await notifyWelcome(user._id.toString(), name);
    } catch (notifyError) {
      console.error('Welcome notification error (non-blocking):', notifyError);
    }

    // Send admin notification (non-blocking)
    sendAdminNotification({
      type: 'NEW_USER',
      userName: name,
      userEmail: email,
    }).catch((err) => console.error('Admin notification error (non-blocking):', err));

    // Send verification email (skip in dev if email not configured)
    if (!shouldAutoVerify) {
      const verificationUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${emailVerificationToken}`;

      try {
        await sendEmail({
          to: email,
          subject: 'Verify Your Email - BLACKROCK',
          html: getVerificationEmailTemplate({ name, verificationUrl }),
        });
      } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
        // Don't fail registration if email fails, but log it
      }
    }

    const message = shouldAutoVerify
      ? 'Registration successful! You can now login.'
      : 'Registration successful! Please check your email to verify your account.';

    return NextResponse.json(
      {
        success: true,
        message,
        autoVerified: shouldAutoVerify,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An error occurred during registration. Please try again.' },
      { status: 500 }
    );
  }
}
