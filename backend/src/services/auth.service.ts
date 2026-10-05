import bcrypt from 'bcrypt';
import prisma from '../config/database';
import { generateToken } from '../utils/jwt';

export interface SafeUser {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  isActive: boolean;
  createdAt: Date;
}

export interface LoginResult {
  user: SafeUser;
  token: string;
}

export const loginUser = async (email: string, password: string): Promise<LoginResult> => {
  const sanitizedEmail = email.toLowerCase().trim();

  // 1. Fetch user from PostgreSQL using Prisma with UserRole & Role relations
  const user = await prisma.user.findUnique({
    where: { email: sanitizedEmail },
    include: {
      userRoles: {
        include: {
          role: true,
        },
      },
    },
  });

  // Generic credential error to prevent user enumeration
  if (!user) {
    throw new Error('Invalid email or password');
  }

  // 2. Reject inactive accounts
  if (!user.isActive) {
    throw new Error('Account is inactive. Please contact system administrator.');
  }

  // 3. Password hash verification using bcrypt
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // 4. Extract assigned role names
  const roles = user.userRoles.map((ur) => ur.role.name);

  // 5. Generate JWT token containing safe identity claims
  const token = generateToken({
    sub: user.id,
    email: user.email,
    roles,
  });

  // 6. Return safe profile & token (no password/passwordHash)
  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roles,
      isActive: user.isActive,
      createdAt: user.createdAt,
    },
    token,
  };
};

export const getUserProfile = async (userId: string): Promise<SafeUser> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userRoles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!user || !user.isActive) {
    throw new Error('User account not found or inactive');
  }

  const roles = user.userRoles.map((ur) => ur.role.name);

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    roles,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
};
