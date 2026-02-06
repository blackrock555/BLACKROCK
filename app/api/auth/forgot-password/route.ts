import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db/connect';
import { User } from '@/lib/db/models';
import { generateToken } from '@/lib/utils/helpers';
import { rateLimitAsync } from '@/lib/utils/rate-limiter';
import { sendEmail, isEmailConfigured } from '@/lib/email/transporter';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Hash token for secure storage (one-way hash)
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting (uses Redis in production)
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = await rateLimitAsync(`forgot-password:${ip}`, {
      maxRequests: 3,
      windowMs: 60000, // 3 attempts per minute
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user (always return success to prevent email enumeration)
    const user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // Generate reset token (plain token for URL, hashed for storage)
      const resetToken = generateToken(32);
      const hashedToken = hashToken(resetToken);
      const resetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes (reduced for security)

      // Update user with HASHED reset token (never store plain tokens)
      user.passwordResetToken = hashedToken;
      user.passwordResetExpires = resetExpires;
      await user.save();

      // Send reset email if email is configured
      if (isEmailConfigured) {
        const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

        try {
          await sendEmail({
            to: email,
            subject: 'Reset Your Password - BLACKROCK',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Reset Your Password</h2>
                <p>Hi ${user.name},</p>
                <p>You requested to reset your password. Click the button below to proceed:</p>
                <p style="margin: 24px 0;">
                  <a href="${resetUrl}"
                     style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
                    Reset Password
                  </a>
                </p>
                <p>This link will expire in 30 minutes.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
                <p style="color: #666; font-size: 12px;">BLACKROCK Investment Platform</p>
              </div>
            `,
          });
        } catch (emailError) {
          // Don't log email content for security
          console.error('Failed to send reset email');
        }
      }
      // SECURITY: Never log tokens, even in development
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
