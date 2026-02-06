import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/connect";
import { User, Transaction, DepositRequest, WithdrawalRequest, AuditLog } from "@/lib/db/models";
import mongoose from "mongoose";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Maximum balance adjustment allowed without super admin approval
const MAX_BALANCE_ADJUSTMENT = 10000;
// Maximum bonus amount allowed per grant
const MAX_BONUS_AMOUNT = 5000;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate ObjectId format to prevent injection
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    await connectDB();

    // Verify admin user still exists and is active
    const adminUser = await User.findById(session.user.id).select("status role");
    if (!adminUser || adminUser.status !== "ACTIVE" || adminUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(params.id)
      .select("-passwordHash -emailVerificationToken -passwordResetToken")
      .lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get recent transactions
    const transactions = await Transaction.find({ userId: params.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    // Get deposit/withdrawal stats
    const [depositStats, withdrawalStats] = await Promise.all([
      DepositRequest.aggregate([
        { $match: { userId: user._id, status: "APPROVED" } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
      WithdrawalRequest.aggregate([
        { $match: { userId: user._id, status: "APPROVED" } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),
    ]);

    return NextResponse.json({
      user,
      transactions,
      stats: {
        totalDeposits: depositStats[0]?.total || 0,
        depositCount: depositStats[0]?.count || 0,
        totalWithdrawals: withdrawalStats[0]?.total || 0,
        withdrawalCount: withdrawalStats[0]?.count || 0,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    await connectDB();

    // Verify admin user still exists and is active
    const adminUser = await User.findById(session.user.id).select("status role");
    if (!adminUser || adminUser.status !== "ACTIVE" || adminUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, amount, note } = body;

    const user = await User.findById(params.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent self-modification for critical actions
    if (params.id === session.user.id && ["make_admin", "remove_admin", "suspend"].includes(action)) {
      return NextResponse.json(
        { error: "Cannot modify your own admin privileges or status" },
        { status: 403 }
      );
    }

    let auditAction = "";
    let auditDetails: Record<string, unknown> = {};

    switch (action) {
      case "suspend":
        auditAction = "USER_SUSPENDED";
        auditDetails = { previousStatus: user.status };
        user.status = "SUSPENDED";
        await user.save();
        break;

      case "activate":
        auditAction = "USER_ACTIVATED";
        auditDetails = { previousStatus: user.status };
        user.status = "ACTIVE";
        await user.save();
        break;

      case "adjust_balance":
        if (typeof amount !== "number" || isNaN(amount)) {
          return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
        }

        // Enforce maximum adjustment limit
        if (Math.abs(amount) > MAX_BALANCE_ADJUSTMENT) {
          return NextResponse.json(
            { error: `Balance adjustments cannot exceed $${MAX_BALANCE_ADJUSTMENT}. Contact super admin for larger adjustments.` },
            { status: 403 }
          );
        }

        const previousBalance = user.balance;
        user.balance = Math.max(0, user.balance + amount);
        await user.save();

        auditAction = "BALANCE_ADJUSTED";
        auditDetails = {
          previousBalance,
          newBalance: user.balance,
          adjustmentAmount: amount,
          note: note || "No note provided",
        };

        // Create transaction record
        await Transaction.create({
          userId: user._id,
          type: "ADMIN_ADJUSTMENT",
          amount: amount,
          status: "COMPLETED",
          metadata: {
            description: note || "Admin balance adjustment",
            adminNote: `Adjusted by admin. Previous: $${previousBalance}, New: $${user.balance}`,
            previousBalance,
            newBalance: user.balance,
          },
        });
        break;

      case "give_bonus":
        if (typeof amount !== "number" || isNaN(amount) || amount <= 0) {
          return NextResponse.json({ error: "Valid positive amount is required" }, { status: 400 });
        }

        // Enforce maximum bonus limit
        if (amount > MAX_BONUS_AMOUNT) {
          return NextResponse.json(
            { error: `Bonus amount cannot exceed $${MAX_BONUS_AMOUNT}. Contact super admin for larger bonuses.` },
            { status: 403 }
          );
        }

        const previousBalanceBonus = user.balance;
        user.balance = user.balance + amount;
        await user.save();

        auditAction = "BONUS_GRANTED";
        auditDetails = {
          previousBalance: previousBalanceBonus,
          newBalance: user.balance,
          bonusAmount: amount,
          reason: note || "Admin bonus reward",
        };

        // Create transaction record for bonus
        await Transaction.create({
          userId: user._id,
          type: "BONUS",
          amount: amount,
          status: "COMPLETED",
          metadata: {
            description: note || "Admin bonus reward",
            adminNote: `Bonus granted by admin. Amount: $${amount}`,
            previousBalance: previousBalanceBonus,
            newBalance: user.balance,
            grantedBy: session.user.id,
          },
        });
        break;

      case "make_admin":
        // SECURITY: Role elevation is disabled - requires direct database access
        // This prevents compromised admin accounts from creating more admins
        return NextResponse.json(
          { error: "Admin role changes are restricted. Please contact the system administrator." },
          { status: 403 }
        );

      case "remove_admin":
        // SECURITY: Role changes are disabled for security
        return NextResponse.json(
          { error: "Admin role changes are restricted. Please contact the system administrator." },
          { status: 403 }
        );

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Create audit log entry for all successful actions
    if (auditAction) {
      try {
        await AuditLog.create({
          adminId: new mongoose.Types.ObjectId(session.user.id),
          action: auditAction,
          targetId: user._id,
          entityType: "USER",
          entityId: user._id,
          details: auditDetails,
          ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
        });
      } catch (auditError) {
        // Log but don't fail the request if audit logging fails
        console.error("Failed to create audit log:", auditError);
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        status: user.status,
        balance: user.balance,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
