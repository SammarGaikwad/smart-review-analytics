import prisma from '../config/database';

export interface CreateAuditLogInput {
  userId?: string | null;
  userEmail?: string | null;
  action: string;
  resource: string;
  ipAddress?: string | null;
  status?: string;
}

export interface AuditLogQueryOptions {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  resource?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface AuditLogPaginationResult {
  items: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Safely creates an audit log entry in PostgreSQL.
 * Non-blocking error handling to ensure business transactions are never broken by audit logging issues.
 */
export const createAuditLog = async (input: CreateAuditLogInput) => {
  try {
    const auditLog = await prisma.auditLog.create({
      data: {
        userId: input.userId || null,
        userEmail: input.userEmail || null,
        action: input.action,
        resource: input.resource,
        ipAddress: input.ipAddress || null,
        status: input.status || 'SUCCESS',
      },
    });
    return auditLog;
  } catch (error: any) {
    console.error('[Audit Logging Warning]: Failed to record audit log:', error.message);
    return null;
  }
};

/**
 * Queries audit logs with pagination, filtering, and descending timestamp ordering.
 */
export const queryAuditLogs = async (
  options: AuditLogQueryOptions
): Promise<AuditLogPaginationResult> => {
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(options.limit) || 20));
  const skip = (page - 1) * limit;

  const where: any = {};

  if (options.userId) {
    where.userId = options.userId;
  }

  if (options.action) {
    where.action = {
      equals: options.action,
      mode: 'insensitive',
    };
  }

  if (options.resource) {
    where.resource = {
      equals: options.resource,
      mode: 'insensitive',
    };
  }

  if (options.status) {
    where.status = {
      equals: options.status,
      mode: 'insensitive',
    };
  }

  if (options.startDate || options.endDate) {
    where.timestamp = {};
    if (options.startDate) {
      where.timestamp.gte = new Date(options.startDate);
    }
    if (options.endDate) {
      where.timestamp.lte = new Date(options.endDate);
    }
  }

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        timestamp: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    }),
    prisma.auditLog.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
};
