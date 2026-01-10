<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4 text-gray-800">修改密码</h2>
        <form @submit.prevent="handleChangePassword" class="space-y-4">
          <div>
            <label for="current-password" class="block text-sm font-medium text-gray-700 mb-1">当前密码</label>
            <input
              id="current-password"
              v-model="password.current"
              type="password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label for="new-password" class="block text-sm font-medium text-gray-700 mb-1">新密码</label>
            <input
              id="new-password"
              v-model="password.new"
              type="password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label for="confirm-password" class="block text-sm font-medium text-gray-700 mb-1">确认新密码</label>
            <input
              id="confirm-password"
              v-model="password.confirm"
              type="password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div v-if="passwordError" class="mb-4 text-red-600 text-sm text-center">{{ passwordError }}</div>
          <div v-if="passwordSuccess" class="mb-4 text-green-600 text-sm text-center">{{ passwordSuccess }}</div>
          <div class="flex justify-end">
            <button
              type="submit"
              :disabled="submitting"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ submitting ? '修改中...' : '修改密码' }}
            </button>
          </div>
        </form>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold mb-4 text-gray-800">添加新店铺</h2>
        <form @submit.prevent="handleAddStore" class="flex gap-4 mb-6">
          <div class="flex-1">
            <label for="store-name" class="block text-sm font-medium text-gray-700 mb-1">店铺名称</label>
            <input
              id="store-name"
              v-model="newStore.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div class="flex items-end">
            <button
              type="submit"
              :disabled="storeStore.loading"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ storeStore.loading ? '添加中...' : '添加' }}
            </button>
          </div>
        </form>

        <h2 class="text-xl font-semibold mb-4 text-gray-800">店铺列表</h2>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-100">
                <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">ID</th>
                <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">名称</th>
                <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">创建时间</th>
                <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="store in storeStore.stores" :key="store.id">
                <td class="px-4 py-2 border-b">{{ store.id }}</td>
                <td class="px-4 py-2 border-b">{{ store.name }}</td>
                <td class="px-4 py-2 border-b">{{ store.created_at }}</td>
                <td class="px-4 py-2 border-b">
                  <button @click="handleDeleteStore(store.id)" class="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-if="authStore.isAdmin" class="bg-white rounded-lg shadow-md p-6 mt-6">
      <h2 class="text-xl font-semibold mb-4 text-gray-800">添加新用户</h2>
      <form @submit.prevent="handleAddUser" class="flex gap-4 mb-6">
        <div class="flex-1">
          <label for="user-username" class="block text-sm font-medium text-gray-700 mb-1">用户名</label>
          <input
            id="user-username"
            v-model="newUser.username"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="flex-1">
          <label for="user-password" class="block text-sm font-medium text-gray-700 mb-1">密码</label>
          <input
            id="user-password"
            v-model="newUser.password"
            type="password"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="w-32">
          <label for="user-role" class="block text-sm font-medium text-gray-700 mb-1">角色</label>
          <select
            id="user-role"
            v-model="newUser.role"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="user">普通用户</option>
            <option value="admin">管理员</option>
          </select>
        </div>
        <div class="flex items-end">
          <button
            type="submit"
            :disabled="userStore.submitting"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ userStore.submitting ? '添加中...' : '添加' }}
          </button>
        </div>
      </form>

      <h2 class="text-xl font-semibold mb-4 text-gray-800">用户列表</h2>
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-100">
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">ID</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">用户名</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">角色</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">创建时间</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in userStore.users" :key="user.id">
              <td class="px-4 py-2 border-b">{{ user.id }}</td>
              <td class="px-4 py-2 border-b">{{ user.username }}</td>
              <td class="px-4 py-2 border-b">{{ user.role === 'admin' ? '管理员' : '普通用户' }}</td>
              <td class="px-4 py-2 border-b">{{ user.created_at }}</td>
              <td class="px-4 py-2 border-b">
                <span v-if="user.id === 1" class="text-gray-400 text-sm">不可删除</span>
                <button
                  v-else
                  @click="handleDeleteUser(user.id)"
                  :disabled="userStore.submitting"
                  class="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useStoreStore } from '../stores/store';
import { useUserStore } from '../stores/users';
import { changePassword } from '../api/auth';

const authStore = useAuthStore();
const storeStore = useStoreStore();
const userStore = useUserStore();

const password = ref({ current: '', new: '', confirm: '' });
const passwordError = ref('');
const passwordSuccess = ref('');
const newStore = ref({ name: '' });
const newUser = ref({ username: '', password: '', role: 'user' });
const submitting = ref(false);

async function handleChangePassword() {
  passwordError.value = '';
  passwordSuccess.value = '';

  if (password.value.new !== password.value.confirm) {
    passwordError.value = '两次输入的密码不一致';
    return;
  }

  if (password.value.new.length < 3) {
    passwordError.value = '新密码长度至少3个字符';
    return;
  }

  submitting.value = true;
  try {
    const data = await changePassword(password.value.current, password.value.new);

    if (data.message === '密码修改成功') {
      passwordSuccess.value = '密码修改成功';
      password.value = { current: '', new: '', confirm: '' };
    } else {
      passwordError.value = data.error || '修改失败';
    }
  } catch (error) {
    console.error('修改密码失败:', error);
    passwordError.value = '修改失败，请稍后重试';
  } finally {
    submitting.value = false;
  }
}

async function handleAddStore() {
  if (!newStore.value.name) {
    alert('请填写店铺名称');
    return;
  }

  const success = await storeStore.addNewStore(newStore.value.name);

  if (success) {
    newStore.value.name = '';
  } else {
    alert('添加失败');
  }
}

async function handleDeleteStore(id: number) {
  if (id === 1) {
    alert('默认店铺不能删除');
    return;
  }
  if (!confirm('确定要删除这个店铺吗？')) return;

  const success = await storeStore.deleteStoreById(id);

  if (!success) {
    alert('删除失败');
  }
}

async function handleAddUser() {
  if (!newUser.value.username || !newUser.value.password) {
    alert('用户名和密码不能为空');
    return;
  }

  if (newUser.value.password.length < 3) {
    alert('密码长度至少3个字符');
    return;
  }

  const success = await userStore.addNewUser(newUser.value.username, newUser.value.password, newUser.value.role);

  if (success) {
    newUser.value = { username: '', password: '', role: 'user' };
    alert('用户添加成功！');
  } else {
    alert('添加失败');
  }
}

async function handleDeleteUser(id: number) {
  if (!confirm('确定要删除这个用户吗？')) return;

  const success = await userStore.deleteUserById(id);

  if (success) {
    alert('用户删除成功！');
  } else {
    alert('删除失败');
  }
}

onMounted(async () => {
  await storeStore.loadStoresList();
  await userStore.loadUsersList();
});
</script>
