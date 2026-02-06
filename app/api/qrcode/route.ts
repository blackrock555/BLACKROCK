import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const data = searchParams.get('data');
    const size = parseInt(searchParams.get('size') || '200', 10);
    const format = searchParams.get('format') || 'png';

    if (!data) {
      return NextResponse.json(
        { error: 'Data parameter is required' },
        { status: 400 }
      );
    }

    // Validate size
    const validSize = Math.min(Math.max(size, 100), 500);

    if (format === 'svg') {
      // Generate SVG
      const svg = await QRCode.toString(data, {
        type: 'svg',
        width: validSize,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });

      return new NextResponse(svg, {
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // Generate PNG as data URL
    const dataUrl = await QRCode.toDataURL(data, {
      width: validSize,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });

    // Convert data URL to buffer
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('QR code generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}
