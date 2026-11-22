// Monta o <head> de cada idioma: title, description, canonical, hreflang,
// Open Graph, Twitter e dados estruturados (JSON-LD ProfilePage + Person).
// Tudo sai no HTML pré-renderizado pelo vite-ssg.
import { LOCALE_PATHS, LOCALE_TAGS, SITE_URL, absUrl } from './site'

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

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url,
    name: title,
    inLanguage: tag.hreflang,
    dateModified: new Date().toISOString().slice(0, 10),
    mainEntity: personLd(cv, locale),
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
      { name: 'twitter:card', content: 'summary' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: desc },
    ],
    link: [
      { rel: 'canonical', href: url },
      { rel: 'alternate', hreflang: LOCALE_TAGS.pt.hreflang, href: absUrl(LOCALE_PATHS.pt) },
      { rel: 'alternate', hreflang: LOCALE_TAGS.en.hreflang, href: absUrl(LOCALE_PATHS.en) },
      { rel: 'alternate', hreflang: 'x-default', href: absUrl(LOCALE_PATHS.pt) },
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
