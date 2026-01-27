import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { connectDB } from '@/lib/db/connect';
import { SupportTicket } from '@/lib/db/models';

// GET - Get a specific support ticket
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;

    const ticket = await SupportTicket.findOne({
      _id: id,
      userId: session.user.id,
    }).lean();

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error('Error fetching support ticket:', error);
    return NextResponse.json(
      { error: 'Failed to fetch support ticket' },
      { status: 500 }
    );
  }
}
