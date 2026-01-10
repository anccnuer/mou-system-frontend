import { defineStore } from 'pinia';
import { ref } from 'vue';
import { loadUsers, addUser, deleteUser } from '../api/users';
import type { User } from '../types';

export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([]);
  const loading = ref(false);
  const submitting = ref(false);

  async function loadUsersList() {
    loading.value = true;
    try {
      const data = await loadUsers();
      users.value = data;
    } catch (error) {
      console.error('加载用户列表失败:', error);
    } finally {
      loading.value = false;
    }
  }

  async function addNewUser(username: string, password: string, role: string) {
    submitting.value = true;
    try {
      const response = await addUser(username, password, role);
      if (response.ok) {
        await loadUsersList();
        return true;
      }
      return false;
    } catch (error) {
      console.error('添加用户失败:', error);
      return false;
    } finally {
      submitting.value = false;
    }
  }

  async function deleteUserById(id: number) {
    submitting.value = true;
    try {
      const response = await deleteUser(id);
      if (response.ok) {
        await loadUsersList();
        return true;
      }
      return false;
    } catch (error) {
      console.error('删除用户失败:', error);
      return false;
    } finally {
      submitting.value = false;
    }
  }

  return {
    users,
    loading,
    submitting,
    loadUsersList,
    addNewUser,
    deleteUserById,
  };
});
