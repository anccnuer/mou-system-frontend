export interface User {
  id: number;
  username: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface Store {
  id: number;
  name: string;
  created_at: string;
}

export interface Ingredient {
  id: number;
  name: string;
  unit: string;
  quantity: number;
  created_at: string;
}

export interface DishIngredient {
  ingredient_id: number;
  quantity: number;
}

export interface Dish {
  id: number;
  name: string;
  created_at: string;
  ingredients?: DishIngredient[];
}

export interface DishDetail extends Dish {
  ingredients: Array<{
    id: number;
    ingredient_id: number;
    quantity: number;
    name: string;
    unit: string;
  }>;
}

export interface OperationLog {
  id: number;
  operation_time: string;
  operation_type: string;
  user_name: string;
  is_revoked: boolean;
  details: string;
}

export interface ConsumptionData {
  ingredient_id: number;
  ingredient_name: string;
  unit: string;
  total_quantity: number;
  use_count: number;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface AuthResponse {
  authenticated: boolean;
  user?: User;
}

export interface ApiResponse<T = any> {
  ok?: boolean;
  success?: boolean;
  error?: string;
  message?: string;
  data?: T;
}

export interface ExcelIngredient {
  name: string;
  unit: string;
  quantity: number;
}

export interface ExcelDish {
  name: string;
  quantity: number;
}

export interface BatchAddResult {
  success: number;
  failed: number;
  errors?: Array<{
    row: number;
    error: string;
  }>;
}

export interface BatchUseResult {
  results: Array<{
    success: boolean;
    error?: string;
    used_ingredients?: Array<{
      ingredient_name: string;
      quantity: number;
    }>;
  }>;
}

export type OperationType =
  | 'ingredient_add'
  | 'ingredient_restock'
  | 'ingredient_edit'
  | 'ingredient_delete'
  | 'ingredient_batch_add'
  | 'dish_use'
  | 'dish_batch_use'
  | 'dish_delete';
