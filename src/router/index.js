import { createRouter, createWebHistory } from 'vue-router'

// Rotas com import dinâmico: o CSS de cada uma vira um chunk separado e só
// carrega quando a rota abre. Entre portfólio e /matrix a navegação é por
// <a href> (recarrega a página), então os estilos globais nunca se misturam.
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'portfolio',
      component: () => import('../views/PortfolioView.vue'),
      meta: { locale: 'pt' },
    },
    {
      path: '/en/',
      alias: '/en',
      name: 'portfolio-en',
      component: () => import('../views/PortfolioView.vue'),
      meta: { locale: 'en' },
    },
    {
      path: '/matrix',
      name: 'matrix',
      component: () => import('../views/MatrixView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      return { el: to.hash, behavior: reduce ? 'auto' : 'smooth' }
    }
    return { top: 0 }
  },
})

export default router
