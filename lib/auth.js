import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export function verifyToken(token) {
  try {
    if (!token) {
      console.log('No token provided');
      return null;
    }
    
    // Remove 'Bearer ' prefix if present
    const cleanToken = token.replace('Bearer ', '');
    
    const decoded = jwt.verify(cleanToken, JWT_SECRET);
    
    if (!decoded || !decoded.userId || !decoded.organizationId) {
      console.log('Invalid token payload');
      return null;
    }
    
    return decoded;
  } catch (error) {
    console.error('Token verification error:', error.message);
    return null;
  }
}

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}