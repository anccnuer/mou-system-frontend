import { defineStore } from 'pinia';
import { ref } from 'vue';
import { loadStores, addStore, deleteStore } from '../api/stores';
import type { Store } from '../types';

export const useStoreStore = defineStore('store', () => {
  const stores = ref<Store[]>([]);
  const currentStoreId = ref<number>(1);
  const loading = ref(false);

  async function loadStoresList() {
    loading.value = true;
    try {
      const data = await loadStores();
      stores.value = data;
    } catch (error) {
      console.error('加载店铺列表失败:', error);
    } finally {
      loading.value = false;
    }
  }

  async function addNewStore(name: string) {
    try {
      const response = await addStore(name);
      if (response.ok) {
        await loadStoresList();
        return true;
      }
      return false;
    } catch (error) {
      console.error('添加店铺失败:', error);
      return false;
    }
  }

  async function deleteStoreById(id: number) {
    try {
      const response = await deleteStore(id);
      if (!response.error) {
        await loadStoresList();
        return true;
      }
      return false;
    } catch (error) {
      console.error('删除店铺失败:', error);
      return false;
    }
  }

  function setCurrentStoreId(id: number) {
    currentStoreId.value = id;
  }

  function getCurrentStore() {
    return stores.value.find(s => s.id === currentStoreId.value);
  }

  return {
    stores,
    currentStoreId,
    loading,
    loadStoresList,
    addNewStore,
    deleteStoreById,
    setCurrentStoreId,
    getCurrentStore,
  };
});
