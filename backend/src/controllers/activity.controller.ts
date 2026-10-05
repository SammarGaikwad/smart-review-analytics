import { Request, Response } from 'express';
import { recordActivityEvent } from '../services/activity.service';

export const recordActivityHandler = async (req: Request, res: Response) => {
  try {
    const { userId, eventType, path, metadata } = req.body;

    if (!eventType || typeof eventType !== 'string' || !eventType.trim()) {
      return res.status(400).json({
        success: false,
        message: 'eventType is required and must be a non-empty string',
      });
    }

    const event = await recordActivityEvent({
      userId: userId ? String(userId) : undefined,
      eventType: eventType.trim(),
      path: path ? String(path) : undefined,
      metadata,
    });

    res.status(201).json({
      success: true,
      message: 'Activity event recorded successfully',
      data: event,
    });
  } catch (error: any) {
    console.error('Record Activity Handler error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record activity event',
      error: error.message,
    });
  }
};
