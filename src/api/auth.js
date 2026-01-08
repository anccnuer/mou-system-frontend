import { getApiUrl, getAuthHeaders } from './config.js';

export async function checkAuth() {
  try {
    const response = await fetch(getApiUrl('/auth/me'), {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      return { authenticated: false };
    }
    return await response.json();
  } catch (error) {
    console.error('检查认证状态失败:', error);
    return { authenticated: false };
  }
}

export async function login(username, password) {
  const response = await fetch(getApiUrl('/auth/login'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });
  return await response.json();
}

export async function logout() {
  try {
    await fetch(getApiUrl('/auth/logout'), { method: 'POST' });
  } catch (error) {
    console.error('退出登录请求失败:', error);
  }
}

export async function changePassword(oldPassword, newPassword) {
  const response = await fetch(getApiUrl('/change-password'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ oldPassword, newPassword })
  });
  return await response.json();
}
