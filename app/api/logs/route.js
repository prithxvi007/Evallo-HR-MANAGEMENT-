import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { AuditLog } from '@/lib/models';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  try {
    // Connect to database first
    await dbConnect();
    
    // Verify authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const action = searchParams.get('action') || '';
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const skip = (page - 1) * limit;

    let query = { organization: decoded.organizationId };
    
    if (action) {
      query.action = action;
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Fetch logs with proper error handling
    const logs = await AuditLog.find(query)
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v')
      .lean()
      .catch(error => {
        console.error('Error fetching logs:', error);
        throw new Error('Failed to fetch logs from database');
      });

    const total = await AuditLog.countDocuments(query).catch(() => 0);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      logs: logs || [],
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });

  } catch (error) {
    console.error('Get logs error:', error.message);
    
    // Return empty response instead of error for dashboard
    if (request.url.includes('limit=5')) {
      return NextResponse.json({
        logs: [],
        pagination: {
          page: 1,
          limit: 5,
          total: 0,
          totalPages: 0
        }
      });
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    );
  }
}