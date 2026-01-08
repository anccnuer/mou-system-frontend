import { getApiUrl, getAuthHeaders } from './config.js';

export async function loadDishes(storeId) {
  const response = await fetch(getApiUrl(`/dishes-table?store_id=${storeId}`));
  return await response.json();
}

export async function getDish(id) {
  const response = await fetch(getApiUrl(`/dishes/${id}`));
  return await response.json();
}

export async function addDish(data) {
  const response = await fetch(getApiUrl('/dishes'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(data)
  });
  return response;
}

export async function deleteDish(id) {
  const response = await fetch(getApiUrl(`/dishes/${id}`), {
    method: 'DELETE'
  });
  return response;
}

export async function useDish(id, quantity, storeId) {
  const response = await fetch(getApiUrl(`/dishes/${id}/use?quantity=${quantity}&store_id=${storeId}`), {
    method: 'POST',
    headers: getAuthHeaders()
  });
  return await response.json();
}

export async function batchUseDishes(dishes, storeId) {
  const response = await fetch(getApiUrl('/dishes/batch-use'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ dishes, store_id: storeId })
  });
  return await response.json();
}
