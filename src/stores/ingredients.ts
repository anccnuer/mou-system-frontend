import { defineStore } from 'pinia';
import { ref } from 'vue';
import { loadIngredients, addIngredient, updateIngredient, deleteIngredient, batchAddIngredients } from '../api/ingredients';
import type { Ingredient, ExcelIngredient, BatchAddResult } from '../types';

export const useIngredientStore = defineStore('ingredient', () => {
  const ingredients = ref<Ingredient[]>([]);
  const loading = ref(false);
  const submitting = ref(false);

  async function loadIngredientsList(storeId: number) {
    loading.value = true;
    try {
      const data = await loadIngredients(storeId);
      ingredients.value = data.sort((a, b) => a.quantity - b.quantity);
    } catch (error) {
      console.error('加载食材列表失败:', error);
    } finally {
      loading.value = false;
    }
  }

  async function addNewIngredient(data: { name: string; quantity: number; unit: string; store_id: number }) {
    submitting.value = true;
    try {
      const response = await addIngredient(data);
      if (!response.error) {
        await loadIngredientsList(data.store_id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('添加食材失败:', error);
      return false;
    } finally {
      submitting.value = false;
    }
  }

  async function updateIngredientById(id: number, data: { quantity: number; unit: string }) {
    submitting.value = true;
    try {
      const response = await updateIngredient(id, data);
      if (!response.error) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('更新食材失败:', error);
      return false;
    } finally {
      submitting.value = false;
    }
  }

  async function deleteIngredientById(id: number, storeId: number) {
    submitting.value = true;
    try {
      const response = await deleteIngredient(id);
      if (!response.error) {
        await loadIngredientsList(storeId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('删除食材失败:', error);
      return false;
    } finally {
      submitting.value = false;
    }
  }

  async function batchAdd(data: { ingredients: ExcelIngredient[]; store_id: number }): Promise<BatchAddResult> {
    submitting.value = true;
    try {
      const result = await batchAddIngredients(data);
      await loadIngredientsList(data.store_id);
      return result;
    } catch (error) {
      console.error('批量添加失败:', error);
      throw error;
    } finally {
      submitting.value = false;
    }
  }

  return {
    ingredients,
    loading,
    submitting,
    loadIngredientsList,
    addNewIngredient,
    updateIngredientById,
    deleteIngredientById,
    batchAdd,
  };
});
