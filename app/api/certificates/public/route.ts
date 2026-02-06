import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import WithdrawalCertificate from '@/lib/db/models/WithdrawalCertificate';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Fetch recent approved certificates for public display
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20);

    // Fetch recent approved certificates
    const certificates = await WithdrawalCertificate.find({
      status: 'ACTIVE',
    })
      .select('certificateNumber amount network issueDate')
      .populate('userId', 'name')
      .sort({ issueDate: -1 })
      .limit(limit)
      .lean();

    // Format for public display (hide sensitive info)
    interface CertificateData {
      _id: string;
      userId?: { name?: string };
      certificateNumber: string;
      amount: number;
      network: string;
      issueDate: Date;
    }

    const publicCertificates = (certificates as unknown as CertificateData[]).map((cert) => {
      // Mask the user's name for privacy
      const fullName = cert.userId?.name || 'Investor';
      const nameParts = fullName.split(' ');
      const maskedName =
        nameParts.length > 1
          ? `${nameParts[0]} ${nameParts[1].charAt(0)}.`
          : `${nameParts[0].charAt(0)}***`;

      return {
        id: cert._id,
        certificateNumber: cert.certificateNumber,
        name: maskedName,
        amount: cert.amount,
        network: cert.network,
        date: new Date(cert.issueDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
      };
    });

    return NextResponse.json({
      certificates: publicCertificates,
    });
  } catch (error) {
    console.error('Error fetching public certificates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch certificates' },
      { status: 500 }
    );
  }
}
