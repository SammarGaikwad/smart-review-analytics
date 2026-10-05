import { Request, Response } from 'express';
import { getWebAnalytics, WebAnalyticsParams } from '../services/webAnalytics.service';

export const getWebAnalyticsHandler = async (req: Request, res: Response) => {
  try {
    const { period, domainId, source, startDate, endDate } = req.query;

    // Validate period parameter
    let validatedPeriod: 'day' | 'week' | 'month' = 'day';
    if (period) {
      const periodStr = String(period).toLowerCase();
      if (!['day', 'week', 'month'].includes(periodStr)) {
        return res.status(400).json({
          success: false,
          message: "Invalid period parameter. Must be one of: 'day', 'week', 'month'",
        });
      }
      validatedPeriod = periodStr as 'day' | 'week' | 'month';
    }

    // Validate startDate format
    if (startDate) {
      const start = new Date(String(startDate));
      if (isNaN(start.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid startDate parameter. Must be a valid date string.',
        });
      }
    }

    // Validate endDate format
    if (endDate) {
      const end = new Date(String(endDate));
      if (isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid endDate parameter. Must be a valid date string.',
        });
      }
    }

    const params: WebAnalyticsParams = {
      period: validatedPeriod,
      domainId: domainId ? String(domainId) : undefined,
      source: source ? String(source) : undefined,
      startDate: startDate ? String(startDate) : undefined,
      endDate: endDate ? String(endDate) : undefined,
    };

    const analyticsData = await getWebAnalytics(params);

    res.status(200).json({
      success: true,
      message: 'Web analytics fetched successfully',
      data: analyticsData,
    });
  } catch (error: any) {
    console.error('Web Analytics handler error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve web analytics',
      error: error.message,
    });
  }
};
