import { defineStore } from 'pinia';
import { ref } from 'vue';
import { loadDishes, addDish, deleteDish, useDish, batchUseDishes } from '../api/dishes';
import type { Dish, ExcelDish, BatchUseResult } from '../types';

export const useDishStore = defineStore('dish', () => {
  const dishes = ref<Dish[]>([]);
  const loading = ref(false);
  const submitting = ref(false);

  async function loadDishesList(storeId: number) {
    loading.value = true;
    try {
      const data = await loadDishes(storeId);
      dishes.value = data;
    } catch (error) {
      console.error('加载菜品列表失败:', error);
    } finally {
      loading.value = false;
    }
  }

  async function addNewDish(data: { name: string; ingredients: Array<{ ingredient_id: number; quantity: number }>; store_id: number }) {
    submitting.value = true;
    try {
      const response = await addDish(data);
      if (!response.error) {
        await loadDishesList(data.store_id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('添加菜品失败:', error);
      return false;
    } finally {
      submitting.value = false;
    }
  }

  async function deleteDishById(id: number, storeId: number) {
    submitting.value = true;
    try {
      const response = await deleteDish(id);
      if (response.success) {
        await loadDishesList(storeId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('删除菜品失败:', error);
      return false;
    } finally {
      submitting.value = false;
    }
  }

  async function useDishById(id: number, quantity: number, storeId: number) {
    submitting.value = true;
    try {
      const data = await useDish(id, quantity, storeId);
      if (data.error) {
        throw new Error(data.error);
      }
      await loadDishesList(storeId);
      return true;
    } catch (error: any) {
      console.error('使用菜品失败:', error);
      throw error;
    } finally {
      submitting.value = false;
    }
  }

  async function batchUse(data: { dishes: ExcelDish[]; store_id: number }, batchSize: number = 50): Promise<BatchUseResult> {
    submitting.value = true;
    try {
      const result = await batchUseDishes(data.dishes, data.store_id, batchSize);
      await loadDishesList(data.store_id);
      return result;
    } catch (error) {
      console.error('批量使用失败:', error);
      throw error;
    } finally {
      submitting.value = false;
    }
  }

  return {
    dishes,
    loading,
    submitting,
    loadDishesList,
    addNewDish,
    deleteDishById,
    useDishById,
    batchUse,
  };
});
