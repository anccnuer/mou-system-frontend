import * as XLSX from 'xlsx';
import * as dishesApi from '../api/dishes.js';
import * as ingredientsApi from '../api/ingredients.js';

export function useDishComponent() {
  return {
    dishes: [],
    ingredients: [],
    excelData: [],
    excelPreview: [],
    loading: false,
    showExcelPreview: false,
    excelError: '',
    submitting: false,

    async loadDishes(storeId) {
      this.loading = true;
      try {
        const data = await dishesApi.loadDishes(storeId);
        this.dishes = data;
      } catch (error) {
        console.error('加载菜品列表失败:', error);
      } finally {
        this.loading = false;
      }
    },

    async loadIngredients(storeId) {
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

    async useDish(id, quantity, storeId) {
      if (isNaN(quantity) || quantity <= 0) {
        alert('请输入有效的数量');
        return;
      }

      try {
        const data = await dishesApi.useDish(id, quantity, storeId);
        if (data.error) {
          alert(data.error);
        } else {
          await this.loadDishes(storeId);
          await this.loadIngredients(storeId);
          this.$dispatch('operation-changed');
          alert('菜品使用成功！');
        }
      } catch (error) {
        console.error('使用菜品失败:', error);
        alert('使用菜品失败');
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
              const dishName = String(row[0]).trim();
              const quantity = parseInt(row[1]);

              if (dishName && !isNaN(quantity) && quantity > 0) {
                this.excelData.push({ name: dishName, quantity });
                this.excelPreview.push({
                  name: dishName,
                  quantity: quantity,
                  status: '待处理',
                  statusClass: 'text-gray-500'
                });
              }
            }
          }

          if (this.excelData.length === 0) {
            this.excelError = '未找到有效的菜品数据';
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

    async submitBatchUse(storeId) {
      this.submitting = true;
      
      try {
        const result = await dishesApi.batchUseDishes(this.excelData, storeId);
        
        if (!result.results) {
          throw new Error('返回数据格式错误: ' + JSON.stringify(result));
        }

        result.results.forEach((item, index) => {
          if (item.success) {
            this.excelPreview[index].status = '成功';
            this.excelPreview[index].statusClass = 'text-green-600';
          } else {
            this.excelPreview[index].status = item.error;
            this.excelPreview[index].statusClass = 'text-red-600';
          }
        });

        await this.loadDishes(storeId);
        await this.loadIngredients(storeId);
        this.$dispatch('operation-changed');

        const successCount = result.results.filter(r => r.success).length;
        const failCount = result.results.filter(r => !r.success).length;
        alert(`处理完成！成功：${successCount}，失败：${failCount}`);
      } catch (error) {
        console.error('批量使用失败:', error);
        alert('批量使用失败: ' + error.message);
      } finally {
        this.submitting = false;
      }
    },

    clearExcel() {
      this.excelData = [];
      this.excelPreview = [];
      this.excelError = '';
      this.showExcelPreview = false;
      const fileInput = document.getElementById('excel-file');
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };
}
