<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
      <h2 class="text-xl font-semibold mb-4 text-gray-800 text-center">食材与菜品管理系统</h2>
      <p class="text-gray-600 text-center mb-6">请登录后使用</p>
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label for="username" class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
          <input
            id="username"
            v-model="username"
            type="text"
            required
            @input="clearError"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="mb-6">
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            @input="clearError"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div v-if="authStore.loginError" class="mb-4 text-red-600 text-sm text-center">
          {{ authStore.loginError }}
        </div>
        <div class="flex justify-center">
          <button
            type="submit"
            :disabled="loading"
            class="px-8 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </div>
      </form>
      <p class="text-gray-500 text-center text-sm mt-4">默认账户: admin / 123</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const username = ref('');
const password = ref('');
const loading = ref(false);

function clearError() {
  authStore.loginError = '';
}

async function handleLogin() {
  loading.value = true;
  try {
    await authStore.doLogin(username.value, password.value);
    router.push('/');
  } catch (error) {
  } finally {
    loading.value = false;
  }
}
</script>
