import * as ingredientsApi from '../api/ingredients.js';

export function ingredientsComponent() {
  return {
    ingredients: [],
    loading: false,
    newIngredient: {
      name: '',
      unit: '',
      quantity: 0
    },
    editingIngredient: null,

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
          alert('添加失败');
        }
      } catch (error) {
        console.error('添加食材失败:', error);
        alert('添加失败');
      }
    },

    async edit(id) {
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
      }
    },

    async restock(id, storeId) {
      const input = document.getElementById(`restock-${id}`);
      const restockQuantity = parseInt(input.value);

      if (isNaN(restockQuantity) || restockQuantity <= 0) {
        alert('请输入有效的补货数量');
        return;
      }

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
      }
    },

    async delete(id, storeId) {
      if (!confirm('确定要删除这个食材吗？')) return;

      try {
        const response = await ingredientsApi.deleteIngredient(id);
        if (response.ok) {
          await this.load(storeId);
          this.$dispatch('operation-changed');
        } else {
          alert('删除失败');
        }
      } catch (error) {
        console.error('删除食材失败:', error);
        alert('删除失败');
      }
    }
  };
}
