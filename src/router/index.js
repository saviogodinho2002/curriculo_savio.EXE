// Rotas do site. O vite-ssg cria o router e pré-renderiza '/', '/en/', '/matrix'
// e a página de cada projeto que tem "pagina" no JSON (ver vite.config.js).
import cvPt from '../data/curriculum.json'
import { LOCALE_PATHS, projectSlugs } from '../seo/site'

// projeto sem página (ou slug inexistente) volta para a lista de projetos da home
const PAGES = new Set(projectSlugs(cvPt))
const onlyProjectPages = (locale) => (to) =>
  PAGES.has(to.params.slug) || { path: LOCALE_PATHS[locale], hash: '#projetos' }

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
    path: '/projetos/:slug/',
    name: 'project',
    component: () => import('../views/ProjectView.vue'),
    meta: { locale: 'pt' },
    beforeEnter: onlyProjectPages('pt'),
  },
  {
    path: '/en/projects/:slug/',
    name: 'project-en',
    component: () => import('../views/ProjectView.vue'),
    meta: { locale: 'en' },
    beforeEnter: onlyProjectPages('en'),
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
