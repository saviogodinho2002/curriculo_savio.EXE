import { createRouter, createWebHistory } from 'vue-router'
import TerminalScreen from '../components/TerminalScreen.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'terminal',
      component: TerminalScreen,
    }
  ],
})

export default router
