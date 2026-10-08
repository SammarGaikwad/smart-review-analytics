import { apiFetch } from './client';

export async function getClickstreamAnalytics() {
  const res = await apiFetch<any>('/analytics/clickstream');
  return res.data;
}

export async function getAbTestResults() {
  const res = await apiFetch<any>('/analytics/ab-test');
  return res.data;
}

export async function getSurveyAnalytics() {
  const res = await apiFetch<any>('/analytics/survey');
  return res.data;
}

export async function runWebCrawl() {
  const res = await apiFetch<any>('/analytics/crawl', { method: 'POST' });
  return res.data;
}

export async function getWebIndex() {
  const res = await apiFetch<any>('/analytics/index');
  return res.data;
}

export async function getWebRanking() {
  const res = await apiFetch<any>('/analytics/ranking');
  return res.data;
}

export async function getSeoAnalysis() {
  const res = await apiFetch<any>('/analytics/seo');
  return res.data;
}

export async function searchWeb(query: string) {
  const res = await apiFetch<any>('/analytics/search', {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
  return res.data;
}
