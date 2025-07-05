import { createRouter, createWebHistory } from 'vue-router'
import Main from '@/views/Main.vue'
import AppLayout from '@/layouts/AppLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Main,
    },
    {
      path: '/settings',
      component: AppLayout,
      children: [
        {
          path: 'model',
          name: 'model',
          component: () => import('@/views/settings/ModelCrud.vue')
        },
        {
          path: 'access',
          name: 'access',
          component: () => import('@/views/settings/AccessCrud.vue')
        },
        {
          path: 'instance',
          name: 'instance',
          component: () => import('@/views/settings/InstanceCrud.vue')
        },
        {
          path: 'performance',
          name: 'performance',
          component: () => import('@/views/settings/PerformanceCrud.vue'),
        },
        {
          path: 'user',
          name: 'user',
          component: () => import('@/views/settings/UsersCrud.vue'),
        }
      ]
    },
  ],
})

export default router
