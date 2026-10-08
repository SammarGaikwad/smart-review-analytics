import { Request, Response } from 'express';
import { getNetworkAnalytics, getTemporalNetworkAnalytics } from '../services/network.service';

export const analyzeNetwork = async (req: Request, res: Response) => {
  try {
    const result = await getNetworkAnalytics();

    res.status(200).json({
      success: true,
      message: 'Network analytics fetched successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Network analytics controller error:', error);

    if (error.response) {
      return res.status(503).json({
        success: false,
        message: 'Analytics service is unavailable',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to compute network analytics',
      error: error.message,
    });
  }
};

export const getTemporalNetwork = async (req: Request, res: Response) => {
  try {
    const result = await getTemporalNetworkAnalytics();
    res.status(200).json({
      success: true,
      message: 'Temporal network fetched successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Temporal network controller error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compute temporal network',
      error: error.message,
    });
  }
};
