import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id).select("notificationPreferences");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return default preferences if not set
    const defaultPreferences = {
      depositApproved: true,
      withdrawalApproved: true,
      withdrawalRequested: true,
      profitShare: true,
      securityAlerts: true,
      marketingEmails: false,
    };

    return NextResponse.json({
      preferences: user.notificationPreferences || defaultPreferences,
    });
  } catch (error) {
    console.error("Get notification preferences error:", error);
    return NextResponse.json(
      { error: "Failed to fetch notification preferences" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();

    // Validate the notification preferences
    const validKeys = [
      "depositApproved",
      "withdrawalApproved",
      "withdrawalRequested",
      "profitShare",
      "securityAlerts",
      "marketingEmails",
    ];

    const preferences: Record<string, boolean> = {};
    for (const key of validKeys) {
      if (typeof body[key] === "boolean") {
        preferences[key] = body[key];
      }
    }

    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: { notificationPreferences: preferences } },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Notification preferences updated",
      preferences: user.notificationPreferences,
    });
  } catch (error) {
    console.error("Update notification preferences error:", error);
    return NextResponse.json(
      { error: "Failed to update notification preferences" },
      { status: 500 }
    );
  }
}
