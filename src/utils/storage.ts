export function getToken(): string | null {
  return localStorage.getItem('jwt_token');
}

export function setToken(token: string): void {
  localStorage.setItem('jwt_token', token);
}

export function clearToken(): void {
  localStorage.removeItem('jwt_token');
}
