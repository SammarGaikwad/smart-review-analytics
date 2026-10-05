import jwt from 'jsonwebtoken';

export interface AuthTokenPayload {
  sub: string;
  email: string;
  roles: string[];
}

export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('FATAL: JWT_SECRET environment variable is not defined.');
  }
  return secret;
};

export const generateToken = (payload: AuthTokenPayload): string => {
  const secret = getJwtSecret();
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d';

  return jwt.sign(payload, secret, {
    expiresIn: expiresIn as jwt.SignOptions['expiresIn'],
  });
};

export const verifyToken = (token: string): AuthTokenPayload => {
  const secret = getJwtSecret();
  const decoded = jwt.verify(token, secret) as jwt.JwtPayload;

  if (!decoded || typeof decoded !== 'object' || !decoded.sub || !decoded.email || !Array.isArray(decoded.roles)) {
    throw new Error('Invalid token payload structure');
  }

  return {
    sub: decoded.sub as string,
    email: decoded.email as string,
    roles: decoded.roles as string[],
  };
};
