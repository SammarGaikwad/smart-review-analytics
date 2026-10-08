import { apiFetch } from './client';
import { Product } from '../types';

export async function getProducts(): Promise<Product[]> {
  try {
    const res = await apiFetch<{ success: boolean; data: Product[] }>('/products');
    if (res.success && Array.isArray(res.data)) {
      return res.data;
    }
    return [];
  } catch (err) {
    throw err;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const res = await apiFetch<{ success: boolean; data: Product }>(`/products/${id}`);
    if (res.success && res.data) {
      return res.data;
    }
    return null;
  } catch (err) {
    throw err;
  }
}
