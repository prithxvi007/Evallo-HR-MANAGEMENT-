import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Team, Employee } from '@/lib/models';
import { logAction } from '@/lib/util/utils';
import { verifyToken } from '@/lib/auth';

// GET single team
export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await the params Promise
    const { id } = await params;

    const team = await Team.findOne({
      _id: id,
      organization: decoded.organizationId
    })
    .populate('teamLead', 'firstName lastName email position')
    .populate('members', 'firstName lastName email position department');

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ team });

  } catch (error) {
    console.error('Get team error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team' },
      { status: 500 }
    );
  }
}

// PUT update team
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await the params Promise
    const { id } = await params;
    const data = await request.json();

    // Check if team name already exists for other teams
    if (data.name) {
      const existingTeam = await Team.findOne({
        name: data.name,
        organization: decoded.organizationId,
        _id: { $ne: id }
      });

      if (existingTeam) {
        return NextResponse.json(
          { error: 'Team with this name already exists' },
          { status: 400 }
        );
      }
    }

    const team = await Team.findOneAndUpdate(
      { 
        _id: id,
        organization: decoded.organizationId 
      },
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
    .populate('teamLead', 'firstName lastName email position')
    .populate('members', 'firstName lastName email position department');

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Log the action
    await logAction(
      decoded.userId, 
      decoded.organizationId, 
      'team_update', 
      'team', 
      team._id,
      { team: team.name }
    );

    return NextResponse.json({
      message: 'Team updated successfully',
      team
    });

  } catch (error) {
    console.error('Update team error:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Invalid team data' },
        { status: 400 }
      );
    }
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Team with this name already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update team' },
      { status: 500 }
    );
  }
}

// DELETE team
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Await the params Promise
    const { id } = await params;

    const team = await Team.findOneAndDelete({
      _id: id,
      organization: decoded.organizationId
    });

    if (!team) {
      return NextResponse.json(
        { error: 'Team not found' },
        { status: 404 }
      );
    }

    // Remove this team from all employees' teams array
    await Employee.updateMany(
      { teams: id },
      { $pull: { teams: id } }
    );

    // Log the action
    await logAction(
      decoded.userId, 
      decoded.organizationId, 
      'team_delete', 
      'team', 
      team._id,
      { team: team.name }
    );

    return NextResponse.json({
      message: 'Team deleted successfully'
    });

  } catch (error) {
    console.error('Delete team error:', error);
    return NextResponse.json(
      { error: 'Failed to delete team' },
      { status: 500 }
    );
  }
}