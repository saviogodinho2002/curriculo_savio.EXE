// Monta o <head> de cada idioma: title, description, canonical, hreflang,
// Open Graph, Twitter e dados estruturados (JSON-LD ProfilePage + Person).
// Tudo sai no HTML pré-renderizado pelo vite-ssg.
import { LOCALE_PATHS, LOCALE_TAGS, SITE_URL, absUrl, projectPath } from './site'
import { MD_PATHS, OG_IMAGES, OG_SIZE } from './assets'

const stripMarks = (s) => (s || '').replace(/\*\*(.+?)\*\*/g, '$1')

function clamp(text, max = 158) {
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1)
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`
}

/** Descrição curta para buscadores: 1ª frase do resumo + stack principal. */
function description(cv, locale) {
  const firstSentence = stripMarks(cv.resumo.split('\n\n')[0]).split(/(?<=\.)\s/)[0]
  const stack = cv.habilidades.slice(0, 4).join(', ')
  const tail = locale === 'en' ? `Stack: ${stack}.` : `Stack: ${stack}.`
  return clamp(`${firstSentence} ${tail}`)
}

function personLd(cv, locale) {
  const c = cv.contato
  const school = cv.formacao?.find((f) => /UFOPA|Oeste do Pará|Western Pará/i.test(f.instituicao))
  return {
    '@type': 'Person',
    '@id': `${SITE_URL}/#person`,
    name: cv.nome,
    url: absUrl(LOCALE_PATHS[locale]),
    jobTitle: cv.titulo,
    description: stripMarks(cv.resumo.split('\n\n')[0]),
    email: `mailto:${c.email}`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Santarém',
      addressRegion: 'PA',
      addressCountry: 'BR',
    },
    worksFor: cv.empresa_atual
      ? { '@type': 'Organization', name: cv.empresa_atual, url: 'https://w3companhia.com' }
      : undefined,
    alumniOf: school
      ? { '@type': 'CollegeOrUniversity', name: school.instituicao.split(',')[0] }
      : undefined,
    knowsAbout: (cv.habilidades_grupos ?? [{ itens: cv.habilidades }]).flatMap((g) => g.itens),
    knowsLanguage: ['pt-BR', 'en'],
    sameAs: [c.linkedin, c.github].filter(Boolean),
  }
}

export function buildHead(locale, cv) {
  const tag = LOCALE_TAGS[locale]
  const other = locale === 'pt' ? 'en' : 'pt'
  const url = absUrl(LOCALE_PATHS[locale])
  const title = `${cv.nome} — ${cv.titulo}`
  const desc = description(cv, locale)
  const [firstName, ...rest] = cv.nome.split(' ')

  // WebSite é o principal sinal que o Google usa para o nome do site nos resultados
  // (sem ele, num subdomínio *.vercel.app, aparece "Vercel" no lugar do nome).
  const website = {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: absUrl(LOCALE_PATHS.pt),
    name: cv.nome,
    alternateName: ['Savio Godinho', 'savio@godinho'],
    inLanguage: [LOCALE_TAGS.pt.hreflang, LOCALE_TAGS.en.hreflang],
  }

  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      website,
      {
        '@type': 'ProfilePage',
        url,
        name: title,
        inLanguage: tag.hreflang,
        dateModified: new Date().toISOString().slice(0, 10),
        isPartOf: { '@id': website['@id'] },
        mainEntity: personLd(cv, locale),
        // páginas de projeto ligadas ao perfil
        hasPart: (cv.projetos || [])
          .filter((p) => p.slug && p.pagina)
          .map((p) => ({
            '@type': 'WebPage',
            url: absUrl(projectPath(locale, p.slug)),
            name: p.nome.split(/\s+[–—]\s+/)[0],
          })),
      },
    ],
  }

  return {
    htmlAttrs: { lang: tag.hreflang },
    title,
    meta: [
      { name: 'description', content: desc },
      { name: 'robots', content: 'index, follow, max-image-preview:large' },
      { property: 'og:type', content: 'profile' },
      { property: 'og:site_name', content: cv.nome },
      { property: 'og:url', content: url },
      { property: 'og:title', content: title },
      { property: 'og:description', content: desc },
      { property: 'og:locale', content: tag.og },
      { property: 'og:locale:alternate', content: LOCALE_TAGS[other].og },
      { property: 'profile:first_name', content: firstName },
      { property: 'profile:last_name', content: rest.join(' ') },
      { property: 'og:image', content: absUrl(OG_IMAGES[locale].path) },
      { property: 'og:image:width', content: String(OG_SIZE.width) },
      { property: 'og:image:height', content: String(OG_SIZE.height) },
      { property: 'og:image:alt', content: OG_IMAGES[locale].alt },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:image', content: absUrl(OG_IMAGES[locale].path) },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: desc },
    ],
    link: [
      { rel: 'canonical', href: url },
      { rel: 'alternate', hreflang: LOCALE_TAGS.pt.hreflang, href: absUrl(LOCALE_PATHS.pt) },
      { rel: 'alternate', hreflang: LOCALE_TAGS.en.hreflang, href: absUrl(LOCALE_PATHS.en) },
      { rel: 'alternate', hreflang: 'x-default', href: absUrl(LOCALE_PATHS.pt) },
      // versões para IAs/agentes (llmstxt.org)
      { rel: 'alternate', type: 'text/markdown', href: absUrl(MD_PATHS[locale]) },
      { rel: 'describedby', type: 'text/plain', href: absUrl('/llms.txt') },
    ],
    script: [
      {
        type: 'application/ld+json',
        // JSON.stringify descarta os campos undefined
        innerHTML: JSON.stringify(ld),
      },
    ],
  }
}

