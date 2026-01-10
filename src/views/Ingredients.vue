<template>
  <div>
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4 text-gray-800">添加新食材</h2>
      <form @submit.prevent="handleAdd" class="flex gap-4">
        <div class="flex-1">
          <label for="ingredient-name" class="block text-sm font-medium text-gray-700 mb-1">食材名称</label>
          <input
            id="ingredient-name"
            v-model="newIngredient.name"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="w-32">
          <label for="ingredient-unit" class="block text-sm font-medium text-gray-700 mb-1">单位</label>
          <input
            id="ingredient-unit"
            v-model="newIngredient.unit"
            type="text"
            required
            placeholder="kg、个等"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="w-32">
          <label for="ingredient-quantity" class="block text-sm font-medium text-gray-700 mb-1">初始库存</label>
          <input
            id="ingredient-quantity"
            v-model.number="newIngredient.quantity"
            type="number"
            min="0"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="flex items-end">
          <button
            type="submit"
            :disabled="ingredientStore.submitting"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ ingredientStore.submitting ? '添加中...' : '添加' }}
          </button>
        </div>
      </form>
    </div>

    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4 text-gray-800">批量添加食材（Excel）</h2>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">上传Excel文件</label>
          <input
            type="file"
            accept=".xlsx,.xls"
            @change="handleExcelUpload"
            class="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <p class="text-sm text-gray-500 mt-1">Excel格式：食材名称 | 单位 | 初始库存（可选，默认0）</p>
        </div>

        <div v-if="showExcelPreview" class="space-y-4">
          <h3 class="text-lg font-medium mb-2 text-gray-800">解析预览</h3>
          <div class="overflow-x-auto mb-4">
            <table class="w-full border-collapse">
              <thead>
                <tr class="bg-gray-100">
                  <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">食材名称</th>
                  <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">单位</th>
                  <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">初始库存</th>
                  <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">状态</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in excelPreview" :key="index">
                  <td class="px-4 py-2 border-b">{{ item.name }}</td>
                  <td class="px-4 py-2 border-b">{{ item.unit }}</td>
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
              @click="handleBatchAdd"
              :disabled="ingredientStore.submitting || excelData.length === 0"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              确认添加
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4 text-gray-800">食材列表</h2>
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-100">
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">ID</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">名称</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">单位</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">库存</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">创建时间</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ing in ingredientStore.ingredients" :key="ing.id">
              <td class="px-4 py-2 border-b">{{ ing.id }}</td>
              <td class="px-4 py-2 border-b">{{ ing.name }}</td>
              <td class="px-4 py-2 border-b">{{ ing.unit }}</td>
              <td class="px-4 py-2 border-b">{{ ing.quantity }}</td>
              <td class="px-4 py-2 border-b">{{ ing.created_at }}</td>
              <td class="px-4 py-2 border-b">
                <div class="flex gap-2">
                  <input
                    :id="`restock-${ing.id}`"
                    type="number"
                    min="1"
                    placeholder="补货数量"
                    class="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    @click="handleRestock(ing.id)"
                    :disabled="ingredientStore.submitting"
                    class="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    补货
                  </button>
                  <button
                    @click="handleEdit(ing.id)"
                    :disabled="ingredientStore.submitting"
                    class="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    编辑
                  </button>
                  <button
                    @click="handleDelete(ing.id)"
                    :disabled="ingredientStore.submitting"
                    class="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    删除
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useIngredientStore } from '../stores/ingredients';
import { useStoreStore } from '../stores/store';
import { getIngredient } from '../api/ingredients';
import * as XLSX from 'xlsx';
import type { ExcelIngredient } from '../types';

const ingredientStore = useIngredientStore();
const storeStore = useStoreStore();

const newIngredient = ref({ name: '', unit: '', quantity: 0 });
const excelData = ref<ExcelIngredient[]>([]);
const excelPreview = ref<Array<{ name: string; unit: string; quantity: number; status: string; statusClass: string }>>([]);
const showExcelPreview = ref(false);
const excelError = ref('');

async function handleAdd() {
  if (!newIngredient.value.name || !newIngredient.value.unit) {
    alert('请填写完整信息');
    return;
  }

  const success = await ingredientStore.addNewIngredient({
    name: newIngredient.value.name,
    quantity: newIngredient.value.quantity,
    unit: newIngredient.value.unit,
    store_id: storeStore.currentStoreId,
  });

  if (success) {
    newIngredient.value = { name: '', unit: '', quantity: 0 };
  } else {
    alert('添加失败');
  }
}

async function handleEdit(id: number) {
  const ingredient = await getIngredient(id);
  const newQuantity = prompt('请输入新的库存数量：', ingredient.quantity.toString());

  if (newQuantity !== null) {
    const success = await ingredientStore.updateIngredientById(id, {
      quantity: parseInt(newQuantity),
      unit: ingredient.unit,
    });

    if (success) {
      await ingredientStore.loadIngredientsList(storeStore.currentStoreId);
    } else {
      alert('更新失败');
    }
  }
}

async function handleRestock(id: number) {
  const input = document.getElementById(`restock-${id}`) as HTMLInputElement;
  const restockQuantity = parseInt(input.value);

  if (isNaN(restockQuantity) || restockQuantity <= 0) {
    alert('请输入有效的补货数量');
    return;
  }

  const ingredient = await getIngredient(id);
  const newQuantity = ingredient.quantity + restockQuantity;

  const success = await ingredientStore.updateIngredientById(id, {
    quantity: newQuantity,
    unit: ingredient.unit,
  });

  if (success) {
    input.value = '';
    await ingredientStore.loadIngredientsList(storeStore.currentStoreId);
  } else {
    alert('补货失败');
  }
}

async function handleDelete(id: number) {
  if (!confirm('确定要删除这个食材吗？')) return;

  const success = await ingredientStore.deleteIngredientById(id, storeStore.currentStoreId);

  if (success) {
    alert('删除成功！');
  } else {
    alert('删除失败');
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
          const name = String(row[0]).trim();
          const unit = String(row[1]).trim();
          const quantity = row[2] ? parseInt(row[2]) : 0;

          if (name && unit) {
            excelData.value.push({ name, unit, quantity });
            excelPreview.value.push({
              name: name,
              unit: unit,
              quantity: quantity,
              status: '待处理',
              statusClass: 'text-gray-500',
            });
          }
        }
      }

      if (excelData.value.length === 0) {
        excelError.value = '未找到有效的食材数据';
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

async function handleBatchAdd() {
  try {
    const result = await ingredientStore.batchAdd({
      ingredients: excelData.value,
      store_id: storeStore.currentStoreId,
    });

    if (result.errors && result.errors.length > 0) {
      result.errors.forEach((error) => {
        const index = error.row - 1;
        if (excelPreview.value[index]) {
          excelPreview.value[index].status = error.error;
          excelPreview.value[index].statusClass = 'text-red-600';
        }
      });
    }

    const successCount = result.success || 0;
    const failCount = result.failed || 0;

    for (let i = 0; i < excelPreview.value.length; i++) {
      const item = excelPreview.value[i];
      if (item && item.status === '待处理') {
        item.status = '成功';
        item.statusClass = 'text-green-600';
      }
    }

    alert(`处理完成！成功：${successCount}，失败：${failCount}`);
  } catch (error: any) {
    alert('批量添加失败: ' + error.message);
  }
}

function clearExcel() {
  excelData.value = [];
  excelPreview.value = [];
  excelError.value = '';
  showExcelPreview.value = false;
}

onMounted(() => {
  ingredientStore.loadIngredientsList(storeStore.currentStoreId);
});
</script>
