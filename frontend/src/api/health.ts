import { apiFetch } from './client';
import { ServiceHealthStatus } from '../types';

export async function checkBackendHealth(): Promise<ServiceHealthStatus> {
  try {
    const data = await apiFetch<any>('/health');
    return {
      online: true,
      message: 'Node.js Express API Online',
      details: data,
    };
  } catch (err: any) {
    return {
      online: false,
      message: err.message || 'Backend unavailable',
    };
  }
}

export async function checkAnalyticsHealth(): Promise<ServiceHealthStatus> {
  try {
    const data = await apiFetch<any>('/analytics-api/health');
    return {
      online: true,
      message: 'Python FastAPI Engine Online (VADER NLP)',
      details: data,
    };
  } catch (err: any) {
    return {
      online: false,
      message: err.message || 'Analytics engine unavailable',
    };
  }
}
