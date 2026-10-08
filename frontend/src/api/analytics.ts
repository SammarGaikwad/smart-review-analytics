import { apiClient } from './client';
import { WebAnalyticsResult, NetworkAnalyticsResult } from '../types';

export async function getWebAnalytics(period: string = 'all'): Promise<WebAnalyticsResult> {
  const res = await apiClient.get(`/analytics/web?period=${period}`);
  return res.data;
}

export async function getNetworkAnalytics(): Promise<NetworkAnalyticsResult> {
  const res = await apiClient.get('/analytics/network');
  return res.data;
}

export async function getTemporalNetworkAnalytics(): Promise<any> {
  const res = await apiClient.get('/analytics/network/temporal');
  return res.data;
}

export async function analyzeSentiment(reviewId: string) {
  const res = await apiClient.post(`/sentiment/${reviewId}/analyze`);
  return res.data;
}

export async function analyzeKeywords(reviewId: string) {
  const res = await apiClient.post(`/keywords/${reviewId}/analyze`);
  return res.data;
}

export async function compareKeywords(text: string, referenceKeywords: string[], topK: number = 10) {
  const res = await apiClient.post('/keywords/compare', { text, referenceKeywords, topK });
  return res.data;
}

export async function benchmarkKeywords() {
  const res = await apiClient.post('/keywords/benchmark');
  return res.data;
}

export async function analyzeTopics(reviewId: string) {
  const res = await apiClient.post(`/topics/${reviewId}/analyze`);
  return res.data;
}

export async function performClustering(k: number = 4) {
  const res = await apiClient.post('/clustering/analyze', { k });
  return res.data;
}
