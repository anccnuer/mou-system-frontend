import type { User } from '../types';

export function getToken(): string | null {
  return localStorage.getItem('jwt_token');
}

export function setToken(token: string): void {
  localStorage.setItem('jwt_token', token);
}

export function clearToken(): void {
  localStorage.removeItem('jwt_token');
}

export function getUser(): User | null {
  const userStr = localStorage.getItem('user_info');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
}

export function setUser(user: User): void {
  localStorage.setItem('user_info', JSON.stringify(user));
}

export function clearUser(): void {
  localStorage.removeItem('user_info');
}
