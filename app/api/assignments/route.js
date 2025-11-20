import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Employee, Team } from '@/lib/models';
import { logAction } from '@/lib/util/utils';
import { verifyToken } from '@/lib/auth';

// GET all assignments (employees with their teams)
export async function GET(request) {
  try {
    await dbConnect();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    let employeeQuery = { organization: decoded.organizationId };
    
    if (search) {
      employeeQuery.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const employees = await Employee.find(employeeQuery)
      .populate('teams', 'name description')
      .sort({ firstName: 1, lastName: 1 })
      .lean();

    // Get all teams for available teams list
    const teams = await Team.find({ organization: decoded.organizationId })
      .select('name description')
      .lean();

    return NextResponse.json({
      employees,
      teams
    });

  } catch (error) {
    console.error('Get assignments error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}

// POST assign employee to team
export async function POST(request) {
  try {
    await dbConnect();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { employeeId, teamId, action } = await request.json();

    if (!employeeId || !teamId || !action) {
      return NextResponse.json(
        { error: 'Employee ID, Team ID, and action are required' },
        { status: 400 }
      );
    }

    let employee;
    let team;

    if (action === 'assign') {
      // Add team to employee's teams array
      employee = await Employee.findOneAndUpdate(
        { 
          _id: employeeId,
          organization: decoded.organizationId 
        },
        { $addToSet: { teams: teamId } },
        { new: true }
      ).populate('teams', 'name description');

      // Add employee to team's members array
      team = await Team.findOneAndUpdate(
        { 
          _id: teamId,
          organization: decoded.organizationId 
        },
        { $addToSet: { members: employeeId } },
        { new: true }
      );

      // Log the action
      await logAction(
        decoded.userId, 
        decoded.organizationId, 
        'assignment_add', 
        'assignment', 
        employeeId,
        { 
          employee: `${employee.firstName} ${employee.lastName}`,
          team: team.name 
        }
      );

    } else if (action === 'remove') {
      // Remove team from employee's teams array
      employee = await Employee.findOneAndUpdate(
        { 
          _id: employeeId,
          organization: decoded.organizationId 
        },
        { $pull: { teams: teamId } },
        { new: true }
      ).populate('teams', 'name description');

      // Remove employee from team's members array
      team = await Team.findOneAndUpdate(
        { 
          _id: teamId,
          organization: decoded.organizationId 
        },
        { $pull: { members: employeeId } },
        { new: true }
      );

      // Log the action
      await logAction(
        decoded.userId, 
        decoded.organizationId, 
        'assignment_remove', 
        'assignment', 
        employeeId,
        { 
          employee: `${employee.firstName} ${employee.lastName}`,
          team: team.name 
        }
      );
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "assign" or "remove".' },
        { status: 400 }
      );
    }

    if (!employee || !team) {
      return NextResponse.json(
        { error: 'Employee or Team not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: `Employee ${action === 'assign' ? 'assigned to' : 'removed from'} team successfully`,
      employee
    });

  } catch (error) {
    console.error('Assignment error:', error);
    return NextResponse.json(
      { error: 'Failed to process assignment' },
      { status: 500 }
    );
  }
}