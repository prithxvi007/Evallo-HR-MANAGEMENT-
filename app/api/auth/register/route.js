import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { User, Organization } from '@/lib/models';
import { generateToken } from '@/lib/auth';

export async function POST(request) {
  try {
    await dbConnect();
    
    const { name, email, password, organizationName } = await request.json();

    // Validate input
    if (!name || !email || !password || !organizationName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Check if organization already exists
    const existingOrg = await Organization.findOne({ 
      $or: [
        { name: organizationName },
        { email: email }
      ]
    });
    
    if (existingOrg) {
      return NextResponse.json(
        { error: 'Organization with this name or email already exists' },
        { status: 400 }
      );
    }

    // Create organization
    const organization = await Organization.create({
      name: organizationName,
      email: email
    });

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      organization: organization._id,
      role: 'admin'
    });

    // Create token
    const token = generateToken({
      userId: user._id.toString(),
      organizationId: organization._id.toString(),
      role: user.role
    });

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    return NextResponse.json({
      message: 'Registration successful',
      token,
      user: userResponse
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'User or organization already exists' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}