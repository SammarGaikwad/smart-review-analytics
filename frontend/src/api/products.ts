import { apiFetch } from './client';
import { Product } from '../types';
import { MOCK_PRODUCTS } from './mockData';

export async function getProducts(): Promise<Product[]> {
  try {
    const res = await apiFetch<{ success: boolean; data: Product[] }>('/products');
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    return MOCK_PRODUCTS;
  } catch (err) {
    console.warn('[API Warning]: Could not fetch products from backend, using mock fallback.', err);
    return MOCK_PRODUCTS;
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const res = await apiFetch<{ success: boolean; data: Product }>(`/products/${id}`);
    if (res.success && res.data) {
      return res.data;
    }
    return MOCK_PRODUCTS.find(p => p.id === id) || null;
  } catch (err) {
    return MOCK_PRODUCTS.find(p => p.id === id) || null;
  }
}
