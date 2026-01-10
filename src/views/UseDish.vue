<template>
  <div>
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4 text-gray-800">批量使用菜品</h2>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">上传Excel文件</label>
          <input
            type="file"
            accept=".xlsx,.xls"
            @change="handleExcelUpload"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <p class="text-sm text-gray-500 mt-1">Excel格式：菜品名 | 数量（一行一个菜品）</p>
        </div>

        <div v-if="showExcelPreview" class="space-y-4">
          <h3 class="text-lg font-medium mb-2 text-gray-800">解析预览</h3>
          <div class="overflow-x-auto mb-4">
            <table class="w-full border-collapse">
              <thead>
                <tr class="bg-gray-100">
                  <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">菜品名称</th>
                  <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">使用数量</th>
                  <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">状态</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in excelPreview" :key="index">
                  <td class="px-4 py-2 border-b">{{ item.name }}</td>
                  <td class="px-4 py-2 border-b">{{ item.quantity }}</td>
                  <td class="px-4 py-2 border-b" :class="item.statusClass">{{ item.status }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="excelError" class="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{{ excelError }}</div>
          <div class="flex justify-end gap-3">
            <button @click="clearExcel" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">清除</button>
            <button
              @click="handleBatchUse"
              :disabled="dishStore.submitting || excelData.length === 0"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              确认使用
            </button>
          </div>
        </div>
      </div>
    </div>

    <h2 class="text-xl font-semibold mb-4 text-gray-800">使用菜品</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-medium mb-4 text-gray-800">菜品列表</h3>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-100">
                <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">ID</th>
                <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">名称</th>
                <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">创建时间</th>
                <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">数量</th>
                <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="dish in dishStore.dishes" :key="dish.id">
                <td class="px-4 py-2 border-b">{{ dish.id }}</td>
                <td class="px-4 py-2 border-b">{{ dish.name }}</td>
                <td class="px-4 py-2 border-b">{{ dish.created_at }}</td>
                <td class="px-4 py-2 border-b">
                  <input
                    :id="`dish-qty-${dish.id}`"
                    type="number"
                    min="1"
                    value="1"
                    class="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </td>
                <td class="px-4 py-2 border-b">
                  <button
                    @click="handleUseDish(dish.id)"
                    :disabled="dishStore.submitting"
                    class="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    使用
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-medium mb-4 text-gray-800">实时食材库存</h3>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-100">
                <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">ID</th>
                <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">名称</th>
                <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">单位</th>
                <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">库存</th>
                <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">创建时间</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="ing in ingredientStore.ingredients" :key="ing.id">
                <td class="px-4 py-2 border-b">{{ ing.id }}</td>
                <td class="px-4 py-2 border-b">{{ ing.name }}</td>
                <td class="px-4 py-2 border-b">{{ ing.unit }}</td>
                <td class="px-4 py-2 border-b">{{ ing.quantity }}</td>
                <td class="px-4 py-2 border-b">{{ ing.created_at }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useDishStore } from '../stores/dishes';
import { useIngredientStore } from '../stores/ingredients';
import { useStoreStore } from '../stores/store';
import * as XLSX from 'xlsx';
import type { ExcelDish } from '../types';

const dishStore = useDishStore();
const ingredientStore = useIngredientStore();
const storeStore = useStoreStore();

const excelData = ref<ExcelDish[]>([]);
const excelPreview = ref<Array<{ name: string; quantity: number; status: string; statusClass: string }>>([]);
const showExcelPreview = ref(false);
const excelError = ref('');

async function handleUseDish(id: number) {
  const input = document.getElementById(`dish-qty-${id}`) as HTMLInputElement;
  const quantity = parseInt(input.value);

  if (isNaN(quantity) || quantity <= 0) {
    alert('请输入有效的数量');
    return;
  }

  try {
    await dishStore.useDishById(id, quantity, storeStore.currentStoreId);
    await ingredientStore.loadIngredientsList(storeStore.currentStoreId);
    alert('菜品使用成功！');
  } catch (error: any) {
    alert(error.message || '使用菜品失败');
  }
}

function handleExcelUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName as string];
      const jsonData = worksheet ? XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][] : [];

      excelData.value = [];
      excelPreview.value = [];

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (row && row.length >= 2) {
          const dishName = String(row[0]).trim();
          const quantity = parseInt(row[1]);

          if (dishName && !isNaN(quantity) && quantity > 0) {
            excelData.value.push({ name: dishName, quantity });
            excelPreview.value.push({
              name: dishName,
              quantity: quantity,
              status: '待处理',
              statusClass: 'text-gray-500',
            });
          }
        }
      }

      if (excelData.value.length === 0) {
        excelError.value = '未找到有效的菜品数据';
        showExcelPreview.value = false;
      } else {
        excelError.value = '';
        showExcelPreview.value = true;
      }
    } catch (error: any) {
      excelError.value = '解析Excel文件失败：' + error.message;
      showExcelPreview.value = false;
    }
  };
  reader.readAsArrayBuffer(file);
}

async function handleBatchUse() {
  try {
    const result = await dishStore.batchUse({
      dishes: excelData.value,
      store_id: storeStore.currentStoreId,
    });

    if (!result.results) {
      throw new Error('返回数据格式错误: ' + JSON.stringify(result));
    }

    result.results.forEach((item, index) => {
      const previewItem = excelPreview.value[index];
      if (previewItem) {
        if (item.success) {
          previewItem.status = '成功';
          previewItem.statusClass = 'text-green-600';
        } else {
          previewItem.status = item.error || '失败';
          previewItem.statusClass = 'text-red-600';
        }
      }
    });

    await ingredientStore.loadIngredientsList(storeStore.currentStoreId);

    const successCount = result.results.filter(r => r.success).length;
    const failCount = result.results.filter(r => !r.success).length;
    alert(`处理完成！成功：${successCount}，失败：${failCount}`);
  } catch (error: any) {
    alert('批量使用失败: ' + error.message);
  }
}

function clearExcel() {
  excelData.value = [];
  excelPreview.value = [];
  excelError.value = '';
  showExcelPreview.value = false;
}

onMounted(async () => {
  await dishStore.loadDishesList(storeStore.currentStoreId);
  await ingredientStore.loadIngredientsList(storeStore.currentStoreId);
});
</script>
