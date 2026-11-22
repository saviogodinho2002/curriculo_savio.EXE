// Rotas do site. O vite-ssg cria o router e pré-renderiza '/', '/en/' e '/matrix'.
// Rotas com import dinâmico: o CSS de cada uma vira um chunk separado e só carrega
// na própria página. Entre portfólio e /matrix a navegação é por <a href>
// (recarrega a página), então os estilos globais nunca se misturam.
export const routes = [
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
]

export function scrollBehavior(to, from, savedPosition) {
  if (savedPosition) return savedPosition
  if (to.hash) {
    const reduce =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    return { el: to.hash, behavior: reduce ? 'auto' : 'smooth' }
  }
  return { top: 0 }
}
