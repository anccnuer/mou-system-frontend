import { getApiUrl, getAuthHeaders } from './config.js';

export async function loadStores() {
  const response = await fetch(getApiUrl('/stores'));
  return await response.json();
}

export async function addStore(name) {
  const response = await fetch(getApiUrl('/stores'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name })
  });
  return response;
}

export async function deleteStore(id) {
  const response = await fetch(getApiUrl(`/stores/${id}`), {
    method: 'DELETE'
  });
  return await response.json();
}
