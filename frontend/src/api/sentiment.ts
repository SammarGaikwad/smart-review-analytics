import { apiFetch } from './client';
import { SentimentResult } from '../types';

export interface SentimentAnalysisResponse {
  success: boolean;
  message: string;
  data: SentimentResult;
}

export async function analyzeReviewSentiment(reviewId: string): Promise<SentimentResult> {
  const res = await apiFetch<SentimentAnalysisResponse>(`/sentiment/${reviewId}/analyze`, {
    method: 'POST',
  });
  
  if (res.success && res.data) {
    return res.data;
  }
  
  throw new Error(res.message || 'Sentiment analysis failed');
}
