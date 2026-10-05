import bcrypt from 'bcrypt';
import prisma from '../config/database';

export interface UserQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

export interface UserListResult {
  items: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateUserInput {
  email: string;
  fullName: string;
  password: string;
  roleName?: string;
  roleId?: string;
}

export interface UpdateUserInput {
  email?: string;
  fullName?: string;
  password?: string;
  isActive?: boolean;
}

/**
 * Format user database record into safe profile object without passwordHash.
 */
const formatSafeUser = (user: any) => {
  const roles = user.userRoles ? user.userRoles.map((ur: any) => ur.role.name) : [];
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    roles,
    userRoles: user.userRoles
      ? user.userRoles.map((ur: any) => ({
          id: ur.id,
          roleId: ur.roleId,
          roleName: ur.role.name,
          description: ur.role.description,
        }))
      : [],
  };
};

/**
 * List available system roles.
 */
export const getAllRoles = async () => {
  return await prisma.role.findMany({
    orderBy: {
      name: 'asc',
    },
  });
};

/**
 * Query users with pagination, optional search, and role filtering.
 */
export const getUsers = async (options: UserQueryOptions): Promise<UserListResult> => {
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(options.limit) || 20));
  const skip = (page - 1) * limit;

  const where: any = {};

  if (options.search) {
    where.OR = [
      { email: { contains: options.search, mode: 'insensitive' } },
      { fullName: { contains: options.search, mode: 'insensitive' } },
    ];
  }

  if (options.role) {
    where.userRoles = {
      some: {
        role: {
          name: { equals: options.role, mode: 'insensitive' },
        },
      },
    };
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    items: users.map(formatSafeUser),
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};

/**
 * Fetch a single user by ID.
 */
export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      userRoles: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!user) return null;
  return formatSafeUser(user);
};

/**
 * Create a new user with hashed password and role assignment.
 */
export const createUser = async (input: CreateUserInput) => {
  const sanitizedEmail = input.email.toLowerCase().trim();

  // Check email conflict
  const existingUser = await prisma.user.findUnique({
    where: { email: sanitizedEmail },
  });

  if (existingUser) {
    return { error: 'EMAIL_ALREADY_EXISTS' };
  }

  // Find requested role
  let targetRole = null;
  if (input.roleId) {
    targetRole = await prisma.role.findUnique({ where: { id: input.roleId } });
  } else if (input.roleName) {
    targetRole = await prisma.role.findFirst({
      where: { name: { equals: input.roleName, mode: 'insensitive' } },
    });
  } else {
    // Default to Customer role if not specified
    targetRole = await prisma.role.findFirst({ where: { name: 'Customer' } });
  }

  if (!targetRole) {
    return { error: 'INVALID_ROLE' };
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const newUser = await prisma.user.create({
    data: {
      email: sanitizedEmail,
      fullName: input.fullName,
      passwordHash,
      isActive: true,
      userRoles: {
        create: {
          roleId: targetRole.id,
        },
      },
    },
    include: {
      userRoles: {
        include: {
          role: true,
        },
      },
    },
  });

  return { user: formatSafeUser(newUser) };
};

/**
 * Update user basic details or password.
 */
export const updateUser = async (id: string, input: UpdateUserInput) => {
  const existingUser = await prisma.user.findUnique({ where: { id } });
  if (!existingUser) {
    return { error: 'USER_NOT_FOUND' };
  }

  const updateData: any = {};

  if (input.fullName !== undefined) {
    updateData.fullName = input.fullName;
  }

  if (input.isActive !== undefined) {
    updateData.isActive = input.isActive;
  }

  if (input.email !== undefined && input.email.toLowerCase().trim() !== existingUser.email) {
    const sanitizedEmail = input.email.toLowerCase().trim();
    const emailConflict = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });
    if (emailConflict) {
      return { error: 'EMAIL_ALREADY_EXISTS' };
    }
    updateData.email = sanitizedEmail;
  }

  if (input.password && input.password.trim().length > 0) {
    updateData.passwordHash = await bcrypt.hash(input.password, 10);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData,
    include: {
      userRoles: {
        include: {
          role: true,
        },
      },
    },
  });

  return { user: formatSafeUser(updatedUser) };
};

/**
 * Assign a role to a user (prevents duplicates).
 */
export const assignUserRole = async (userId: string, roleIdentifier: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { error: 'USER_NOT_FOUND' };
  }

  // Find role by ID or Name
  const role = await prisma.role.findFirst({
    where: {
      OR: [
        { id: roleIdentifier },
        { name: { equals: roleIdentifier, mode: 'insensitive' } },
      ],
    },
  });

  if (!role) {
    return { error: 'INVALID_ROLE' };
  }

  // Check if relationship already exists
  const existingUserRole = await prisma.userRole.findUnique({
    where: {
      userId_roleId: {
        userId,
        roleId: role.id,
      },
    },
  });

  if (existingUserRole) {
    const updatedUser = await getUserById(userId);
    return { user: updatedUser, alreadyAssigned: true };
  }

  await prisma.userRole.create({
    data: {
      userId,
      roleId: role.id,
    },
  });

  const updatedUser = await getUserById(userId);
  return { user: updatedUser, alreadyAssigned: false };
};

/**
 * Remove a role from a user. Prevents removing final Admin role if only 1 Admin exists in system.
 */
export const removeUserRole = async (userId: string, roleIdentifier: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { userRoles: { include: { role: true } } },
  });

  if (!user) {
    return { error: 'USER_NOT_FOUND' };
  }

  const role = await prisma.role.findFirst({
    where: {
      OR: [
        { id: roleIdentifier },
        { name: { equals: roleIdentifier, mode: 'insensitive' } },
      ],
    },
  });

  if (!role) {
    return { error: 'INVALID_ROLE' };
  }

  const existingUserRole = await prisma.userRole.findUnique({
    where: {
      userId_roleId: {
        userId,
        roleId: role.id,
      },
    },
  });

  if (!existingUserRole) {
    return { error: 'ROLE_ASSIGNMENT_NOT_FOUND' };
  }

  // Check Admin lockout protection
  if (role.name === 'Admin') {
    const adminCount = await prisma.userRole.count({
      where: {
        role: { name: 'Admin' },
      },
    });

    if (adminCount <= 1) {
      return { error: 'LAST_ADMIN_PROTECTION' };
    }
  }

  await prisma.userRole.delete({
    where: {
      id: existingUserRole.id,
    },
  });

  const updatedUser = await getUserById(userId);
  return { user: updatedUser };
};

/**
 * Delete a user safely (with Admin lockout check).
 */
export const deleteUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { userRoles: { include: { role: true } } },
  });

  if (!user) {
    return false;
  }

  const isAdmin = user.userRoles.some((ur) => ur.role.name === 'Admin');
  if (isAdmin) {
    const adminCount = await prisma.userRole.count({
      where: {
        role: { name: 'Admin' },
      },
    });

    if (adminCount <= 1) {
      return { error: 'LAST_ADMIN_PROTECTION' };
    }
  }

  await prisma.user.delete({
    where: { id: userId },
  });

  return true;
};
