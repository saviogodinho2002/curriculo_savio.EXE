import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { readFileSync } from 'node:fs'
import { robotsTxt, sitemapXml } from './src/seo/files.js'
import { projectPath, projectSlugs } from './src/seo/site.js'
import { cvMarkdown, llmsFullTxt, llmsTxt, projectMarkdown } from './src/seo/llms.js'

const readJson = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'))

const CV_PT = readJson('./src/data/curriculum.json')
const CV_EN = readJson('./src/data/curriculum.en.json')

// projetos com página própria (campo "pagina" no JSON): viram rotas pré-renderizadas e entram no
// sitemap (com os prints como imagens) e ganham uma versão em Markdown
const PROJECT_PAGES = projectSlugs(CV_PT).map((slug) => ({
  slug,
  paths: { pt: projectPath('pt', slug), en: projectPath('en', slug) },
  images: (CV_PT.projetos.find((p) => p.slug === slug).pagina.prints || []).map((s) => s.src),
}))

// Gera no build, a partir de src/seo e dos JSONs do CV (nunca ficam desatualizados):
// sitemap.xml, robots.txt, llms.txt (+ /llm.txt), llms-full.txt, index.md, en/index.md e o .md de cada projeto.
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
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemapXml(undefined, PROJECT_PAGES) })
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsTxt() })

      const cvPt = CV_PT
      const cvEn = CV_EN
      const llms = llmsTxt(cvEn, cvPt)
      const files = {
        'llms.txt': llms,
        'llm.txt': llms, // mesmo conteúdo, para quem procura no singular
        'llms-full.txt': llmsFullTxt(cvEn, cvPt),
        'index.md': cvMarkdown(cvPt, 'pt'),
        'en/index.md': cvMarkdown(cvEn, 'en'),
      }
      for (const { slug, paths } of PROJECT_PAGES) {
        for (const [locale, cv] of [['pt', cvPt], ['en', cvEn]]) {
          const project = cv.projetos.find((p) => p.slug === slug)
          if (project?.pagina) files[`${paths[locale].slice(1)}index.md`] = projectMarkdown(cv, locale, project)
        }
      }
      for (const [fileName, source] of Object.entries(files)) {
        this.emitFile({ type: 'asset', fileName, source })
      }
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
    dirStyle: 'nested', // dist/en/index.html, dist/matrix/index.html, dist/projetos/<slug>/index.html
    includedRoutes: () => ['/', '/en/', '/matrix', ...PROJECT_PAGES.flatMap((p) => [p.paths.pt, p.paths.en])],
    script: 'async',
    formatting: 'none',
  },
})
