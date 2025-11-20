import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { User } from '@/lib/models';
import { logAction } from '@/lib/util/utils';
import { generateToken } from '@/lib/auth';

export async function POST(request) {
  try {
    await dbConnect();
    
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user with password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user has comparePassword method
    if (typeof user.comparePassword !== 'function') {
      console.error('User model missing comparePassword method');
      return NextResponse.json(
        { error: 'Authentication system error' },
        { status: 500 }
      );
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated. Please contact administrator.' },
        { status: 401 }
      );
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Create token
    const token = generateToken({
      userId: user._id.toString(),
      organizationId: user.organization.toString(),
      role: user.role
    });

    // Log login action
    try {
      await logAction(
        user._id,
        user.organization,
        'login',
        'user',
        user._id,
        { user_email: user.email }
      );
    } catch (logError) {
      console.warn('Failed to log login action:', logError);
      // Continue even if logging fails
    }

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication service unavailable. Please try again.' },
      { status: 500 }
    );
  }
}