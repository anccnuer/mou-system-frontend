import { getApiUrl, getAuthHeaders } from './config.js';

export async function loadIngredients(storeId) {
  const response = await fetch(getApiUrl(`/ingredients-table?store_id=${storeId}`));
  return await response.json();
}

export async function loadIngredientsOptions(storeId) {
  const response = await fetch(getApiUrl(`/ingredients-options?store_id=${storeId}`));
  return await response.json();
}

export async function getIngredient(id) {
  const response = await fetch(getApiUrl(`/ingredients/${id}`));
  return await response.json();
}

export async function addIngredient(data) {
  const response = await fetch(getApiUrl('/ingredients'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(data)
  });
  return response;
}

export async function updateIngredient(id, data) {
  const response = await fetch(getApiUrl(`/ingredients/${id}`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(data)
  });
  return response;
}

export async function deleteIngredient(id) {
  const response = await fetch(getApiUrl(`/ingredients/${id}`), {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return response;
}
