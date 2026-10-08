import { Request, Response } from 'express';
import { getCustomerInsights } from '../services/customer.service';

export const getInsights = async (req: Request, res: Response) => {
  try {
    const insights = await getCustomerInsights();
    res.status(200).json({ success: true, data: insights });
  } catch (error: any) {
    console.error('Customer insights controller error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch customer insights' });
  }
};
