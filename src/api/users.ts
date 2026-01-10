import { api } from './config';
import type { User, OperationLog, ConsumptionData, ApiResponse } from '../types';

export async function loadUsers(): Promise<User[]> {
  const response = await api.get<User[]>('/users');
  return response.data;
}

export async function addUser(username: string, password: string, role: string): Promise<ApiResponse> {
  const response = await api.post<ApiResponse>('/users', {
    username,
    password,
    role,
  });
  return response.data;
}

export async function deleteUser(id: number): Promise<ApiResponse> {
  const response = await api.delete<ApiResponse>(`/users/${id}`);
  return response.data;
}

export async function loadOperationLogs(storeId: number): Promise<OperationLog[]> {
  const response = await api.get<OperationLog[]>(`/operation-logs?store_id=${storeId}`);
  return response.data;
}

export async function getOperationLog(id: number): Promise<OperationLog> {
  const response = await api.get<OperationLog>(`/operation-logs/${id}`);
  return response.data;
}

export async function revokeOperation(id: number): Promise<ApiResponse> {
  const response = await api.post<ApiResponse>(`/operation-logs/revoke/${id}`);
  return response.data;
}

export async function loadConsumption(year: number, month: number, storeId: number): Promise<ConsumptionData[]> {
  const response = await api.get<ConsumptionData[]>(`/ingredient-consumption?year=${year}&month=${month}&store_id=${storeId}`);
  return response.data;
}
