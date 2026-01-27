import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { verifyCertificate } from "@/lib/services/certificate-generator";

// Public endpoint - no auth required
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ number: string }> }
) {
  try {
    await connectDB();

    const { number } = await params;
    const result = await verifyCertificate(number);

    if (!result.valid) {
      return NextResponse.json(
        {
          valid: false,
          message: result.message,
        },
        { status: result.certificate ? 200 : 404 }
      );
    }

    const cert = result.certificate;

    if (!cert) {
      return NextResponse.json(
        { valid: false, message: "Certificate data not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      message: result.message,
      certificate: {
        certificateNumber: cert.certificateNumber,
        userName: cert.userName,
        amount: cert.amount,
        network: cert.network,
        toAddress: `${cert.toAddress.slice(0, 10)}...${cert.toAddress.slice(-8)}`,
        issueDate: cert.issueDate,
        status: cert.status,
      },
    });
  } catch (error) {
    console.error("Verify certificate error:", error);
    return NextResponse.json(
      { error: "Failed to verify certificate" },
      { status: 500 }
    );
  }
}
