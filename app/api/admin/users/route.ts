import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/lib/db/models";

// Escape special regex characters to prevent NoSQL injection
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Verify admin user still exists and is active
    const adminUser = await User.findById(session.user.id).select("status role");
    if (!adminUser || adminUser.status !== "ACTIVE" || adminUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    // Enforce pagination limits to prevent DoS
    const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 10, 1), 100);
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);

    const query: Record<string, unknown> = { role: "USER" };
    if (search) {
      // Escape regex special characters to prevent injection
      const escapedSearch = escapeRegex(search.trim());
      query.$or = [
        { name: { $regex: escapedSearch, $options: "i" } },
        { email: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    const users = await User.find(query)
      .select("-passwordHash")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(query);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
