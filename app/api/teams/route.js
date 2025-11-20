import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Team } from '@/lib/models';
import { logAction } from '@/lib/util/utils';
import { verifyToken } from '@/lib/auth';

export async function GET(request) {
  try {
    await dbConnect();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    let query = { organization: decoded.organizationId };
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const teams = await Team.find(query)
      .populate('teamLead', 'firstName lastName email position')
      .populate('members', 'firstName lastName email position department')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Team.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      teams,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });

  } catch (error) {
    console.error('Get teams error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    const teamData = {
      ...data,
      organization: decoded.organizationId
    };

    const team = await Team.create(teamData);

    // Log the action
    try {
      await logAction(
        decoded.userId, 
        decoded.organizationId, 
        'team_create', 
        'team', 
        team._id,
        { team: team.name }
      );
    } catch (logError) {
      console.warn('Failed to log team creation:', logError);
    }

    await team.populate('teamLead', 'firstName lastName email position');
    await team.populate('members', 'firstName lastName email position department');

    return NextResponse.json({
      message: 'Team created successfully',
      team
    }, { status: 201 });

  } catch (error) {
    console.error('Create team error:', error);
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    );
  }
}