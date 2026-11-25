// Arquivos de rastreamento gerados no build (plugin em vite.config.js).
// Node puro: sem imports do Vite nem de .vue.
import { LOCALE_PATHS, LOCALE_TAGS, SITE_URL, absUrl } from './site.js'

// Cada página existe em pt e en: { pt: '/', en: '/en/' }. projectPages vem do vite.config.js.
export function sitemapXml(date = new Date().toISOString().slice(0, 10), projectPages = []) {
  const alternates = (paths) =>
    [
      ...Object.entries(paths).map(
        ([loc, path]) =>
          `    <xhtml:link rel="alternate" hreflang="${LOCALE_TAGS[loc].hreflang}" href="${absUrl(path)}"/>`,
      ),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${absUrl(paths.pt)}"/>`,
    ].join('\n')

  const urls = [LOCALE_PATHS, ...projectPages]
    .flatMap((paths) =>
      Object.values(paths).map(
        (path) => `  <url>
    <loc>${absUrl(path)}</loc>
    <lastmod>${date}</lastmod>
${alternates(paths)}
  </url>`,
      ),
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
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
