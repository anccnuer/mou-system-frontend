import { api } from './config';
import type { Ingredient, ApiResponse, BatchAddResult, ExcelIngredient } from '../types';

export async function loadIngredients(storeId: number): Promise<Ingredient[]> {
  const response = await api.get<Ingredient[]>(`/ingredients-table?store_id=${storeId}`);
  return response.data;
}

export async function loadIngredientsOptions(storeId: number): Promise<Ingredient[]> {
  const response = await api.get<Ingredient[]>(`/ingredients-options?store_id=${storeId}`);
  return response.data;
}

export async function getIngredient(id: number): Promise<Ingredient> {
  const response = await api.get<Ingredient>(`/ingredients/${id}`);
  return response.data;
}

export async function addIngredient(data: { name: string; quantity: number; unit: string; store_id: number }): Promise<ApiResponse> {
  const response = await api.post<ApiResponse>('/ingredients', data);
  return response.data;
}

export async function updateIngredient(id: number, data: { quantity: number; unit: string }): Promise<ApiResponse> {
  const response = await api.put<ApiResponse>(`/ingredients/${id}`, data);
  return response.data;
}

export async function deleteIngredient(id: number): Promise<ApiResponse> {
  const response = await api.delete<ApiResponse>(`/ingredients/${id}`);
  return response.data;
}

export async function batchAddIngredients(data: { ingredients: ExcelIngredient[]; store_id: number }, batchSize: number = 50): Promise<BatchAddResult> {
  const response = await api.post<BatchAddResult>(`/ingredients/batch?batch_size=${batchSize}`, data);
  return response.data;
}
