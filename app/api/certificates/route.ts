import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { connectDB } from "@/lib/db/connect";
import { WithdrawalCertificate } from "@/lib/db/models";
import mongoose from "mongoose";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const userId = new mongoose.Types.ObjectId(session.user.id);

    const certificates = await WithdrawalCertificate.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      certificates: certificates.map((cert) => ({
        id: cert._id.toString(),
        certificateNumber: cert.certificateNumber,
        amount: cert.amount,
        network: cert.network,
        toAddress: cert.toAddress,
        issueDate: cert.issueDate,
        status: cert.status,
      })),
    });
  } catch (error) {
    console.error("Get certificates error:", error);
    return NextResponse.json(
      { error: "Failed to fetch certificates" },
      { status: 500 }
    );
  }
}
