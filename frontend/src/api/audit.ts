import { apiClient } from './client';
import { AuditLogItem, PaginationMeta } from '../types';

export interface AuditLogsResponse {
  items: AuditLogItem[];
  pagination: PaginationMeta;
}

export async function getAuditLogsList(params: { page?: number; limit?: number; action?: string; resource?: string } = {}): Promise<AuditLogsResponse> {
  const query = new URLSearchParams();
  if (params.page) query.append('page', String(params.page));
  if (params.limit) query.append('limit', String(params.limit));
  if (params.action && params.action !== 'ALL') query.append('action', params.action);
  if (params.resource && params.resource !== 'ALL') query.append('resource', params.resource);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  const res = await apiClient.get(`/audit-logs${queryString}`);
  return res.data;
}
