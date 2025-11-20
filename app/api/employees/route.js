import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Employee } from '@/lib/models';
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
    const department = searchParams.get('department') || '';

    const skip = (page - 1) * limit;

    let query = { organization: decoded.organizationId };
    
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } }
      ];
    }

    if (department) {
      query.department = department;
    }

    const employees = await Employee.find(query)
      .populate('teams', 'name description')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Employee.countDocuments(query);

    return NextResponse.json({
      employees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get employees error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employees' },
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
    
    // Check if employee with email already exists
    const existingEmployee = await Employee.findOne({ 
      email: data.email,
      organization: decoded.organizationId 
    });

    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Employee with this email already exists' },
        { status: 400 }
      );
    }

    const employeeData = {
      ...data,
      organization: decoded.organizationId
    };

    const employee = await Employee.create(employeeData);

    // Log the action
    try {
      await logAction(
        decoded.userId, 
        decoded.organizationId, 
        'employee_create', 
        'employee', 
        employee._id,
        { employee: `${employee.firstName} ${employee.lastName}` }
      );
    } catch (logError) {
      console.warn('Failed to log employee creation:', logError);
    }

    await employee.populate('teams', 'name description');

    return NextResponse.json({
      message: 'Employee created successfully',
      employee
    }, { status: 201 });

  } catch (error) {
    console.error('Create employee error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Employee with this email already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create employee' },
      { status: 500 }
    );
  }
}