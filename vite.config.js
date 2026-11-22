import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { robotsTxt, sitemapXml } from './src/seo/files.js'

// Gera sitemap.xml e robots.txt no build a partir de src/seo (nunca ficam desatualizados).
// Só no build do cliente: o vite-ssg também faz um build de servidor, que não deve emitir arquivos.
function seoFiles() {
  let isSsrBuild = false
  return {
    name: 'seo-files',
    apply: 'build',
    configResolved(config) {
      isSsrBuild = Boolean(config.build.ssr)
    },
    generateBundle() {
      if (isSsrBuild) return
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapXml() })
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsTxt() })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), seoFiles()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // pré-renderização (npm run build = vite-ssg build): um HTML completo por rota
  ssgOptions: {
    dirStyle: 'nested', // dist/en/index.html, dist/matrix/index.html
    includedRoutes: () => ['/', '/en/', '/matrix'],
    script: 'async',
    formatting: 'none',
  },
})
