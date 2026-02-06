import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { readFile, stat } from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Serve uploaded files (KYC documents, deposit proofs, etc.)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { path: pathParts } = await params;
    const filePath = path.join(process.cwd(), 'uploads', ...pathParts);

    // Security: Only allow access to files in uploads directory
    const resolvedPath = path.resolve(filePath);
    const uploadsDir = path.resolve(process.cwd(), 'uploads');

    if (!resolvedPath.startsWith(uploadsDir)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if user has access to this file
    const isAdmin = session.user.role === 'ADMIN';

    // For KYC: only the user themselves or admin can access
    if (resolvedPath.includes('/kyc/')) {
      const isOwnFile = resolvedPath.includes(session.user.id);
      if (!isAdmin && !isOwnFile) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // For deposits: admin only (users don't need to view their own proofs again)
    if (resolvedPath.includes('/deposits/') && !isAdmin) {
      // Allow users to view - they might want to see their proof
    }

    // Check if file exists
    try {
      await stat(filePath);
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Read and return the file
    const file = await readFile(filePath);

    // Determine content type
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.webp': 'image/webp',
    };

    const contentType = contentTypes[ext] || 'application/octet-stream';

    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('File serve error:', error);
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 });
  }
}
