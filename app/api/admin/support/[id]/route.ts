import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { connectDB } from '@/lib/db/connect';
import { SupportTicket, User } from '@/lib/db/models';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Get a specific support ticket (admin)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;

    const ticket = await SupportTicket.findById(id)
      .populate('userId', 'name email image')
      .lean();

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

// PATCH - Update ticket status or add admin reply
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { status, priority, message, assignTo } = body;

    const ticket = await SupportTicket.findById(id);

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    // Update status
    if (status) {
      const validStatuses = ['OPEN', 'IN_PROGRESS', 'AWAITING_RESPONSE', 'RESOLVED', 'CLOSED'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      ticket.status = status;

      if (status === 'RESOLVED') {
        ticket.resolvedAt = new Date();
      }
      if (status === 'CLOSED') {
        ticket.closedAt = new Date();
      }
    }

    // Update priority
    if (priority) {
      const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
      if (!validPriorities.includes(priority)) {
        return NextResponse.json({ error: 'Invalid priority' }, { status: 400 });
      }
      ticket.priority = priority;
    }

    // Assign to admin
    if (assignTo) {
      ticket.assignedTo = assignTo;
    }

    // Add admin reply
    if (message && message.trim().length > 0) {
      const admin = await User.findById(session.user.id).select('name').lean();

      ticket.messages.push({
        senderId: session.user.id,
        senderType: 'ADMIN',
        senderName: admin?.name || 'Support Team',
        content: message.trim(),
        createdAt: new Date(),
      });

      // Set status to awaiting response if replying
      if (!status) {
        ticket.status = 'AWAITING_RESPONSE';
      }
    }

    await ticket.save();

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket._id,
        ticketNumber: ticket.ticketNumber,
        status: ticket.status,
        priority: ticket.priority,
        updatedAt: ticket.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error updating support ticket:', error);
    return NextResponse.json(
      { error: 'Failed to update support ticket' },
      { status: 500 }
    );
  }
}
