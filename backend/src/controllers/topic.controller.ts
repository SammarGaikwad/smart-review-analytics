import { Request, Response } from 'express';
import { analyzeReviewTopics } from '../services/topic.service';

export const analyzeTopics = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;

    const result = await analyzeReviewTopics(reviewId);

    res.status(200).json({
      success: true,
      message: 'Topic analysis completed successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Topic analysis error:', error);

    if (error.message === 'Review not found') {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
      });
    }

    if (error.response || error.code === 'ECONNREFUSED' || (error.message && error.message.includes('analytics'))) {
      return res.status(503).json({
        success: false,
        message: 'Analytics service is unavailable',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to analyze topics',
      error: error.message,
    });
  }
};
