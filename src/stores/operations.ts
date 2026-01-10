import { defineStore } from 'pinia';
import { ref } from 'vue';
import { loadOperationLogs, getOperationLog, revokeOperation } from '../api/users';
import type { OperationLog } from '../types';

export const useOperationStore = defineStore('operation', () => {
  const logs = ref<OperationLog[]>([]);
  const loading = ref(false);
  const submitting = ref(false);

  async function loadOperationLogsList(storeId: number) {
    loading.value = true;
    try {
      const data = await loadOperationLogs(storeId);
      logs.value = data;
    } catch (error) {
      console.error('加载操作记录失败:', error);
    } finally {
      loading.value = false;
    }
  }

  async function loadOperationLogById(id: number): Promise<OperationLog> {
    submitting.value = true;
    try {
      const data = await getOperationLog(id);
      return data;
    } catch (error) {
      console.error('加载操作详情失败:', error);
      throw error;
    } finally {
      submitting.value = false;
    }
  }

  async function revokeOperationById(id: number) {
    submitting.value = true;
    try {
      const data = await revokeOperation(id);
      if (data.error) {
        throw new Error(data.error);
      }
      return true;
    } catch (error) {
      console.error('撤回操作失败:', error);
      throw error;
    } finally {
      submitting.value = false;
    }
  }

  return {
    logs,
    loading,
    submitting,
    loadOperationLogsList,
    loadOperationLogById,
    revokeOperationById,
  };
});
