<template>
  <div>
    <div class="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4 text-gray-800">添加新菜品</h2>
      <form @submit.prevent="handleAdd" class="space-y-4">
        <div>
          <label for="dish-name" class="block text-sm font-medium text-gray-700 mb-1">菜品名称</label>
          <input
            id="dish-name"
            v-model="newDish.name"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">所需食材</label>
          <div class="space-y-3">
            <div v-for="(ing, index) in newDish.ingredients" :key="index" class="flex gap-4 items-end">
              <select
                v-model="ing.ingredient_id"
                required
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">选择食材</option>
                <option v-for="item in ingredientsData" :key="item.id" :value="item.id">
                  {{ item.name }}
                </option>
              </select>
              <div class="flex items-center">
                <input
                  v-model.number="ing.quantity"
                  type="number"
                  min="1"
                  value="1"
                  placeholder="所需数量"
                  class="w-24 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span class="px-3 py-2 bg-gray-100 text-gray-700 border-t border-b border-r border-gray-300 rounded-r-md">
                  {{ getIngredientUnit(ing.ingredient_id) }}
                </span>
              </div>
              <button
                v-if="newDish.ingredients.length > 1"
                type="button"
                @click="removeIngredientRow(index)"
                class="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
              >
                -
              </button>
              <button
                v-if="index === newDish.ingredients.length - 1"
                type="button"
                @click="addIngredientRow"
                class="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="dishStore.submitting"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ dishStore.submitting ? '添加中...' : '添加' }}
          </button>
        </div>
      </form>
    </div>

    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4 text-gray-800">菜品列表</h2>
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-100">
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">ID</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">名称</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">创建时间</th>
              <th class="px-4 py-2 text-left text-sm font-medium text-gray-600 border-b">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="dish in dishStore.dishes" :key="dish.id">
              <td class="px-4 py-2 border-b">{{ dish.id }}</td>
              <td class="px-4 py-2 border-b">{{ dish.name }}</td>
              <td class="px-4 py-2 border-b">{{ dish.created_at }}</td>
              <td class="px-4 py-2 border-b">
                <button
                  @click="handleShowDetails(dish.id)"
                  :disabled="dishStore.submitting"
                  class="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm mr-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  详情
                </button>
                <button
                  @click="handleDelete(dish.id)"
                  :disabled="dishStore.submitting"
                  class="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <div v-if="selectedDish">
          <h3 class="text-xl font-semibold mb-4 text-gray-800">{{ selectedDish.name }} 详情</h3>
          <div v-if="selectedDish.ingredients && selectedDish.ingredients.length > 0">
            <h3 class="text-lg font-medium mb-2 text-gray-800">所需食材：</h3>
            <ul class="list-disc list-inside mb-4 space-y-1">
              <li v-for="ing in selectedDish.ingredients" :key="ing.id">
                {{ ing.name }}：{{ ing.quantity }} {{ ing.unit }}
              </li>
            </ul>
          </div>
          <div class="flex justify-end">
            <button @click="closeModal" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">关闭</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useDishStore } from '../stores/dishes';
import { useStoreStore } from '../stores/store';
import { loadIngredientsOptions } from '../api/ingredients';
import { getDish } from '../api/dishes';
import type { DishIngredient, Ingredient, DishDetail } from '../types';

const dishStore = useDishStore();
const storeStore = useStoreStore();

const newDish = ref<{ name: string; ingredients: DishIngredient[] }>({
  name: '',
  ingredients: [{ ingredient_id: 0, quantity: 1 }],
});
const ingredientsData = ref<Ingredient[]>([]);
const selectedDish = ref<DishDetail | null>(null);
const showModal = ref(false);

async function handleAdd() {
  if (!newDish.value.name) {
    alert('请填写菜品名称');
    return;
  }

  const validIngredients = newDish.value.ingredients.filter(ing => ing.ingredient_id && ing.quantity);

  if (validIngredients.length === 0) {
    alert('请至少选择一个食材');
    return;
  }

  const success = await dishStore.addNewDish({
    name: newDish.value.name,
    ingredients: validIngredients.map(ing => ({
      ingredient_id: parseInt(ing.ingredient_id.toString()),
      quantity: parseInt(ing.quantity.toString()),
    })),
    store_id: storeStore.currentStoreId,
  });

  if (success) {
    newDish.value = { name: '', ingredients: [{ ingredient_id: 0, quantity: 1 }] };
  } else {
    alert('添加失败');
  }
}

function addIngredientRow() {
  newDish.value.ingredients.push({ ingredient_id: 0, quantity: 1 });
}

function removeIngredientRow(index: number) {
  if (newDish.value.ingredients.length > 1) {
    newDish.value.ingredients.splice(index, 1);
  }
}

function getIngredientUnit(ingredientId: number): string {
  const ingredient = ingredientsData.value.find(ing => ing.id === ingredientId);
  return ingredient ? ingredient.unit : '单位';
}

async function handleShowDetails(id: number) {
  try {
    selectedDish.value = await getDish(id);
    showModal.value = true;
  } catch (error) {
    alert('加载失败');
  }
}

function closeModal() {
  showModal.value = false;
  selectedDish.value = null;
}

async function handleDelete(id: number) {
  if (!confirm('确定要删除这个菜品吗？')) return;

  const success = await dishStore.deleteDishById(id, storeStore.currentStoreId);

  if (!success) {
    alert('删除失败');
  }
}

onMounted(async () => {
  await dishStore.loadDishesList(storeStore.currentStoreId);
  ingredientsData.value = await loadIngredientsOptions(storeStore.currentStoreId);
});

watch(() => storeStore.currentStoreId, async (newStoreId) => {
  await dishStore.loadDishesList(newStoreId);
  ingredientsData.value = await loadIngredientsOptions(newStoreId);
});
</script>
