// Centralized API Client Configuration for Smart Review Analytics Platform

if (!import.meta.env.VITE_API_URL) {
  throw new Error('FATAL: VITE_API_URL environment variable is missing. Please configure it in your environment (e.g., .env).');
}
export const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');

  let formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (!formattedEndpoint.startsWith('/api')) {
    formattedEndpoint = `/api${formattedEndpoint}`;
  }

  const url = `${API_BASE_URL}${formattedEndpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      // Clear token on 401 unauthorized response (expired or invalid token)
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || data.error || `HTTP Error ${response.status}`);
    }

    return data as T;
  } catch (error: any) {
    throw error;
  }
}

export const apiClient = {
  get: <T = any>(endpoint: string, options: RequestInit = {}) =>
    apiFetch<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, data?: any, options: RequestInit = {}) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T = any>(endpoint: string, data?: any, options: RequestInit = {}) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T = any>(endpoint: string, data?: any, options: RequestInit = {}) =>
    apiFetch<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T = any>(endpoint: string, options: RequestInit = {}) =>
    apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};
