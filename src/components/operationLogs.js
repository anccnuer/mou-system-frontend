import * as usersApi from '../api/users.js';

export function operationLogsComponent() {
  return {
    logs: [],
    selectedLog: null,
    showModal: false,
    loading: false,

    async load(storeId) {
      this.loading = true;
      try {
        const data = await usersApi.loadOperationLogs(storeId);
        this.logs = data;
      } catch (error) {
        console.error('加载操作记录失败:', error);
      } finally {
        this.loading = false;
      }
    },

    getOperationTypeText(operationType) {
      const typeMap = {
        'ingredient_add': '添加食材',
        'ingredient_restock': '食材补货',
        'ingredient_edit': '编辑食材',
        'ingredient_delete': '删除食材',
        'dish_use': '使用菜品',
        'dish_batch_use': '批量使用菜品'
      };
      return typeMap[operationType] || operationType;
    },

    async showDetails(id) {
      try {
        const data = await usersApi.getOperationLog(id);
        if (data.error) {
          alert('加载失败');
          return;
        }
        this.selectedLog = data;
        this.showModal = true;
      } catch (error) {
        console.error('加载操作详情失败:', error);
        alert('加载失败');
      }
    },

    closeModal() {
      this.showModal = false;
      this.selectedLog = null;
    },

    async revoke(id) {
      if (!confirm('确定要撤回此操作吗？')) return;

      try {
        const data = await usersApi.revokeOperation(id);
        if (data.error) {
          alert(data.error);
        } else {
          alert('撤回成功！');
          this.selectedLog = null;
          this.showModal = false;
          this.$dispatch('operation-changed');
        }
      } catch (error) {
        console.error('撤回操作失败:', error);
        alert('撤回失败，请稍后重试');
      }
    },

    getDetailsHtml(details) {
      const parsedDetails = typeof details === 'string' ? JSON.parse(details) : details;

      switch (this.selectedLog.operation_type) {
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

        case 'dish_use':
          return `
            <div class="space-y-2">
              <p><strong>菜品名称：</strong>${parsedDetails.dish_name}</p>
              <p><strong>使用数量：</strong>${parsedDetails.quantity}</p>
              <div class="mt-3">
                <strong>使用的食材：</strong>
                <ul class="list-disc list-inside mt-2 space-y-1">
                  ${parsedDetails.used_ingredients.map(ing => 
                    `<li>${ing.ingredient_name}：${ing.quantity}</li>`
                  ).join('')}
                </ul>
              </div>
            </div>
          `;

        case 'dish_batch_use':
          if (!parsedDetails.batch_results || parsedDetails.batch_results.length === 0) {
            return '<p class="text-gray-500">无操作记录</p>';
          }
          const hasSuccess = parsedDetails.batch_results.some(result => result.success);
          if (!hasSuccess) {
            return '<p class="text-red-500">所有操作均失败</p>';
          }
          return `
            <div class="space-y-2">
              <strong>批量使用结果：</strong>
              <ul class="list-disc list-inside mt-2 space-y-2">
                ${parsedDetails.batch_results.map(result => {
                  if (result.success) {
                    return `
                      <li class="text-green-600">
                        <strong>${result.name}</strong> - 成功
                        <ul class="list-disc list-inside ml-4 mt-1">
                          ${result.used_ingredients.map(ing => 
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
  };
}
