import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Employee } from '@/lib/models';
import { logAction } from '@/lib/util/utils';
import { verifyToken } from '@/lib/auth';

// GET single employee
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

    const employee = await Employee.findOne({
      _id: id,
      organization: decoded.organizationId
    }).populate('teams', 'name description');

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ employee });

  } catch (error) {
    console.error('Get employee error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee' },
      { status: 500 }
    );
  }
}

// PUT update employee
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

    // Check if email already exists for other employees
    if (data.email) {
      const existingEmployee = await Employee.findOne({
        email: data.email,
        organization: decoded.organizationId,
        _id: { $ne: id }
      });

      if (existingEmployee) {
        return NextResponse.json(
          { error: 'Employee with this email already exists' },
          { status: 400 }
        );
      }
    }

    const employee = await Employee.findOneAndUpdate(
      { 
        _id: id,
        organization: decoded.organizationId 
      },
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('teams', 'name description');

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Log the action
    await logAction(
      decoded.userId, 
      decoded.organizationId, 
      'employee_update', 
      'employee', 
      employee._id,
      { employee: `${employee.firstName} ${employee.lastName}` }
    );

    return NextResponse.json({
      message: 'Employee updated successfully',
      employee
    });

  } catch (error) {
    console.error('Update employee error:', error);
    
    if (error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Invalid employee data' },
        { status: 400 }
      );
    }
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Employee with this email already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update employee' },
      { status: 500 }
    );
  }
}

// DELETE employee
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

    const employee = await Employee.findOneAndDelete({
      _id: id,
      organization: decoded.organizationId
    });

    if (!employee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      );
    }

    // Log the action
    await logAction(
      decoded.userId, 
      decoded.organizationId, 
      'employee_delete', 
      'employee', 
      employee._id,
      { employee: `${employee.firstName} ${employee.lastName}` }
    );

    return NextResponse.json({
      message: 'Employee deleted successfully'
    });

  } catch (error) {
    console.error('Delete employee error:', error);
    return NextResponse.json(
      { error: 'Failed to delete employee' },
      { status: 500 }
    );
  }
}