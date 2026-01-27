import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/connect";
import { KYCRequest } from "@/lib/db/models";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "PENDING";
    // Enforce pagination limits to prevent DoS
    const requestedLimit = Number(searchParams.get("limit")) || 10;
    const limit = Math.min(Math.max(1, requestedLimit), 100); // Max 100 per page
    const requestedPage = Number(searchParams.get("page")) || 1;
    const page = Math.max(1, requestedPage);

    const query: Record<string, unknown> = {};
    if (status && status !== "ALL") {
      query.status = status;
    }

    const kycRequests = await KYCRequest.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("userId", "name email")
      .lean();

    const total = await KYCRequest.countDocuments(query);

    return NextResponse.json({
      kycRequests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get KYC requests error:", error);
    return NextResponse.json(
      { error: "Failed to fetch KYC requests" },
      { status: 500 }
    );
  }
}
