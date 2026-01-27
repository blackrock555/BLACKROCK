import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { connectDB } from '@/lib/db/connect';
import { User } from '@/lib/db/models';
import { rateLimitAsync } from '@/lib/utils/rate-limiter';

// Hash token for comparison with stored hash
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting (uses Redis in production)
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = await rateLimitAsync(`reset-password:${ip}`, {
      maxRequests: 5,
      windowMs: 60000, // 5 attempts per minute
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check for password complexity
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    if (!hasUppercase || !hasLowercase || !hasNumber) {
      return NextResponse.json(
        { error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' },
        { status: 400 }
      );
    }

    await connectDB();

    // Hash the incoming token to compare with stored hash
    const hashedToken = hashToken(token);

    // Find user with valid reset token (using hashed comparison)
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update user password and clear reset token
    user.passwordHash = passwordHash;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
