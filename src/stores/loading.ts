import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useLoadingStore = defineStore('loading', () => {
  const loading = ref(false);
  const requestCount = ref(0);

  function showLoading() {
    requestCount.value++;
    loading.value = true;
  }

  function hideLoading() {
    requestCount.value--;
    if (requestCount.value <= 0) {
      requestCount.value = 0;
      loading.value = false;
    }
  }

  return {
    loading,
    showLoading,
    hideLoading,
  };
});
