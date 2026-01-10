import { api } from './config';
import type { Dish, DishDetail, ApiResponse, BatchUseResult, ExcelDish } from '../types';

export async function loadDishes(storeId: number): Promise<Dish[]> {
  const response = await api.get<Dish[]>(`/dishes-table?store_id=${storeId}`);
  return response.data;
}

export async function getDish(id: number): Promise<DishDetail> {
  const response = await api.get<DishDetail>(`/dishes/${id}`);
  return response.data;
}

export async function addDish(data: { name: string; ingredients: Array<{ ingredient_id: number; quantity: number }>; store_id: number }): Promise<ApiResponse> {
  const response = await api.post<ApiResponse>('/dishes', data);
  return response.data;
}

export async function deleteDish(id: number): Promise<ApiResponse> {
  const response = await api.delete<ApiResponse>(`/dishes/${id}`);
  return response.data;
}

export async function useDish(id: number, quantity: number, storeId: number): Promise<ApiResponse> {
  const response = await api.post<ApiResponse>(`/dishes/${id}/use?quantity=${quantity}&store_id=${storeId}`);
  return response.data;
}

export async function batchUseDishes(dishes: ExcelDish[], storeId: number): Promise<BatchUseResult> {
  const response = await api.post<BatchUseResult>('/dishes/batch-use', {
    dishes,
    store_id: storeId,
  });
  return response.data;
}
