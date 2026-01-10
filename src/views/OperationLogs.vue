<template>
  <div>
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4 text-gray-800">操作记录</h2>
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-100">
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">ID</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">操作时间</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">操作类型</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">操作人</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">状态</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in operationStore.logs" :key="log.id">
              <td class="px-4 py-2 border-b">{{ log.id }}</td>
              <td class="px-4 py-2 border-b">{{ new Date(log.operation_time).toLocaleString('zh-CN') }}</td>
              <td class="px-4 py-2 border-b">{{ getOperationTypeText(log.operation_type) }}</td>
              <td class="px-4 py-2 border-b">{{ log.user_name || '未知' }}</td>
              <td class="px-4 py-2 border-b" :class="log.is_revoked ? 'text-gray-500' : 'text-green-600'">
                {{ log.is_revoked ? '已撤回' : '未撤回' }}
              </td>
              <td class="px-4 py-2 border-b">
                <div class="flex gap-2">
                  <button
                    @click="handleShowDetails(log.id)"
                    :disabled="operationStore.submitting"
                    class="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    详情
                  </button>
                  <button
                    v-if="!log.is_revoked"
                    @click="handleRevoke(log.id)"
                    :disabled="operationStore.submitting"
                    class="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    撤回
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div v-if="selectedLog">
          <h3 class="text-xl font-semibold mb-4 text-gray-800">操作详情</h3>
          <div class="space-y-4 mb-6">
            <div>
              <p class="text-sm text-gray-600">操作ID：<span>{{ selectedLog.id }}</span></p>
              <p class="text-sm text-gray-600">操作时间：<span>{{ new Date(selectedLog.operation_time).toLocaleString('zh-CN') }}</span></p>
              <p class="text-sm text-gray-600">操作类型：<span>{{ getOperationTypeText(selectedLog.operation_type) }}</span></p>
              <p class="text-sm text-gray-600">操作人：<span>{{ selectedLog.user_name || '未知' }}</span></p>
              <p class="text-sm text-gray-600">状态：<span>{{ selectedLog.is_revoked ? '已撤回' : '未撤回' }}</span></p>
            </div>
            <div class="border-t pt-4">
              <h4 class="font-medium text-gray-800 mb-2">操作结果：</h4>
              <div v-html="getDetailsHtml(selectedLog.details)"></div>
            </div>
          </div>
          <div class="flex justify-end gap-3">
            <button @click="closeModal" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">关闭</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useOperationStore } from '../stores/operations';
import { useIngredientStore } from '../stores/ingredients';
import { useStoreStore } from '../stores/store';
import type { OperationLog } from '../types';

const operationStore = useOperationStore();
const ingredientStore = useIngredientStore();
const storeStore = useStoreStore();

const selectedLog = ref<OperationLog | null>(null);
const showModal = ref(false);

function getOperationTypeText(operationType: string): string {
  const typeMap: Record<string, string> = {
    'ingredient_add': '添加食材',
    'ingredient_restock': '食材补货',
    'ingredient_edit': '编辑食材',
    'ingredient_delete': '删除食材',
    'ingredient_batch_add': '批量添加食材',
    'dish_use': '使用菜品',
    'dish_batch_use': '批量使用菜品',
    'dish_delete': '删除菜品',
  };
  return typeMap[operationType] || operationType;
}

async function handleShowDetails(id: number) {
  try {
    selectedLog.value = await operationStore.loadOperationLogById(id);
    showModal.value = true;
  } catch (error) {
    alert('加载失败');
  }
}

function closeModal() {
  showModal.value = false;
  setTimeout(() => {
    selectedLog.value = null;
  }, 300);
}

async function handleRevoke(id: number) {
  if (!confirm('确定要撤回此操作吗？')) return;

  try {
    await operationStore.revokeOperationById(id);
    alert('撤回成功！');
    showModal.value = false;
    setTimeout(() => {
      selectedLog.value = null;
    }, 300);
    await ingredientStore.loadIngredientsList(storeStore.currentStoreId);
    await operationStore.loadOperationLogsList(storeStore.currentStoreId);
  } catch (error: any) {
    alert(error.message || '撤回失败，请稍后重试');
  }
}

