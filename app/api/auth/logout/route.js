import { NextResponse } from 'next/server';
import { logAction } from '@/lib/util/utils';
import { verifyToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    const decoded = verifyToken(token);
    
    if (decoded) {
      // Log the logout action
      await logAction(
        decoded.userId, 
        decoded.organizationId, 
        'logout', 
        'user', 
        decoded.userId,
        { user_id: decoded.userId }
      );
    }

    return NextResponse.json({
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Logout service unavailable' },
      { status: 500 }
    );
  }
}