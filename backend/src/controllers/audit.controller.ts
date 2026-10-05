import { Request, Response } from 'express';
import { queryAuditLogs, AuditLogQueryOptions } from '../services/audit.service';

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const { page, limit, userId, action, resource, entity, status, startDate, endDate } = req.query;

    // Validate date query parameters if provided
    if (startDate && isNaN(Date.parse(String(startDate)))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid startDate format. Must be a valid ISO 8601 date string.',
      });
    }

    if (endDate && isNaN(Date.parse(String(endDate)))) {
      return res.status(400).json({
        success: false,
        message: 'Invalid endDate format. Must be a valid ISO 8601 date string.',
      });
    }

    const options: AuditLogQueryOptions = {
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      userId: userId ? String(userId) : undefined,
      action: action ? String(action) : undefined,
      resource: resource ? String(resource) : entity ? String(entity) : undefined,
      status: status ? String(status) : undefined,
      startDate: startDate ? String(startDate) : undefined,
      endDate: endDate ? String(endDate) : undefined,
    };

    const result = await queryAuditLogs(options);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[Get Audit Logs Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve audit logs',
      error: error.message,
    });
  }
};
