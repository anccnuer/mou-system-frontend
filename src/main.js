import Alpine from 'alpinejs';
import { ingredientsComponent } from './components/ingredients.js';
import { dishesComponent } from './components/dishes.js';
import { useDishComponent } from './components/useDish.js';
import { consumptionComponent } from './components/consumption.js';
import { operationLogsComponent } from './components/operationLogs.js';
import { settingsComponent } from './components/settings.js';
import { checkAuth, login, logout } from './api/auth.js';
import { getToken, setToken, clearToken } from './utils/storage.js';
import { loadStores } from './api/stores.js';

Alpine.data('ingredients', ingredientsComponent);
Alpine.data('dishes', dishesComponent);
Alpine.data('useDish', useDishComponent);
Alpine.data('consumption', consumptionComponent);
Alpine.data('operationLogs', operationLogsComponent);
Alpine.data('settings', settingsComponent);

Alpine.data('app', () => ({
  currentUser: null,
  currentStoreId: 1,
  stores: [],
  activeTab: 'ingredients',
  loginError: '',
  loading: true,

  init() {
    this.initApp();
  },

  async initApp() {
    await this.checkAuth();
  },

  async checkAuth() {
    try {
      const data = await checkAuth();
      if (data.authenticated) {
        this.currentUser = data.user;
        await this.loadStores();
      } else {
        this.currentUser = null;
        clearToken();
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
      this.currentUser = null;
      clearToken();
    } finally {
      this.loading = false;
    }
  },

  async doLogin(username, password) {
    this.loginError = '';
    try {
      const data = await login(username, password);
      console.log('Login response:', data);
      if (data.token) {
        setToken(data.token);
        console.log('Token set successfully');
      }
      if (data.user) {
        console.log('User data received:', data.user);
        this.currentUser = data.user;
        await this.loadStores();
        console.log('Stores loaded');
      } else {
        throw new Error('No user data returned');
      }
    } catch (error) {
      console.error('Login error details:', error);
      this.loginError = `登录失败: ${error.message || '请稍后重试'}`;
    } finally {
      // 确保登录成功或失败后都更新loading状态
      this.loading = false;
      console.log('Final state - loading:', this.loading, 'currentUser:', this.currentUser);
    }
  },

  async doLogout() {
    await logout();
    clearToken();
    // 直接赋值更新响应式数据
    this.currentUser = null;
    this.activeTab = 'ingredients';
  },

  async loadStores() {
    try {
      const data = await loadStores();
      this.stores = data;
    } catch (error) {
      console.error('加载店铺列表失败:', error);
    }
  },

  switchTab(tabName) {
    this.activeTab = tabName;
  },

  switchStore() {
    const selector = document.getElementById('store-selector');
    this.currentStoreId = parseInt(selector.value);
    
    // 通知所有组件重新加载数据
    this.$dispatch('store-changed', { storeId: this.currentStoreId });
  }
}));

Alpine.start();
