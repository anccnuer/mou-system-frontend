import { getApiUrl, getAuthHeaders } from './config.js';

export async function loadUsers() {
  const response = await fetch(getApiUrl('/users'), {
    headers: getAuthHeaders()
  });
  return await response.json();
}

export async function addUser(username, password, role) {
  const response = await fetch(getApiUrl('/users'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify({ username, password, role })
  });
  return response;
}

export async function deleteUser(id) {
  const response = await fetch(getApiUrl(`/users/${id}`), {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  return response;
}

export async function loadOperationLogs(storeId) {
  const response = await fetch(getApiUrl(`/operation-logs?store_id=${storeId}`));
  return await response.json();
}

export async function getOperationLog(id) {
  const response = await fetch(getApiUrl(`/operation-logs/${id}`));
  return await response.json();
}

export async function revokeOperation(id) {
  const response = await fetch(getApiUrl(`/operation-logs/revoke/${id}`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    }
  });
  return await response.json();
}

export async function loadConsumption(year, month, storeId) {
  const response = await fetch(getApiUrl(`/ingredient-consumption?year=${year}&month=${month}&store_id=${storeId}`));
  return await response.json();
}
