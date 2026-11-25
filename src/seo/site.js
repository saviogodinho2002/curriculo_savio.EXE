// URL canônica do site (sem barra no fim). Trocar aqui se o domínio mudar:
// canonical, hreflang, sitemap, robots, JSON-LD e llms.txt usam esta constante.
export const SITE_URL = 'https://curriculo-savio-exe.vercel.app'

// caminho de cada idioma (com barra no fim: a Vercel está com trailingSlash: true)
export const LOCALE_PATHS = { pt: '/', en: '/en/' }

// código de idioma para hreflang / og:locale
export const LOCALE_TAGS = {
  pt: { hreflang: 'pt-BR', og: 'pt_BR' },
  en: { hreflang: 'en', og: 'en_US' },
}

export const absUrl = (path) => `${SITE_URL}${path}`

// página própria de cada projeto que tem o campo "pagina" no JSON do CV
export const PROJECT_BASE = { pt: '/projetos/', en: '/en/projects/' }
export const projectPath = (locale, slug) => `${PROJECT_BASE[locale]}${slug}/`
export const projectSlugs = (cv) => (cv.projetos || []).filter((p) => p.slug && p.pagina).map((p) => p.slug)
