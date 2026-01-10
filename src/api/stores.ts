import { api } from './config';
import type { Store, ApiResponse } from '../types';

export async function loadStores(): Promise<Store[]> {
  const response = await api.get<Store[]>('/stores');
  return response.data;
}

export async function addStore(name: string): Promise<ApiResponse> {
  const response = await api.post<ApiResponse>('/stores', { name });
  return response.data;
}

export async function deleteStore(id: number): Promise<ApiResponse> {
  const response = await api.delete<ApiResponse>(`/stores/${id}`);
  return response.data;
}
