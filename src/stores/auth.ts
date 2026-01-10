import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { checkAuth, login, logout } from '../api/auth';
import { setToken, clearToken } from '../utils/storage';
import type { User } from '../types';

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null);
  const loading = ref(true);
  const loginError = ref('');

  const isAuthenticated = computed(() => currentUser.value !== null);
  const isAdmin = computed(() => currentUser.value?.role === 'admin');

  async function checkAuthState() {
    try {
      const data = await checkAuth();
      if (data.authenticated && data.user) {
        currentUser.value = data.user;
      } else {
        currentUser.value = null;
        clearToken();
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
      currentUser.value = null;
      clearToken();
    } finally {
      loading.value = false;
    }
  }

  async function doLogin(username: string, password: string) {
    loginError.value = '';
    try {
      const data = await login(username, password);
      if (data.token) {
        setToken(data.token);
      }
      if (data.user) {
        currentUser.value = data.user;
      } else {
        throw new Error('No user data returned');
      }
    } catch (error: any) {
      console.error('Login error details:', error);
      loginError.value = `登录失败: ${error.message || '请稍后重试'}`;
      throw error;
    }
  }

  async function doLogout() {
    await logout();
    clearToken();
    currentUser.value = null;
  }

  return {
    currentUser,
    loading,
    loginError,
    isAuthenticated,
    isAdmin,
    checkAuthState,
    doLogin,
    doLogout,
  };
});
