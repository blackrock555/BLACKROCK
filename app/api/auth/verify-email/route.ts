import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { User, ReferralReward } from '@/lib/db/models';
import { getReferralTier } from '@/lib/constants';
import { sendWelcomeEmail } from '@/lib/email/notification-service';

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/login?error=missing_token', request.url));
    }

    await connectDB();

    // Find user with valid token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
    }

    // Verify email
    user.emailVerified = new Date();
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    // Send welcome email (only once)
    if (!user.welcomeEmailSent) {
      try {
        const emailSent = await sendWelcomeEmail({
          email: user.email,
          name: user.name,
        });

        if (emailSent) {
          await User.findByIdAndUpdate(user._id, {
            $set: { welcomeEmailSent: true },
          });
        }
      } catch (emailError) {
        console.error('Welcome email error (non-blocking):', emailError);
        // Don't fail verification if email sending fails
      }
    }

    // Handle referral reward if user was referred
    if (user.referredBy) {
      try {
        const referrer = await User.findById(user.referredBy);

        if (referrer) {
          // Get reward amount based on referrer's tier
          const tier = getReferralTier(referrer.referralCount);
          const rewardAmount = tier.reward;

          // Create referral reward for referrer
          const existingReward = await ReferralReward.findOne({
            userId: referrer._id,
            referredUserId: user._id,
          });

          if (!existingReward) {
            // Create pending reward (will be credited on first deposit)
            await ReferralReward.create({
              userId: referrer._id,
              referredUserId: user._id,
              amount: rewardAmount,
              status: 'PENDING',
              triggerEvent: 'email_verified',
              tierAtTime: `${tier.minReferrals}-${tier.maxReferrals}`,
            });

            // Increment referrer's referral count
            await User.findByIdAndUpdate(referrer._id, {
              $inc: { referralCount: 1 },
            });
          }
        }
      } catch (referralError) {
        console.error('Referral processing error:', referralError);
        // Don't fail verification if referral processing fails
      }
    }

    return NextResponse.redirect(new URL('/login?verified=true', request.url));
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(new URL('/login?error=verification_failed', request.url));
  }
}
