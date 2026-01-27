import { User, ReferralReward, Transaction } from "@/lib/db/models";
import { getReferralReward as getSettingsReferralReward } from "@/lib/services/settings-service";
import { notifyReferralBonus } from "@/lib/services/notification-service";

/**
 * Process referral reward when a user makes their first approved deposit
 * @param userId - The user who made the deposit
 */
export async function processReferralReward(userId: string): Promise<void> {
  try {
    // Get the user who made the deposit
    const user = await User.findById(userId);
    if (!user) {
      console.log("User not found for referral reward");
      return;
    }

    // Check if user was referred
    if (!user.referredBy) {
      console.log("User was not referred");
      return;
    }

    // Check if referral reward already exists for this user
    const existingReward = await ReferralReward.findOne({
      referredUserId: userId,
    });

    if (existingReward) {
      console.log("Referral reward already processed for this user");
      return;
    }

    // Get the referrer
    const referrer = await User.findById(user.referredBy);
    if (!referrer) {
      console.log("Referrer not found");
      return;
    }

    // Calculate reward amount based on referrer's total referrals (from settings)
    const rewardAmount = await getSettingsReferralReward(referrer.referralCount);

    // Create referral reward record
    await ReferralReward.create({
      userId: referrer._id, // The referrer gets the reward
      referredUserId: user._id, // The user who was referred
      amount: rewardAmount,
      status: "CREDITED",
    });

    // Credit referrer's balance
    await User.findByIdAndUpdate(referrer._id, {
      $inc: {
        balance: rewardAmount,
        referralCount: 1,
      },
    });

    // Create transaction for referrer
    await Transaction.create({
      userId: referrer._id,
      type: "REFERRAL_REWARD",
      amount: rewardAmount,
      status: "COMPLETED",
      metadata: {
        referredUserId: user._id,
        referredUserName: user.name,
        referredUserEmail: user.email,
      },
    });

    // Create in-app notification for referral bonus
    try {
      await notifyReferralBonus(referrer._id.toString(), rewardAmount, user.name || "A user");
    } catch (notifyError) {
      console.error("Notification error (non-blocking):", notifyError);
    }

    console.log(
      `Referral reward processed: $${rewardAmount} for ${referrer.email} (referred ${user.email})`
    );
  } catch (error) {
    console.error("Error processing referral reward:", error);
    throw error;
  }
}

/**
 * Check if a user has already had a referral reward processed
 * @param userId - The referred user's ID
 */
export async function hasReferralRewardBeenProcessed(
  userId: string
): Promise<boolean> {
  const existingReward = await ReferralReward.findOne({
    referredUserId: userId,
  });
  return !!existingReward;
}
