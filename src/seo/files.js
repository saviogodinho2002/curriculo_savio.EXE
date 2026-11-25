// Arquivos de rastreamento gerados no build (plugin em vite.config.js).
// Node puro: sem imports do Vite nem de .vue.
import { LOCALE_PATHS, LOCALE_TAGS, SITE_URL, absUrl } from './site.js'
import { OG_IMAGES } from './assets.js'

// Cada página existe em pt e en: { paths: { pt, en }, images: [] }. projectPages vem do vite.config.js;
// as imagens (prints dos projetos, og:image da home) entram como <image:image> para o Google Imagens.
export function sitemapXml(date = new Date().toISOString().slice(0, 10), projectPages = []) {
  const alternates = (paths) =>
    [
      ...Object.entries(paths).map(
        ([loc, path]) =>
          `    <xhtml:link rel="alternate" hreflang="${LOCALE_TAGS[loc].hreflang}" href="${absUrl(path)}"/>`,
      ),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${absUrl(paths.pt)}"/>`,
    ].join('\n')

  const home = { paths: LOCALE_PATHS, images: { pt: [OG_IMAGES.pt.path], en: [OG_IMAGES.en.path] } }
  const imagesOf = (page, locale) => (Array.isArray(page.images) ? page.images : page.images?.[locale] ?? [])
  const imageTags = (srcs) =>
    srcs.map((src) => `\n    <image:image>\n      <image:loc>${absUrl(src)}</image:loc>\n    </image:image>`).join('')

  const urls = [home, ...projectPages]
    .flatMap((page) =>
      Object.entries(page.paths).map(
        ([locale, path]) => `  <url>
    <loc>${absUrl(path)}</loc>
    <lastmod>${date}</lastmod>
${alternates(page.paths)}${imageTags(imagesOf(page, locale))}
  </url>`,
      ),
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>
`
}

export function robotsTxt() {
  return `# Todo o site pode ser rastreado, inclusive por buscadores e assistentes de IA.
User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`
}
