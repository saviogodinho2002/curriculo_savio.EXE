import { createRouter, createWebHistory } from 'vue-router'
import TerminalScreen from '../components/TerminalScreen.vue'
import MatrixScreen from '../components/MatrixScreen.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'terminal',
      component: TerminalScreen,
    },
    {
      path: '/matrix',
      name: 'matrix',
      component: MatrixScreen,
    }
  ],
})

export default router
