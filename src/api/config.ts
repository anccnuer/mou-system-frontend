import axios, { type InternalAxiosRequestConfig } from 'axios';
import { useLoadingStore } from '../stores/loading';

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  skipLoading?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.海里家里.top';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: CustomAxiosRequestConfig) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (!config.skipLoading) {
      const loadingStore = useLoadingStore();
      loadingStore.showLoading();
    }

    return config;
  },
  (error) => {
    const loadingStore = useLoadingStore();
    loadingStore.hideLoading();
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    const config = response.config as CustomAxiosRequestConfig;
    if (!config.skipLoading) {
      const loadingStore = useLoadingStore();
      loadingStore.hideLoading();
    }
    return response;
  },
  (error) => {
    const config = error.config as CustomAxiosRequestConfig;
    if (!config?.skipLoading) {
      const loadingStore = useLoadingStore();
      loadingStore.hideLoading();
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('jwt_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export function getApiUrl(path: string): string {
  return API_BASE_URL + path;
}
