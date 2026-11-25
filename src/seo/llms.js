// Versões em texto do currículo para IAs e agentes (padrão llmstxt.org):
//   /llms.txt       mapa curto (H1, resumo, seções com links)    — também em /llm.txt
//   /llms-full.txt  currículo completo em Markdown (EN + PT)
//   /index.md       página em Markdown (pt)    /en/index.md  (en)
// Gerado no build a partir dos JSONs: nunca fica desatualizado. Node puro.
import { bullets, formatPeriod, splitResumo, splitTech, splitTitle, stripMarks, hasLink } from '../utils/parseCv.js'
import { UI } from '../i18n/ui.js'
import { LOCALE_PATHS, absUrl, projectPath } from './site.js'
import { PDF_PATHS } from './assets.js'

const L = {
  pt: {
    langName: 'português',
    location: 'Local',
    current: 'Empresa atual',
    tech: 'Tecnologias',
    code: 'Projetos de código (GitHub)',
    page: 'Página',
    pdf: 'Currículo em PDF',
  },
  en: {
    langName: 'English',
    location: 'Location',
    current: 'Current company',
    tech: 'Technologies',
    code: 'Code projects (GitHub)',
    page: 'Page',
    pdf: 'CV (PDF)',
  },
}

const clean = (s) => stripMarks(s || '').trim()
const firstSentence = (s) => clean(s).split(/(?<=\.)\s/)[0]

/** Currículo completo em Markdown, no idioma indicado. */
export function cvMarkdown(cv, locale) {
  const t = UI[locale]
  const l = L[locale]
  const s = t.sections
  const c = cv.contato
  const resumo = splitResumo(cv.resumo)
  const out = []

  out.push(`# ${cv.nome} — ${cv.titulo}`, '')
  out.push(
    `> ${[c.localizacao, c.email, c.linkedin, c.github].filter(Boolean).join(' · ')}`,
    '',
    `${l.page}: ${absUrl(LOCALE_PATHS[locale])} · ${l.pdf}: ${absUrl(PDF_PATHS[locale])}`,
    '',
  )

  out.push(`## ${cap(s.sobre)}`, '', clean(resumo.intro), '')
  if (resumo.highlights.length) {
    out.push(`${clean(resumo.label)}`, '', ...resumo.highlights.map((h) => `- ${clean(h)}`), '')
  }

  out.push(`## ${cap(s.experiencia)}`, '')
  for (const e of cv.experiencias) {
    const { bullets: items, techs } = splitTech(e.descricao)
    out.push(`### ${e.cargo} — ${e.empresa}`, '', `_${formatPeriod(e.periodo)}_`, '')
    out.push(...items.map((b) => `- ${clean(b)}`))
    if (techs.length) out.push(`- ${l.tech}: ${techs.join(', ')}`)
    out.push('')
  }

  out.push(`## ${cap(s.skills)}`, '')
  for (const g of cv.habilidades_grupos || []) out.push(`- **${g.grupo}**: ${g.itens.join(', ')}`)
  out.push('', `### ${cap(t.skills.interests)}`, '', ...cv.afinidades.map((a) => `- ${a}`), '')
  if (cv.idiomas?.length) {
    out.push(`### ${cap(t.skills.languages)}`, '', ...cv.idiomas.map((i) => `- ${i.idioma}: ${i.nivel}`), '')
  }

  out.push(`## ${cap(s.projetos)}`, '')
  for (const p of cv.projetos) out.push(projectLine(p))
  out.push('', `### ${l.code}`, '')
  for (const p of cv.projetos_codigo || []) out.push(projectLine(p))
  out.push('')

  out.push(`## ${cap(s.formacao)}`, '')
  for (const f of cv.formacao) {
    out.push(`### ${f.curso} — ${f.instituicao}`, '', `_${formatPeriod(f.periodo)}_`, '')
    const b = bullets(f.descricao)
    if (b.length) out.push(...b.map((x) => `- ${clean(x)}`), '')
  }

  if (cv.hackathons?.length) {
    out.push(`## ${cap(s.hackathons)}`, '')
    for (const h of cv.hackathons) out.push(`- **${h.nome}**: ${clean(h.descricao)}`)
    out.push('')
  }

  out.push(`## ${cap(s.contato)}`, '')
  out.push(`- Email: ${c.email}`, `- ${t.contact.keys.telefone}: ${c.telefone}`)
  out.push(`- LinkedIn: ${c.linkedin}`, `- GitHub: ${c.github}`, `- ${l.location}: ${c.localizacao}`, '')

  return out.join('\n')
}

