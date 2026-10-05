import { Request, Response } from 'express';
import { performReviewClustering } from '../services/clustering.service';

export const analyzeClustering = async (req: Request, res: Response) => {
  try {
    const k = req.body?.k ? Number(req.body.k) : 4;

    if (isNaN(k) || k < 1) {
      return res.status(400).json({
        success: false,
        message: 'Parameter k must be a positive integer',
      });
    }

    const result = await performReviewClustering(k);

    res.status(200).json({
      success: true,
      message: 'Review clustering completed successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Clustering analysis error:', error);

    if (error.message === 'No reviews available for clustering') {
      return res.status(400).json({
        success: false,
        message: 'No reviews available for clustering',
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
      message: 'Failed to perform review clustering',
      error: error.message,
    });
  }
};