/**
 * <head> da página de um projeto (/projetos/<slug>/ e /en/projects/<slug>/):
 * title e description próprios, canonical, hreflang, og:image = 1º print e JSON-LD
 * SoftwareApplication (autor = a mesma Person da home) + BreadcrumbList.
 */
export function buildProjectHead(locale, cv, project, { title: name, subtitle }) {
  const tag = LOCALE_TAGS[locale]
  const other = locale === 'pt' ? 'en' : 'pt'
  const page = project.pagina
  const url = absUrl(projectPath(locale, project.slug))
  const title = `${name} — ${cv.nome}`
  const desc = clamp(stripMarks(page.subtitulo || subtitle || project.descricao))
  const first = page.prints?.[0]
  const image = first ? absUrl(first.src) : absUrl(OG_IMAGES[locale].path)
  const home = absUrl(LOCALE_PATHS[locale])
  const projectsLabel = locale === 'pt' ? 'Projetos' : 'Projects'

  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        url,
        name: title,
        description: desc,
        inLanguage: tag.hreflang,
        isPartOf: { '@id': `${SITE_URL}/#website` },
        breadcrumb: {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: cv.nome, item: home },
            { '@type': 'ListItem', position: 2, name: projectsLabel, item: `${home}#projetos` },
            { '@type': 'ListItem', position: 3, name, item: url },
          ],
        },
        mainEntity: {
          '@type': 'SoftwareApplication',
          name,
          description: stripMarks(project.descricao),
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          url: project.link && project.link !== '#' ? project.link : url,
          image: (page.prints || []).map((p) => absUrl(p.src)),
          keywords: (page.stack || []).flatMap((g) => g.itens).join(', ') || undefined,
          author: { '@type': 'Person', '@id': `${SITE_URL}/#person`, name: cv.nome, url: home },
        },
      },
    ],
  }

  return {
    htmlAttrs: { lang: tag.hreflang },
    title,
    meta: [
      { name: 'description', content: desc },
      { name: 'robots', content: 'index, follow, max-image-preview:large' },
      { property: 'og:type', content: 'article' },
      { property: 'og:site_name', content: cv.nome },
      { property: 'og:url', content: url },
      { property: 'og:title', content: title },
      { property: 'og:description', content: desc },
      { property: 'og:locale', content: tag.og },
      { property: 'og:locale:alternate', content: LOCALE_TAGS[other].og },
      { property: 'og:image', content: image },
      { property: 'og:image:width', content: first ? '1280' : String(OG_SIZE.width) },
      { property: 'og:image:height', content: first ? '800' : String(OG_SIZE.height) },
      { property: 'og:image:alt', content: first?.legenda || title },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:image', content: image },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: desc },
    ],
    link: [
      { rel: 'canonical', href: url },
      { rel: 'alternate', hreflang: LOCALE_TAGS.pt.hreflang, href: absUrl(projectPath('pt', project.slug)) },
      { rel: 'alternate', hreflang: LOCALE_TAGS.en.hreflang, href: absUrl(projectPath('en', project.slug)) },
      { rel: 'alternate', hreflang: 'x-default', href: absUrl(projectPath('pt', project.slug)) },
      // versão em Markdown da página, para IAs/agentes
      { rel: 'alternate', type: 'text/markdown', href: `${url}index.md` },
      { rel: 'describedby', type: 'text/plain', href: absUrl('/llms.txt') },
    ],
    script: [{ type: 'application/ld+json', innerHTML: JSON.stringify(ld) }],
  }
}
