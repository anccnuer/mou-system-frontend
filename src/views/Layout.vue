<template>
  <div class="bg-gray-50 min-h-screen">
    <div v-if="authStore.loading" class="fixed inset-0 bg-white flex items-center justify-center z-50">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        <p class="mt-4 text-gray-600">加载中...</p>
      </div>
    </div>

    <div v-if="appLoading" class="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
      <div class="bg-white rounded-lg shadow-xl p-6 flex items-center gap-4">
        <div class="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
        <span class="text-gray-700">处理中...</span>
      </div>
    </div>

    <div v-if="!authStore.loading && authStore.currentUser" class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-8">
        <div class="flex items-center gap-4">
          <label for="store-selector" class="text-gray-700 font-medium">选择店铺：</label>
          <select
            id="store-selector"
            v-model="storeStore.currentStoreId"
            @change="handleStoreChange"
            class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option v-for="store in storeStore.stores" :key="store.id" :value="store.id">
              {{ store.name }}
            </option>
          </select>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-gray-700">欢迎，<span class="font-medium">{{ authStore.currentUser?.username }}</span></span>
          <button @click="handleLogout" class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
            退出登录
          </button>
        </div>
      </div>

      <div class="flex justify-center mb-8">
        <div class="inline-flex rounded-md shadow-sm" role="group">
          <router-link
            v-for="tab in tabs"
            :key="tab.name"
            :to="tab.path"
            class="tab-btn px-6 py-3 text-sm font-medium border hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700"
            :class="[
              isActiveTab(tab.name) ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-gray-900 border-gray-200',
              isFirstTab(tab) ? 'rounded-l-lg' : '',
              isLastTab(tab) ? 'rounded-r-lg' : '',
              !isFirstTab(tab) && !isLastTab(tab) ? 'border-t border-b' : ''
            ]"
          >
            {{ tab.label }}
          </router-link>
        </div>
      </div>

      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useStoreStore } from '../stores/store';
import { useIngredientStore } from '../stores/ingredients';
import { useDishStore } from '../stores/dishes';
import { useOperationStore } from '../stores/operations';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const storeStore = useStoreStore();
const ingredientStore = useIngredientStore();
const dishStore = useDishStore();
const operationStore = useOperationStore();

const appLoading = ref(false);

const tabs = [
  { name: 'Ingredients', label: '食材管理', path: '/ingredients' },
  { name: 'Dishes', label: '菜品管理', path: '/dishes' },
  { name: 'UseDish', label: '菜品使用', path: '/use-dish' },
  { name: 'Consumption', label: '消耗统计', path: '/consumption' },
  { name: 'OperationLogs', label: '操作记录', path: '/operation-logs' },
  { name: 'Settings', label: '系统设置', path: '/settings' },
];

function isActiveTab(name: string): boolean {
  return route.name === name;
}

function isFirstTab(tab: any): boolean {
  return tabs.indexOf(tab) === 0;
}

function isLastTab(tab: any): boolean {
  return tabs.indexOf(tab) === tabs.length - 1;
}

function handleStoreChange() {
  const storeId = storeStore.currentStoreId;
  ingredientStore.loadIngredientsList(storeId);
  dishStore.loadDishesList(storeId);
  operationStore.loadOperationLogsList(storeId);
}

async function handleLogout() {
  await authStore.doLogout();
  router.push('/login');
}

onMounted(async () => {
  await authStore.checkAuthState();
  if (authStore.isAuthenticated) {
    await storeStore.loadStoresList();
    handleStoreChange();
  }
});
</script>
