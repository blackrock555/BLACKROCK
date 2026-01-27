import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models";
import { changePasswordSchema } from "@/lib/validators/auth";
import bcrypt from "bcryptjs";

const MAX_PASSWORD_ATTEMPTS = 5;
const PASSWORD_LOCKOUT_MINUTES = 30;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();

    // Validate input with strong password schema
    const validation = changePasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validation.data;

    // Get user with password hash and security fields
    const user = await User.findById(session.user.id).select(
      "+passwordHash passwordChangeAttempts passwordChangeLockedUntil lastPasswordChangeAt"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has a password (might be OAuth-only)
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "Cannot change password for OAuth accounts" },
        { status: 400 }
      );
    }

    // Check lockout status
    if (user.passwordChangeLockedUntil && user.passwordChangeLockedUntil > new Date()) {
      const remainingMinutes = Math.ceil(
        (user.passwordChangeLockedUntil.getTime() - Date.now()) / (1000 * 60)
      );
      return NextResponse.json(
        {
          error: `Too many failed attempts. Try again in ${remainingMinutes} minutes.`,
          lockedUntil: user.passwordChangeLockedUntil,
          remainingAttempts: 0,
        },
        { status: 429 }
      );
    }

    // Reset attempts if lockout has expired
    if (user.passwordChangeLockedUntil && user.passwordChangeLockedUntil <= new Date()) {
      await User.findByIdAndUpdate(session.user.id, {
        $set: { passwordChangeAttempts: 0 },
        $unset: { passwordChangeLockedUntil: 1 },
      });
      user.passwordChangeAttempts = 0;
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isValid) {
      const newAttempts = (user.passwordChangeAttempts || 0) + 1;
      const remainingAttempts = MAX_PASSWORD_ATTEMPTS - newAttempts;

      // Check if should lock out
      if (newAttempts >= MAX_PASSWORD_ATTEMPTS) {
        const lockoutUntil = new Date(Date.now() + PASSWORD_LOCKOUT_MINUTES * 60 * 1000);
        await User.findByIdAndUpdate(session.user.id, {
          $set: {
            passwordChangeAttempts: newAttempts,
            passwordChangeLockedUntil: lockoutUntil,
          },
        });

        return NextResponse.json(
          {
            error: `Too many failed attempts. Account locked for ${PASSWORD_LOCKOUT_MINUTES} minutes.`,
            lockedUntil: lockoutUntil,
            remainingAttempts: 0,
          },
          { status: 429 }
        );
      }

      // Increment attempts
      await User.findByIdAndUpdate(session.user.id, {
        $set: { passwordChangeAttempts: newAttempts },
      });

      return NextResponse.json(
        {
          error: "Current password is incorrect",
          remainingAttempts,
        },
        { status: 400 }
      );
    }

    // Check if new password is same as current
    const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);
    if (isSamePassword) {
      return NextResponse.json(
        { error: "New password must be different from current password" },
        { status: 400 }
      );
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    // Update password and reset attempts
    await User.findByIdAndUpdate(session.user.id, {
      $set: {
        passwordHash: newPasswordHash,
        passwordChangeAttempts: 0,
        lastPasswordChangeAt: new Date(),
      },
      $unset: { passwordChangeLockedUntil: 1 },
    });

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Failed to change password" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id).select(
      "passwordChangeAttempts passwordChangeLockedUntil lastPasswordChangeAt provider"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const now = Date.now();
    let lockoutRemaining = 0;
    if (user.passwordChangeLockedUntil && user.passwordChangeLockedUntil > new Date()) {
      lockoutRemaining = Math.ceil(
        (user.passwordChangeLockedUntil.getTime() - now) / 1000
      );
    }

    const remainingAttempts = Math.max(
      0,
      MAX_PASSWORD_ATTEMPTS - (user.passwordChangeAttempts || 0)
    );

    return NextResponse.json({
      hasPassword: user.provider === "credentials",
      lastPasswordChangeAt: user.lastPasswordChangeAt || null,
      lockoutRemaining,
      remainingAttempts,
      isLocked: lockoutRemaining > 0,
    });
  } catch (error) {
    console.error("Get password status error:", error);
    return NextResponse.json(
      { error: "Failed to get password status" },
      { status: 500 }
    );
  }
}