function projectLine(p) {
  const { title, subtitle } = splitTitle(p.nome)
  const name = hasLink(p.link) ? `[${title}](${p.link})` : `**${title}**`
  return `- ${name}${subtitle ? ` — ${subtitle}` : ''}: ${clean(p.descricao)}`
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1)

/** /llms.txt — mapa curto em inglês, no formato do llmstxt.org. */
export function llmsTxt(cvEn, cvPt) {
  const c = cvEn.contato
  const resumo = splitResumo(cvEn.resumo)
  const current = cvEn.experiencias.filter((e) => /present/i.test(e.periodo))
  const school = cvEn.formacao[0]
  const out = []

  out.push(`# ${cvEn.nome}`, '')
  out.push(`> ${firstSentence(resumo.intro)} Based in ${c.localizacao}.`, '')
  out.push(
    `Current roles: ` +
      current.map((e) => `${e.cargo} at ${e.empresa.split(',')[0]} (since ${formatPeriod(e.periodo).split(' → ')[0]})`).join('; ') +
      '.',
    '',
    `Education: ${school.curso}, ${school.instituicao.split(',')[0]} (${formatPeriod(school.periodo)}). ` +
      `Languages: ${cvEn.idiomas.map((i) => `${i.idioma} (${i.nivel})`).join(', ')}.`,
    '',
    `Core stack: ${(cvEn.habilidades_grupos?.[0]?.itens ?? cvEn.habilidades).join(', ')}.`,
    '',
    `This site is bilingual: English at ${absUrl(LOCALE_PATHS.en)} and Portuguese (pt-BR) at ${absUrl(LOCALE_PATHS.pt)}. ` +
      `Contact: ${c.email}.`,
    '',
  )

  out.push('## Site', '')
  out.push(
    `- [Portfolio (English)](${absUrl(LOCALE_PATHS.en)}): full CV page — experience, projects, skills, education, contact`,
    `- [CV in Markdown (English)](${absUrl('/en/index.md')}): the same page as clean Markdown`,
    `- [CV PDF (English)](${absUrl(PDF_PATHS.en)})`,
    `- [Portfólio (português)](${absUrl(LOCALE_PATHS.pt)}): página completa em pt-BR`,
    `- [Currículo em Markdown (português)](${absUrl('/index.md')})`,
    `- [Currículo em PDF (português)](${absUrl(PDF_PATHS.pt)})`,
    '',
  )

  out.push('## Experience', '')
  for (const e of cvEn.experiencias) {
    const { bullets: items } = splitTech(e.descricao)
    out.push(`- [${e.cargo} — ${e.empresa.split(',')[0]}](${absUrl('/en/#experiencia')}): ${formatPeriod(e.periodo)}. ${clean(items[0])}`)
  }
  out.push('')

  out.push('## Projects', '')
  for (const p of cvEn.projetos.filter((x) => hasLink(x.link))) {
    const { title, subtitle } = splitTitle(p.nome)
    out.push(`- [${title}](${p.link}): ${subtitle ? `${subtitle}. ` : ''}${firstSentence(p.descricao)}`)
    if (p.pagina) out.push(`  - [${title} case study](${absUrl(projectPath('en', p.slug))}): screenshots, what I did, results and stack`)
  }
  out.push('')

  out.push('## Contact', '')
  out.push(`- [Email](mailto:${c.email}): ${c.email}`, `- [LinkedIn](${c.linkedin})`, `- [GitHub](${c.github})`, '')

  out.push('## Optional', '')
  out.push(`- [Full CV for LLMs (English + Portuguese)](${absUrl('/llms-full.txt')}): complete content in one Markdown file`)
  for (const p of cvEn.projetos_codigo || []) {
    const { title, subtitle } = splitTitle(p.nome)
    out.push(`- [${title}](${p.link}): ${subtitle ? `${subtitle}. ` : ''}${firstSentence(p.descricao)}`)
  }
  for (const h of cvEn.hackathons || []) out.push(`- [${h.nome}](${absUrl('/en/#hackathons')}): ${clean(h.descricao)}`)
  out.push('')

  return out.join('\n')
}

/** /llms-full.txt — currículo completo, EN e depois PT. */
export function llmsFullTxt(cvEn, cvPt) {
  return [
    cvMarkdown(cvEn, 'en'),
    '---',
    '',
    '<!-- Versão em português (pt-BR) -->',
    '',
    cvMarkdown(cvPt, 'pt'),
  ].join('\n')
}
