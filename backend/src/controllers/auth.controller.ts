import { Request, Response } from 'express';
import { loginUser, getUserProfile } from '../services/auth.service';
import { createAuditLog } from '../services/audit.service';

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const result = await loginUser(email, password);

    // Record successful login audit event
    await createAuditLog({
      userId: result.user.id,
      userEmail: result.user.email,
      action: 'LOGIN_SUCCESS',
      resource: 'User',
      ipAddress: req.ip || (req.headers['x-forwarded-for'] as string) || null,
      status: 'SUCCESS',
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error: any) {
    console.error('Auth login error:', error.message);

    // Record failed login audit event (safe against missing email/user)
    await createAuditLog({
      userEmail: typeof email === 'string' ? email : null,
      action: 'LOGIN_FAILED',
      resource: 'User',
      ipAddress: req.ip || (req.headers['x-forwarded-for'] as string) || null,
      status: 'FAILURE',
    });

    if (
      error.message === 'Invalid email or password' ||
      error.message.includes('Account is inactive')
    ) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
    });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token missing or invalid',
      });
    }

    const userProfile = await getUserProfile(req.user.id);

    return res.status(200).json({
      success: true,
      data: userProfile,
    });
  } catch (error: any) {
    console.error('Get profile error:', error.message);
    return res.status(404).json({
      success: false,
      message: error.message || 'User profile not found',
    });
  }
};

// Demo RBAC Test Endpoints
export const testAuth = async (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'Authenticated endpoint accessible by any valid user role',
    user: req.user,
  });
};

export const testAdminAuth = async (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: 'Admin RBAC endpoint accessible only by Admin role',
    user: req.user,
  });
};
