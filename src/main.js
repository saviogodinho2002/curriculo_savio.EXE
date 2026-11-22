// Entrada do app com pré-renderização (vite-ssg): no `npm run build` cada rota vira
// um HTML completo (bom para Google e IAs); no navegador o Vue só "hidrata" a página.
// Sem CSS global aqui: cada rota carrega o próprio (portfólio e jogo /matrix
// têm estilos globais diferentes e não podem vazar um no outro).
import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import { routes, scrollBehavior } from './router'

export const createApp = ViteSSG(App, {
  routes,
  base: import.meta.env.BASE_URL,
  scrollBehavior,
})
