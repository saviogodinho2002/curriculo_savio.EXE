// Helpers para transformar os textos do curriculum.json em estruturas de UI.

const MONTHS = {
  janeiro: 'jan',
  fevereiro: 'fev',
  março: 'mar',
  marco: 'mar',
  abril: 'abr',
  maio: 'mai',
  junho: 'jun',
  julho: 'jul',
  agosto: 'ago',
  setembro: 'set',
  outubro: 'out',
  novembro: 'nov',
  dezembro: 'dez',
}

/** "• a\n• b" -> ["a", "b"] */
export function bullets(text) {
  return (text || '')
    .split('\n')
    .map((l) => l.replace(/^\s*[•*-]\s*/, '').trim())
    .filter(Boolean)
}

/** Separa a linha "Tecnologias: a, b, c." dos demais bullets. */
export function splitTech(text) {
  const lines = bullets(text)
  const re = /^tecnologias\s*:\s*/i
  const techLine = lines.find((l) => re.test(l))
  const techs = techLine
    ? techLine
        .replace(re, '')
        .replace(/\.$/, '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
    : []
  return { bullets: lines.filter((l) => l !== techLine), techs }
}

function formatDatePart(part) {
  const t = part.trim()
  if (/^presente$/i.test(t)) return 'presente'
  const m = t.match(/^(\S+)\s+de\s+(\d{4})(.*)$/i)
  if (!m) return t.toLowerCase()
  const month = MONTHS[m[1].toLowerCase()] ?? m[1].slice(0, 3).toLowerCase()
  const rest = m[3].trim().toLowerCase()
  return `${month}/${m[2]}${rest ? ` ${rest}` : ''}`
}

/** "Janeiro de 2023 - Presente" -> "jan/2023 → presente" */
export function formatPeriod(period) {
  if (!period) return ''
  return period.split(/\s+-\s+/).map(formatDatePart).join(' → ')
}

/** Divide o resumo em parágrafo de abertura, rótulo e lista de destaques. */
export function splitResumo(resumo) {
  const [intro = '', ...rest] = (resumo || '').split('\n\n')
  const lines = rest.join('\n').split('\n').map((l) => l.trim()).filter(Boolean)
  return {
    intro,
    label: lines.find((l) => !l.startsWith('•')) ?? '',
    highlights: lines.filter((l) => l.startsWith('•')).map((l) => l.replace(/^•\s*/, '')),
  }
}

/** "Nome – descrição longa" -> { title: "Nome", subtitle: "descrição longa" } */
export function splitTitle(name) {
  const [title, ...rest] = (name || '').split(/\s+[–—]\s+/)
  return { title, subtitle: rest.join(' – ') }
}

export function hasLink(link) {
  return Boolean(link) && link !== '#'
}

/** URL -> rótulo curto: repositório do GitHub vira só o nome do repo. */
export function linkLabel(url) {
  const clean = url.replace(/^https?:\/\//, '').replace(/\/$/, '')
  const gh = clean.match(/^github\.com\/[^/]+\/(.+)$/)
  return gh ? gh[1] : clean
}

/**
 * Quebra um texto em trechos, marcando destaques para renderizar sem v-html.
 * Destaca automaticamente métricas (+36,7%, +44%, "de horas para minutos")
 * e, manualmente, qualquer trecho marcado no JSON com **assim**.
 * "gerando +36,7% em…" -> [{ text: 'gerando ' }, { text: '+36,7%', metric: true }, { text: ' em…' }]
 */
const METRIC_RE = /([+-]?\d+(?:[.,]\d+)?%|de horas para minutos)/g
const IS_METRIC = /^(?:[+-]?\d+(?:[.,]\d+)?%|de horas para minutos)$/
const MARK_RE = /\*\*(.+?)\*\*/g

export function highlight(text) {
  const out = []
  ;(text || '').split(MARK_RE).forEach((part, i) => {
    if (!part) return
    // índices ímpares do split = conteúdo entre ** **
    if (i % 2 === 1) {
      out.push({ text: part, metric: true })
      return
    }
    for (const p of part.split(METRIC_RE)) {
      if (p) out.push({ text: p, metric: IS_METRIC.test(p) })
    }
  })
  return out
}

/** Remove as marcações ** ** (para usos em texto puro). */
export function stripMarks(text) {
  return (text || '').replace(MARK_RE, '$1')
}

/** "(93) 99212-1329" -> "+5593992121329" */
export function telHref(phone) {
  return `tel:+55${(phone || '').replace(/\D/g, '')}`
}
