import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      name: 'Layout',
      component: () => import('../views/Layout.vue'),
      meta: { requiresAuth: true },
      redirect: '/ingredients',
      children: [
        {
          path: 'ingredients',
          name: 'Ingredients',
          component: () => import('../views/Ingredients.vue'),
        },
        {
          path: 'dishes',
          name: 'Dishes',
          component: () => import('../views/Dishes.vue'),
        },
        {
          path: 'use-dish',
          name: 'UseDish',
          component: () => import('../views/UseDish.vue'),
        },
        {
          path: 'consumption',
          name: 'Consumption',
          component: () => import('../views/Consumption.vue'),
        },
        {
          path: 'operation-logs',
          name: 'OperationLogs',
          component: () => import('../views/OperationLogs.vue'),
        },
        {
          path: 'settings',
          name: 'Settings',
          component: () => import('../views/Settings.vue'),
        },
      ],
    },
  ],
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;
