import * as XLSX from 'xlsx';
import * as ingredientsApi from '../api/ingredients.js';

export function ingredientsComponent() {
  return {
    ingredients: [],
    loading: false,
    submitting: false,
    newIngredient: {
      name: '',
      unit: '',
      quantity: 0
    },
    editingIngredient: null,
    excelData: [],
    excelPreview: [],
    showExcelPreview: false,
    excelError: '',

    async load(storeId) {
      this.loading = true;
      try {
        const data = await ingredientsApi.loadIngredients(storeId);
        this.ingredients = data.sort((a, b) => a.quantity - b.quantity);
      } catch (error) {
        console.error('加载食材列表失败:', error);
      } finally {
        this.loading = false;
      }
    },

    async add(storeId) {
      if (!this.newIngredient.name || !this.newIngredient.unit) {
        alert('请填写完整信息');
        return;
      }

      this.submitting = true;
      this.$root.appLoading = true;
      try {
        const response = await ingredientsApi.addIngredient({
          name: this.newIngredient.name,
          quantity: parseInt(this.newIngredient.quantity),
          unit: this.newIngredient.unit,
          store_id: storeId
        });

        if (response.ok) {
          this.newIngredient = { name: '', unit: '', quantity: 0 };
          await this.load(storeId);
          this.$dispatch('operation-changed');
        } else {
          const data = await response.json();
          alert(data.error || '添加失败');
        }
      } catch (error) {
        console.error('添加食材失败:', error);
        alert('添加失败');
      } finally {
        this.submitting = false;
        this.$root.appLoading = false;
      }
    },

    async edit(id) {
      this.submitting = true;
      this.$root.appLoading = true;
      try {
        const ingredient = await ingredientsApi.getIngredient(id);
        const newQuantity = prompt('请输入新的库存数量：', ingredient.quantity);
        
        if (newQuantity !== null) {
          const response = await ingredientsApi.updateIngredient(id, {
            quantity: parseInt(newQuantity),
            unit: ingredient.unit
          });

          if (response.ok) {
            await this.load(ingredient.store_id);
            this.$dispatch('operation-changed');
          } else {
            alert('更新失败');
          }
        }
      } catch (error) {
        console.error('编辑食材失败:', error);
        alert('编辑失败');
      } finally {
        this.submitting = false;
        this.$root.appLoading = false;
      }
    },

    async restock(id, storeId) {
      const input = document.getElementById(`restock-${id}`);
      const restockQuantity = parseInt(input.value);

      if (isNaN(restockQuantity) || restockQuantity <= 0) {
        alert('请输入有效的补货数量');
        return;
      }

      this.submitting = true;
      this.$root.appLoading = true;
      try {
        const ingredient = await ingredientsApi.getIngredient(id);
        const newQuantity = ingredient.quantity + restockQuantity;

        const response = await ingredientsApi.updateIngredient(id, {
          quantity: newQuantity,
          unit: ingredient.unit
        });

        if (response.ok) {
          await this.load(storeId);
          input.value = '';
          this.$dispatch('operation-changed');
        } else {
          alert('补货失败');
        }
      } catch (error) {
        console.error('补货失败:', error);
        alert('补货失败');
      } finally {
        this.submitting = false;
        this.$root.appLoading = false;
      }
    },

    async deleteIngredient(id, storeId) {
      if (!confirm('确定要删除这个食材吗？')) return;

      this.submitting = true;
      this.$root.appLoading = true;
      try {
        const response = await ingredientsApi.deleteIngredient(id);
        if (response.ok) {
          alert('删除成功！');
          await this.load(storeId);
          this.$dispatch('operation-changed');
        } else {
          alert('删除失败');
        }
      } catch (error) {
        console.error('删除食材失败:', error);
        alert('删除失败');
      } finally {
        this.submitting = false;
        this.$root.appLoading = false;
      }
    },

    handleExcelUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          this.excelData = [];
          this.excelPreview = [];

          for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (row.length >= 2) {
              const name = String(row[0]).trim();
              const unit = String(row[1]).trim();
              const quantity = row[2] ? parseInt(row[2]) : 0;

              if (name && unit) {
                this.excelData.push({ name, unit, quantity });
                this.excelPreview.push({
                  name: name,
                  unit: unit,
                  quantity: quantity,
                  status: '待处理',
                  statusClass: 'text-gray-500'
                });
              }
            }
          }

          if (this.excelData.length === 0) {
            this.excelError = '未找到有效的食材数据';
            this.showExcelPreview = false;
          } else {
            this.excelError = '';
            this.showExcelPreview = true;
          }
        } catch (error) {
          this.excelError = '解析Excel文件失败：' + error.message;
          this.showExcelPreview = false;
        }
      };
      reader.readAsArrayBuffer(file);
    },

    async submitBatchAdd(storeId) {
      this.submitting = true;
      
      try {
        const result = await ingredientsApi.batchAddIngredients({
          ingredients: this.excelData,
          store_id: storeId
        });
        
        const data = await result.json();

        if (data.errors && data.errors.length > 0) {
          data.errors.forEach((error) => {
            const index = error.row - 1;
            if (this.excelPreview[index]) {
              this.excelPreview[index].status = error.error;
              this.excelPreview[index].statusClass = 'text-red-600';
            }
          });
        }

        const successCount = data.success || 0;
        const failCount = data.failed || 0;

        for (let i = 0; i < this.excelPreview.length; i++) {
          if (this.excelPreview[i].status === '待处理') {
            this.excelPreview[i].status = '成功';
            this.excelPreview[i].statusClass = 'text-green-600';
          }
        }

        await this.load(storeId);
        this.$dispatch('operation-changed');

        alert(`处理完成！成功：${successCount}，失败：${failCount}`);
      } catch (error) {
        console.error('批量添加失败:', error);
        alert('批量添加失败: ' + error.message);
      } finally {
        this.submitting = false;
      }
    },

    clearExcel() {
      this.excelData = [];
      this.excelPreview = [];
      this.excelError = '';
      this.showExcelPreview = false;
      const fileInput = document.getElementById('ingredient-excel-file');
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };
}
