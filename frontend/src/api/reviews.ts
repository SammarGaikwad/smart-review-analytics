import { apiFetch } from './client';
import { Review } from '../types';
import { MOCK_REVIEWS } from './mockData';

export async function getReviews(): Promise<Review[]> {
  try {
    const res = await apiFetch<{ success: boolean; data: Review[] }>('/reviews');
    if (res.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data;
    }
    return MOCK_REVIEWS;
  } catch (err) {
    console.warn('[API Warning]: Could not fetch reviews from backend, using mock fallback.', err);
    return MOCK_REVIEWS;
  }
}

export async function getReviewById(id: string): Promise<Review | null> {
  try {
    const res = await apiFetch<{ success: boolean; data: Review }>(`/reviews/${id}`);
    if (res.success && res.data) {
      return res.data;
    }
    return MOCK_REVIEWS.find(r => r.id === id) || null;
  } catch (err) {
    return MOCK_REVIEWS.find(r => r.id === id) || null;
  }
}

export async function getReviewsByProduct(productId: string): Promise<Review[]> {
  try {
    const res = await apiFetch<{ success: boolean; data: Review[] }>(`/products/${productId}/reviews`);
    if (res.success && Array.isArray(res.data)) {
      return res.data;
    }
    return MOCK_REVIEWS.filter(r => r.productId === productId);
  } catch (err) {
    return MOCK_REVIEWS.filter(r => r.productId === productId);
  }
}

export async function createReview(data: {
  domainId: string;
  productId: string;
  reviewText: string;
  rating: number;
  source?: string;
}): Promise<Review> {
  const res = await apiFetch<{ success: boolean; data: Review }>('/reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function deleteReview(id: string): Promise<boolean> {
  try {
    const res = await apiFetch<{ success: boolean }>(`/reviews/${id}`, {
      method: 'DELETE',
    });
    return res.success;
  } catch (err) {
    console.error('Delete review error:', err);
    return false;
  }
}
