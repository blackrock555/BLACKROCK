import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { connectDB } from '@/lib/db/connect';
import { SupportTicket, User } from '@/lib/db/models';
import { sendAdminNotification } from '@/lib/email/notification-service';

// GET - List user's support tickets
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const query: Record<string, unknown> = { userId: session.user.id };
    if (status && status !== 'all') {
      query.status = status.toUpperCase();
    }

    const [tickets, total] = await Promise.all([
      SupportTicket.find(query)
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      SupportTicket.countDocuments(query),
    ]);

    return NextResponse.json({
      tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching support tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch support tickets' },
      { status: 500 }
    );
  }
}

// POST - Create a new support ticket
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { subject, category, priority, message } = body;

    // Validation
    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Subject and message are required' },
        { status: 400 }
      );
    }

    if (subject.length > 200) {
      return NextResponse.json(
        { error: 'Subject must be less than 200 characters' },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: 'Message must be less than 5000 characters' },
        { status: 400 }
      );
    }

    // Get user name (from session or database)
    let userName = session.user.name || 'User';
    try {
      const user = await User.findById(session.user.id).select('name').lean() as { name?: string } | null;
      if (user?.name) {
        userName = user.name;
      }
    } catch {
      // Use session name as fallback
    }

    // Create ticket
    const ticket = new SupportTicket({
      userId: session.user.id,
      subject,
      category: category || 'GENERAL',
      priority: priority || 'MEDIUM',
      messages: [
        {
          senderId: session.user.id,
          senderType: 'USER',
          senderName: userName,
          content: message,
          createdAt: new Date(),
        },
      ],
    });

    await ticket.save();

    // Send admin notification (non-blocking)
    sendAdminNotification({
      type: 'NEW_TICKET',
      userName,
      userEmail: session.user.email || '',
      subject,
      ticketCategory: category || 'GENERAL',
    }).catch((err) => console.error('Admin notification error (non-blocking):', err));

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket._id,
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        createdAt: ticket.createdAt,
      },
    });
  } catch (error) {
    // Log error internally but don't expose details to client
    console.error('Error creating support ticket');
    return NextResponse.json(
      { error: 'Failed to create support ticket. Please try again later.' },
      { status: 500 }
    );
  }
}