function getDetailsHtml(details: string): string {
  const parsedDetails = typeof details === 'string' ? JSON.parse(details) : details;

  switch (selectedLog.value?.operation_type) {
    case 'ingredient_add':
      return `
        <div class="space-y-2">
          <p><strong>食材名称：</strong>${parsedDetails.ingredient_name}</p>
          <p><strong>数量：</strong>${parsedDetails.quantity}</p>
          <p><strong>单位：</strong>${parsedDetails.unit}</p>
        </div>
      `;

    case 'ingredient_restock':
      return `
        <div class="space-y-2">
          <p><strong>食材名称：</strong>${parsedDetails.ingredient_name}</p>
          <p><strong>补货数量：</strong>${parsedDetails.restock_quantity}</p>
          <p><strong>原库存：</strong>${parsedDetails.old_quantity}</p>
          <p><strong>新库存：</strong>${parsedDetails.new_quantity}</p>
          <p><strong>单位：</strong>${parsedDetails.unit}</p>
        </div>
      `;

    case 'ingredient_edit':
      return `
        <div class="space-y-2">
          <p><strong>食材名称：</strong>${parsedDetails.ingredient_name}</p>
          <p><strong>原库存：</strong>${parsedDetails.old_quantity}</p>
          <p><strong>新库存：</strong>${parsedDetails.new_quantity}</p>
          <p><strong>原单位：</strong>${parsedDetails.old_unit}</p>
          <p><strong>新单位：</strong>${parsedDetails.new_unit}</p>
        </div>
      `;

    case 'ingredient_delete':
      return `
        <div class="space-y-2">
          <p><strong>食材名称：</strong>${parsedDetails.deleted_ingredient.name}</p>
          <p><strong>数量：</strong>${parsedDetails.deleted_ingredient.quantity}</p>
          <p><strong>单位：</strong>${parsedDetails.deleted_ingredient.unit}</p>
        </div>
      `;

    case 'dish_delete':
      return `
        <div class="space-y-2">
          <p><strong>菜品名称：</strong>${parsedDetails.deleted_dish.name}</p>
          ${parsedDetails.deleted_ingredients && parsedDetails.deleted_ingredients.length > 0 ? `
            <div class="mt-3">
              <strong>关联的食材：</strong>
              <ul class="list-disc list-inside mt-2 space-y-1">
                ${parsedDetails.deleted_ingredients.map((ing: any) => 
                  `<li>食材ID：${ing.ingredient_id}，数量：${ing.quantity}</li>`
                ).join('')}
              </ul>
            </div>
          ` : '<p class="text-gray-500">无关联食材</p>'}
        </div>
      `;

    case 'dish_use':
      return `
        <div class="space-y-2">
          <p><strong>菜品名称：</strong>${parsedDetails.dish_name}</p>
          <p><strong>使用数量：</strong>${parsedDetails.quantity}</p>
          <div class="mt-3">
            <strong>使用的食材：</strong>
            <ul class="list-disc list-inside mt-2 space-y-1">
              ${parsedDetails.used_ingredients.map((ing: any) => 
                `<li>${ing.ingredient_name}：${ing.quantity}</li>`
              ).join('')}
            </ul>
          </div>
        </div>
      `;

    case 'ingredient_batch_add':
      if (!parsedDetails.batch_results || parsedDetails.batch_results.length === 0) {
        return '<p class="text-gray-500">无操作记录</p>';
      }
      const hasAddSuccess = parsedDetails.batch_results.some((result: any) => result.success);
      if (!hasAddSuccess) {
        return '<p class="text-red-500">所有操作均失败</p>';
      }
      return `
        <div class="space-y-2 max-h-60 overflow-y-auto">
          <strong>批量添加结果：</strong>
          <ul class="list-disc list-inside mt-2 space-y-2">
            ${parsedDetails.batch_results.map((result: any) => {
              if (result.success) {
                const operationType = result.operation_type === 'restock' ? '补货' : '添加';
                const operationTypeClass = result.operation_type === 'restock' ? 'text-blue-600' : 'text-green-600';
                return `
                  <li class="text-gray-700">
                    <strong>${result.name}</strong> - <span class="${operationTypeClass}">${operationType}</span>
                    <div class="ml-4 mt-1 text-gray-600">
                      <p>食材ID：${result.ingredient_id}</p>
                      <p>数量：${result.quantity}</p>
                      ${result.operation_type === 'restock' ? `
                        <p>原库存：${result.old_quantity}</p>
                        <p>新库存：${result.new_quantity}</p>
                      ` : ''}
                      <p>单位：${result.unit}</p>
                    </div>
                  </li>
                `;
              } else {
                return `<li class="text-red-600"><strong>${result.name}</strong> - ${result.error}</li>`;
              }
            }).join('')}
          </ul>
        </div>
      `;

    case 'dish_batch_use':
      if (!parsedDetails.batch_results || parsedDetails.batch_results.length === 0) {
        return '<p class="text-gray-500">无操作记录</p>';
      }
      const hasSuccess = parsedDetails.batch_results.some((result: any) => result.success);
      if (!hasSuccess) {
        return '<p class="text-red-500">所有操作均失败</p>';
      }
      return `
        <div class="space-y-2 max-h-60 overflow-y-auto">
          <strong>批量使用结果：</strong>
          <ul class="list-disc list-inside mt-2 space-y-2">
            ${parsedDetails.batch_results.map((result: any) => {
              if (result.success) {
                return `
                  <li class="text-green-600">
                    <strong>${result.name}</strong> - 成功
                    <ul class="list-disc list-inside ml-4 mt-1">
                      ${result.used_ingredients.map((ing: any) => 
                        `<li class="text-gray-700">${ing.ingredient_name}：${ing.quantity}</li>`
                      ).join('')}
                    </ul>
                  </li>
                `;
              } else {
                return `<li class="text-red-600"><strong>${result.name}</strong> - ${result.error}</li>`;
              }
            }).join('')}
          </ul>
        </div>
      `;

    default:
      return '<p class="text-gray-500">未知操作类型</p>';
  }
}

onMounted(() => {
  operationStore.loadOperationLogsList(storeStore.currentStoreId);
});
</script>
