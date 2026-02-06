import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { uploadToCloudinary, UploadFolder } from '@/lib/cloudinary';
import { rateLimitAsync } from '@/lib/utils/rate-limiter';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting (uses Redis in production)
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = await rateLimitAsync(`upload:${ip}`, {
      maxRequests: 20,
      windowMs: 60000,
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many uploads. Please try again later.' },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as UploadFolder;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!folder || !['kyc', 'deposits', 'documents'].includes(folder)) {
      return NextResponse.json({ error: 'Invalid folder' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WEBP, PDF' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    try {
      const result = await uploadToCloudinary(buffer, {
        folder,
        userId: session.user.id,
        resourceType: file.type === 'application/pdf' ? 'raw' : 'image',
      });

      return NextResponse.json({
        success: true,
        data: {
          public_id: result.public_id,
          url: result.secure_url,
          format: result.format,
          size: result.bytes,
        },
      });
    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      const errorMessage = uploadError instanceof Error ? uploadError.message : 'Unknown upload error';

      // Check for common Cloudinary configuration issues
      if (errorMessage.includes('Invalid') || errorMessage.includes('credentials')) {
        return NextResponse.json(
          { error: 'Upload service is not properly configured. Please contact support.' },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to upload file. Please try again or use a smaller file.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload request' },
      { status: 500 }
    );
  }
}
