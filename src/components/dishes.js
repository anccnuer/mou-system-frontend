import * as dishesApi from '../api/dishes.js';
import * as ingredientsApi from '../api/ingredients.js';

export function dishesComponent() {
  return {
    dishes: [],
    ingredients: [],
    ingredientsData: [],
    loading: false,
    submitting: false,
    newDish: {
      name: '',
      ingredients: [{ ingredient_id: '', quantity: 1 }]
    },
    selectedDish: null,
    showModal: false,

    async load(storeId) {
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

    async loadIngredientsOptions(storeId) {
      try {
        const data = await ingredientsApi.loadIngredientsOptions(storeId);
        this.ingredientsData = data;
      } catch (error) {
        console.error('加载食材选项失败:', error);
      }
    },

    async add(storeId) {
      if (!this.newDish.name) {
        alert('请填写菜品名称');
        return;
      }

      const validIngredients = this.newDish.ingredients.filter(
        ing => ing.ingredient_id && ing.quantity
      );

      if (validIngredients.length === 0) {
        alert('请至少选择一个食材');
        return;
      }

      this.submitting = true;
      this.$root.appLoading = true;
      try {
        const response = await dishesApi.addDish({
          name: this.newDish.name,
          ingredients: validIngredients.map(ing => ({
            ingredient_id: parseInt(ing.ingredient_id),
            quantity: parseInt(ing.quantity)
          })),
          store_id: storeId
        });

        if (response.ok) {
          this.newDish = { name: '', ingredients: [{ ingredient_id: '', quantity: 1 }] };
          await this.load(storeId);
          this.$dispatch('operation-changed');
        } else {
          alert('添加失败');
        }
      } catch (error) {
        console.error('添加菜品失败:', error);
        alert('添加失败');
      } finally {
        this.submitting = false;
        this.$root.appLoading = false;
      }
    },

    addIngredientRow() {
      this.newDish.ingredients.push({ ingredient_id: '', quantity: 1 });
    },

    removeIngredientRow(index) {
      if (this.newDish.ingredients.length > 1) {
        this.newDish.ingredients.splice(index, 1);
      }
    },

    getIngredientUnit(ingredientId) {
      const ingredient = this.ingredientsData.find(ing => ing.id == ingredientId);
      return ingredient ? ingredient.unit : '单位';
    },

    async showDetails(id) {
      this.submitting = true;
      this.$root.appLoading = true;
      try {
        const data = await dishesApi.getDish(id);
        this.selectedDish = data;
        this.showModal = true;
      } catch (error) {
        console.error('加载菜品详情失败:', error);
        alert('加载失败');
      } finally {
        this.submitting = false;
        this.$root.appLoading = false;
      }
    },

    closeModal() {
      this.showModal = false;
      this.selectedDish = null;
    },

    async delete(id, storeId) {
      if (!confirm('确定要删除这个菜品吗？')) return;

      this.submitting = true;
      this.$root.appLoading = true;
      try {
        const response = await dishesApi.deleteDish(id);
        if (response.ok) {
          await this.load(storeId);
          this.$dispatch('operation-changed');
        } else {
          alert('删除失败');
        }
      } catch (error) {
        console.error('删除菜品失败:', error);
        alert('删除失败');
      } finally {
        this.submitting = false;
        this.$root.appLoading = false;
      }
    }
  };
}
