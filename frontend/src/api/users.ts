import { apiClient } from './client';
import { UserManagementUser, RoleItem } from '../types';

export async function getUsersList(params: { page?: number; limit?: number; search?: string; role?: string } = {}) {
  const query = new URLSearchParams();
  if (params.page) query.append('page', String(params.page));
  if (params.limit) query.append('limit', String(params.limit));
  if (params.search) query.append('search', params.search);
  if (params.role && params.role !== 'ALL') query.append('role', params.role);

  const queryString = query.toString() ? `?${query.toString()}` : '';
  const res = await apiClient.get(`/users${queryString}`);
  return res.data;
}

export async function getRolesList(): Promise<RoleItem[]> {
  const res = await apiClient.get('/users/roles');
  return res.data;
}

export async function createNewUser(data: { email: string; fullName: string; password: string; role?: string }) {
  const res = await apiClient.post('/users', data);
  return res.data;
}

export async function updateUser(id: string, data: { fullName?: string; email?: string; password?: string; isActive?: boolean }) {
  const res = await apiClient.put(`/users/${id}`, data);
  return res.data;
}

export async function changeUserStatus(id: string, isActive: boolean) {
  const res = await apiClient.patch(`/users/${id}/status`, { isActive });
  return res.data;
}

export async function assignUserRole(userId: string, role: string) {
  const res = await apiClient.post(`/users/${userId}/roles`, { role });
  return res.data;
}

export async function removeUserRole(userId: string, roleId: string) {
  const res = await apiClient.delete(`/users/${userId}/roles/${roleId}`);
  return res.data;
}

export async function deleteUser(id: string) {
  const res = await apiClient.delete(`/users/${id}`);
  return res.data;
}
