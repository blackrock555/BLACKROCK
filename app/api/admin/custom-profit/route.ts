import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/connect";
import { User, Transaction, ProfitShareLedger, AuditLog } from "@/lib/db/models";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Verify admin is still active
    const admin = await User.findById(session.user.id).lean();
    if (!admin || admin.status !== "ACTIVE" || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, amount, note } = body;

    // Validate inputs
    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
    }

    if (amount > 1000000) {
      return NextResponse.json({ error: "Amount cannot exceed $1,000,000" }, { status: 400 });
    }

    if (note && typeof note !== "string") {
      return NextResponse.json({ error: "Note must be a string" }, { status: 400 });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const targetUser = await User.findById(userId).lean();
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const adminObjectId = new mongoose.Types.ObjectId(session.user.id);
    const previousBalance = targetUser.balance || 0;
    const depositBalance = targetUser.depositBalance || 0;
    const newBalance = previousBalance + amount;

    // Calculate percentage relative to deposit balance
    const percentage = depositBalance > 0 ? (amount / depositBalance) * 100 : 0;

    // Use current timestamp (NOT midnight) to avoid unique index collision with daily profit shares
    const now = new Date();

    // Create ProfitShareLedger entry
    await ProfitShareLedger.create({
      userId: userObjectId,
      date: now,
      balanceSnapshot: depositBalance,
      tier: "CUSTOM",
      percentage: Math.round(percentage * 10000) / 10000,
      amount,
      credited: true,
      isCustom: true,
      createdBy: adminObjectId,
    });

    // Update user balance
    await User.findByIdAndUpdate(userId, {
      $inc: { balance: amount },
    });

    // Create transaction record
    await Transaction.create({
      userId: userObjectId,
      type: "PROFIT_SHARE",
      amount,
      status: "COMPLETED",
      metadata: {
        description: `Custom profit share${note ? `: ${note}` : ""}`,
        previousBalance,
        newBalance,
        isCustom: true,
        appliedBy: admin.name || admin.email,
        adminNote: note || undefined,
        percentage: Math.round(percentage * 10000) / 10000,
      },
    });

    // Create audit log
    await AuditLog.create({
      action: "CUSTOM_PROFIT_SHARE",
      adminId: adminObjectId,
      targetId: userObjectId,
      entityType: "ProfitShareLedger",
      details: {
        amount,
        previousBalance,
        newBalance,
        depositBalance,
        percentage: Math.round(percentage * 10000) / 10000,
        note: note || undefined,
        userName: targetUser.name,
        userEmail: targetUser.email,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully distributed $${amount.toFixed(2)} profit to ${targetUser.name || targetUser.email}`,
      data: {
        userId,
        amount,
        previousBalance,
        newBalance,
        percentage: Math.round(percentage * 100) / 100,
      },
    });
  } catch (error) {
    console.error("Custom profit share error:", error);
    return NextResponse.json(
      { error: "Failed to apply custom profit share" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const requestedPage = parseInt(searchParams.get("page") || "1");
    const page = Math.max(1, requestedPage);
    const requestedLimit = parseInt(searchParams.get("limit") || "20");
    const limit = Math.min(Math.max(1, requestedLimit), 100);
    const skip = (page - 1) * limit;

    const query = { isCustom: true };

    // Get paginated custom profit shares
    const [entries, totalCount] = await Promise.all([
      ProfitShareLedger.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email")
        .populate("createdBy", "name email")
        .lean(),
      ProfitShareLedger.countDocuments(query),
    ]);

    // Get aggregate stats
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [allTimeStats, todayStats] = await Promise.all([
      ProfitShareLedger.aggregate([
        { $match: { isCustom: true } },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]),
      ProfitShareLedger.aggregate([
        { $match: { isCustom: true, createdAt: { $gte: todayStart } } },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    return NextResponse.json({
      entries,
      stats: {
        allTimeTotal: allTimeStats[0]?.total || 0,
        allTimeCount: allTimeStats[0]?.count || 0,
        todayTotal: todayStats[0]?.total || 0,
        todayCount: todayStats[0]?.count || 0,
      },
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Get custom profit shares error:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom profit share data" },
      { status: 500 }
    );
  }
}
