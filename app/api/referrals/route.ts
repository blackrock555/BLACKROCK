import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/connect";
import { ReferralReward, User } from "@/lib/db/models";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get referral rewards for this user
    const referrals = await ReferralReward.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    // Get referred users details
    const referralIds = referrals.map((r) => r.referredUserId);
    const referredUsers = await User.find(
      { _id: { $in: referralIds } },
      { name: 1, email: 1 }
    ).lean();

    // Map user details to referrals
    const referralsWithDetails = referrals.map((referral) => {
      const user = referredUsers.find(
        (u) => u._id.toString() === referral.referredUserId?.toString()
      );
      return {
        ...referral,
        referredUserName: user?.name || "Unknown",
        referredUserEmail: user?.email || "Unknown",
      };
    });

    // Calculate stats
    const totalReferrals = referrals.length;
    const activeReferrals = referrals.filter(
      (r) => r.status === "CREDITED"
    ).length;
    const totalEarned = referrals
      .filter((r) => r.status === "CREDITED")
      .reduce((sum, r) => sum + (r.amount || 0), 0);

    return NextResponse.json({
      referrals: referralsWithDetails,
      stats: {
        totalReferrals,
        activeReferrals,
        totalEarned,
      },
    });
  } catch (error) {
    console.error("Get referrals error:", error);
    return NextResponse.json(
      { error: "Failed to fetch referrals" },
      { status: 500 }
    );
  }
}
