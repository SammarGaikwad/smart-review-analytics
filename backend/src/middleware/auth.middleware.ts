import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { AuthenticatedUser } from '../types/express';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Missing or malformed Authorization header.',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed. Token is missing.',
      });
    }

    const payload = verifyToken(token);

    // Attach authenticated user information to request
    req.user = {
      id: payload.sub,
      email: payload.email,
      fullName: '', // Profile details can be populated dynamically if needed
      roles: payload.roles,
    };

    next();
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Invalid or expired token.',
    });
  }
};
