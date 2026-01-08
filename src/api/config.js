let API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://s.ccnu.link';

export function setApiBaseUrl(url) {
  API_BASE_URL = url.replace(/\/$/, '');
}

export function getApiUrl(path) {
  return API_BASE_URL + path;
}

export function getAuthHeaders() {
  const token = localStorage.getItem('jwt_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}
