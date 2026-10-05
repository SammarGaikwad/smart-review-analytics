import { Express } from 'express';

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
