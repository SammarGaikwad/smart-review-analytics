import { apiFetch } from './client';
import { Domain, Product } from '../types';

export async function getDomains(): Promise<Domain[]> {
  try {
    const res = await apiFetch<{ success: boolean; data: Domain[] }>('/domains');
    if (res.success && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  } catch (err) {
    throw err;
  }
}

export async function getDomainById(id: string): Promise<Domain | null> {
  try {
    const res = await apiFetch<{ success: boolean; data: Domain }>(`/domains/${id}`);
    if (res.success && res.data) {
      return res.data;
    }
    return null;
  } catch (err) {
    throw err;
  }
}

export async function getProductsByDomain(domainId: string): Promise<Product[]> {
  try {
    const res = await apiFetch<{ success: boolean; data: Product[] }>(`/domains/${domainId}/products`);
    if (res.success && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  } catch (err) {
    throw err;
  }
}
