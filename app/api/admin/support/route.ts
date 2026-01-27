import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/options';
import { connectDB } from '@/lib/db/connect';
import { SupportTicket } from '@/lib/db/models';

// GET - List all support tickets (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: Record<string, unknown> = {};
    if (status && status !== 'all') {
      query.status = status.toUpperCase();
    }
    if (priority && priority !== 'all') {
      query.priority = priority.toUpperCase();
    }
    if (category && category !== 'all') {
      query.category = category.toUpperCase();
    }

    const [tickets, total, stats] = await Promise.all([
      SupportTicket.find(query)
        .populate('userId', 'name email')
        .sort({ priority: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      SupportTicket.countDocuments(query),
      SupportTicket.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const statusCounts = stats.reduce(
      (acc: Record<string, number>, { _id, count }) => {
        acc[_id] = count;
        return acc;
      },
      {}
    );

    return NextResponse.json({
      tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        open: statusCounts['OPEN'] || 0,
        inProgress: statusCounts['IN_PROGRESS'] || 0,
        awaitingResponse: statusCounts['AWAITING_RESPONSE'] || 0,
        resolved: statusCounts['RESOLVED'] || 0,
        closed: statusCounts['CLOSED'] || 0,
        total,
      },
    });
  } catch (error) {
    console.error('Error fetching admin support tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch support tickets' },
      { status: 500 }
    );
  }
}
