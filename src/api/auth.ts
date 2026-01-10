import { api } from './config';
import type { AuthResponse, LoginResponse } from '../types';

export async function checkAuth(): Promise<AuthResponse> {
  try {
    const response = await api.get<AuthResponse>('/auth/me');
    return response.data;
  } catch (error) {
    console.error('检查认证状态失败:', error);
    return { authenticated: false };
  }
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', {
    username,
    password,
  });
  return response.data;
}

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    console.error('退出登录请求失败:', error);
  }
}

export async function changePassword(oldPassword: string, newPassword: string): Promise<{ message?: string; error?: string }> {
  const response = await api.post('/change-password', {
    oldPassword,
    newPassword,
  });
  return response.data;
}
