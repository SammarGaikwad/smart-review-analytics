import { apiFetch } from './client';
import { Domain, Product } from '../types';
import { MOCK_DOMAINS, MOCK_PRODUCTS } from './mockData';

export async function getDomains(): Promise<Domain[]> {
  try {
    const res = await apiFetch<{ success: boolean; data: Domain[] }>('/domains');
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    return MOCK_DOMAINS;
  } catch (err) {
    console.warn('[API Warning]: Could not fetch domains from backend, using mock fallback.', err);
    return MOCK_DOMAINS;
  }
}

export async function getDomainById(id: string): Promise<Domain | null> {
  try {
    const res = await apiFetch<{ success: boolean; data: Domain }>(`/domains/${id}`);
    if (res.success && res.data) {
      return res.data;
    }
    return MOCK_DOMAINS.find(d => d.id === id) || null;
  } catch (err) {
    return MOCK_DOMAINS.find(d => d.id === id) || null;
  }
}

export async function getProductsByDomain(domainId: string): Promise<Product[]> {
  try {
    const res = await apiFetch<{ success: boolean; data: Product[] }>(`/domains/${domainId}/products`);
    if (res.success && Array.isArray(res.data)) {
      return res.data;
    }
    return MOCK_PRODUCTS.filter(p => p.domainId === domainId);
  } catch (err) {
    return MOCK_PRODUCTS.filter(p => p.domainId === domainId);
  }
}
