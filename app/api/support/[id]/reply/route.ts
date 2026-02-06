import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { connectDB } from '@/lib/db/connect';
import { SupportTicket, User } from '@/lib/db/models';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// POST - Add a reply to a support ticket
export async function POST(
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
    const body = await request.json();
    const { message, attachments } = body;

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: 'Message must be less than 5000 characters' },
        { status: 400 }
      );
    }

    // Find ticket and verify ownership
    const ticket = await SupportTicket.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Check if ticket is closed
    if (ticket.status === 'CLOSED') {
      return NextResponse.json(
        { error: 'Cannot reply to a closed ticket' },
        { status: 400 }
      );
    }

    // Get user info
    const user = await User.findById(session.user.id).select('name').lean();

    // Add reply
    ticket.messages.push({
      senderId: session.user.id,
      senderType: 'USER',
      senderName: user?.name || 'User',
      content: message.trim(),
      attachments: attachments || [],
      createdAt: new Date(),
    });

    // Update status to OPEN if it was AWAITING_RESPONSE
    if (ticket.status === 'AWAITING_RESPONSE' || ticket.status === 'RESOLVED') {
      ticket.status = 'OPEN';
    }

    await ticket.save();

    return NextResponse.json({
      success: true,
      message: 'Reply added successfully',
      ticket: {
        id: ticket._id,
        status: ticket.status,
        updatedAt: ticket.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error adding reply to support ticket:', error);
    return NextResponse.json(
      { error: 'Failed to add reply' },
      { status: 500 }
    );
  }
}
