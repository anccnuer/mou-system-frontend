<template>
  <div>
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4 text-gray-800">食材月度消耗统计</h2>
      <div class="flex gap-4 items-end mb-4">
        <div>
          <label for="consumption-year" class="block text-sm font-medium text-gray-700 mb-1">年份</label>
          <select
            id="consumption-year"
            v-model="year"
            @change="handleLoad"
            class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option v-for="y in years" :key="y.value" :value="y.value">
              {{ y.label }}
            </option>
          </select>
        </div>
        <div>
          <label for="consumption-month" class="block text-sm font-medium text-gray-700 mb-1">月份</label>
          <select
            id="consumption-month"
            v-model="month"
            @change="handleLoad"
            class="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option v-for="m in months" :key="m.value" :value="m.value">
              {{ m.label }}
            </option>
          </select>
        </div>
        <div class="flex items-end">
          <button @click="handleLoad" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">查询</button>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4 text-gray-800">消耗统计结果</h2>
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-100">
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">排名</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">食材ID</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">食材名称</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">单位</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">总消耗量</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">使用次数</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="consumptionData.length === 0">
              <td colspan="6" class="px-4 py-2 border-b text-center text-gray-500">暂无数据</td>
            </tr>
            <tr v-for="(item, index) in consumptionData" :key="index">
              <td class="px-4 py-2 border-b">{{ index + 1 }}</td>
              <td class="px-4 py-2 border-b">{{ item.ingredient_id }}</td>
              <td class="px-4 py-2 border-b">{{ item.ingredient_name }}</td>
              <td class="px-4 py-2 border-b">{{ item.unit }}</td>
              <td class="px-4 py-2 border-b">{{ item.total_quantity }}</td>
              <td class="px-4 py-2 border-b">{{ item.use_count }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useStoreStore } from '../stores/store';
import { loadConsumption } from '../api/users';
import type { ConsumptionData } from '../types';

const storeStore = useStoreStore();

const consumptionData = ref<ConsumptionData[]>([]);
const year = ref(new Date().getFullYear());
const month = ref(new Date().getMonth() + 1);
const years = ref<Array<{ value: number; label: string }>>([]);
const months = ref<Array<{ value: number; label: string }>>([]);

function initSelectors() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  years.value = [];
  for (let i = currentYear - 5; i <= currentYear; i++) {
    years.value.push({ value: i, label: i + '年' });
  }
  year.value = currentYear;

  months.value = [];
  for (let i = 1; i <= 12; i++) {
    months.value.push({ value: i, label: i + '月' });
  }
  month.value = currentMonth;
}

async function handleLoad() {
  try {
    consumptionData.value = await loadConsumption(year.value, month.value, storeStore.currentStoreId);
  } catch (error) {
    console.error('加载消耗统计失败:', error);
  }
}

onMounted(() => {
  initSelectors();
  handleLoad();
});
</script>
