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

export async function analyzeTextSentiment(text: string): Promise<SentimentResult> {
  const res = await apiFetch<SentimentAnalysisResponse>(`/sentiment/analyze-text`, {
    method: 'POST',
    body: JSON.stringify({ text })
  });
  
  if (res.success && res.data) {
    return res.data;
  }
  
  throw new Error(res.message || 'Sentiment analysis failed');
}

export async function getSentimentModelEvaluation() {
  const res = await apiFetch<any>('/sentiment/models/evaluation');
  if (res.success && res.data) {
    return res.data;
  }
  throw new Error(res.message || 'Failed to get evaluation');
}

export async function predictSentiment(text: string, model: string = 'vader') {
  const res = await apiFetch<any>('/sentiment/predict', {
    method: 'POST',
    body: JSON.stringify({ text, model }),
  });
  if (res.success && res.data) {
    return res.data;
  }
  throw new Error(res.message || 'Failed to predict sentiment');
}

export async function compareSentimentModels(text: string) {
  const res = await apiFetch<any>('/sentiment/predict/compare', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
  if (res.success && res.data) {
    return res.data;
  }
  throw new Error(res.message || 'Failed to compare models');
}
