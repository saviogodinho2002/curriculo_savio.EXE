// Gera o README do perfil do GitHub (repo saviogodinho2002/saviogodinho2002) no visual do portfólio:
// monitor CRT de fósforo verde/âmbar, sempre no tema escuro.
// O Markdown do GitHub não aceita CSS nem fontes, então cada seção é um SVG inteiro (janela com
// moldura, título, comando e conteúdo), com as fontes embutidas e animações em CSS. Cada SVG fica
// dentro de um <a>, então continua clicável. Uma seção = um SVG, para não sobrar espaço no meio.
//
// Uso: node scripts/github-readme/build-readme.mjs [pasta-do-repo-do-perfil]
//      (padrão: ../saviogodinho2002, ao lado deste repo)
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const here = fileURLToPath(new URL('./', import.meta.url))
const out = resolve(process.argv[2] || join(root, '../saviogodinho2002'))
const assetsDir = join(out, 'assets')
mkdirSync(assetsDir, { recursive: true })

const read = (p) => readFileSync(join(root, p), 'utf8')
const cv = JSON.parse(read('src/data/curriculum.json'))

const SITE = 'https://curriculo-savio-exe.vercel.app'
const PROFILE = 'https://github.com/saviogodinho2002'
const YEAR = new Date().getFullYear()

// ===== cores: tokens do tema escuro de src/assets/theme.css =====
const c = (() => {
  const css = read('src/assets/theme.css')
  const b = css.slice(css.indexOf(":root[data-theme='dark']")).split('}')[0]
  return Object.fromEntries([...b.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]))
})()

// ===== fontes (embutidas): VT323 nos títulos, IBM Plex Mono no corpo, como no site =====
const b64 = (f) => readFileSync(join(here, f)).toString('base64')
const FONTS = { vt: b64('VT323.woff2'), p4: b64('IBMPlexMono-400.woff2'), p7: b64('IBMPlexMono-700.woff2') }
const FALLBACK = `ui-monospace, 'SFMono-Regular', Menlo, Consolas, 'Liberation Mono', monospace`
// as duas são monoespaçadas: dá para medir texto e quebrar linha com exatidão
const ADV = { vt: 0.4, plex: 0.6 } // avanço de cada glifo, em em
const textW = (s, size, font = 'plex') => [...s].length * size * ADV[font]

const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch])

function wrap(text, cols) {
  const lines = []
  let line = ''
  for (const word of String(text).split(/\s+/)) {
    if (!line) line = word
    else if ([...line].length + 1 + [...word].length <= cols) line += ' ' + word
    else {
      lines.push(line)
      line = word
    }
  }
  if (line) lines.push(line)
  return lines
}

function style(extra = '') {
  return `<style>
@font-face{font-family:VT;src:url(data:font/woff2;base64,${FONTS.vt}) format('woff2')}
@font-face{font-family:Plex;font-weight:400;src:url(data:font/woff2;base64,${FONTS.p4}) format('woff2')}
@font-face{font-family:Plex;font-weight:700;src:url(data:font/woff2;base64,${FONTS.p7}) format('woff2')}
.d{font-family:VT, ${FALLBACK}}.m{font-family:Plex, ${FALLBACK}}.b{font-weight:700}
.fg{fill:${c.fg}}.mu{fill:${c.muted}}.ac{fill:${c.accent}}
@keyframes blink{50%{opacity:0}}
@keyframes inp{from{opacity:0}to{opacity:1}}
@keyframes seq{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@keyframes flick{0%,100%{opacity:1}48%{opacity:1}50%{opacity:.95}52%{opacity:1}}
@keyframes s1{0%{opacity:1}33%{opacity:0}100%{opacity:0}}
@keyframes s2{0%{opacity:0}33%{opacity:1}66%{opacity:0}100%{opacity:0}}
@keyframes s3{0%{opacity:0}66%{opacity:1}100%{opacity:1}}
.cur{animation:blink 1.06s step-end infinite}
.screen{animation:flick 6s infinite}
.n1{animation:s1 .5s step-end both}.n2{animation:s2 .5s step-end both}.fin{animation:s3 .5s step-end both}
${extra}
@media (prefers-reduced-motion:reduce){*{animation:none!important}.noise{display:none}}
</style>`
}

const DEFS = `<filter id="glow" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="1.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<pattern id="scan" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="${c.scanline}"/></pattern>
<radialGradient id="vig" cx="50%" cy="50%" r="80%"><stop offset="65%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity=".4"/></radialGradient>`
const OVERLAY = (w, h) =>
  `<rect width="${w}" height="${h}" fill="url(#scan)" pointer-events="none"/><rect width="${w}" height="${h}" fill="url(#vig)" pointer-events="none"/>`

const seq = (i, base = 0.75) => `style="animation:seq .4s ${(base + i * 0.08).toFixed(2)}s both"`
const typed = (s, start) =>
  [...s].map((ch, i) => `<tspan style="animation:inp .01s ${(start + i * 0.035).toFixed(3)}s both">${esc(ch)}</tspan>`).join('')
const prompt = (x, y, cmd, start = 0.55) =>
  `<text x="${x}" y="${y}" class="m" font-size="15"><tspan class="ac">savio@godinho</tspan><tspan class="fg">:~$ ${typed(cmd, start)}</tspan><tspan class="fg cur">█</tspan></text>`

// ruído do "descriptografar" do título (ScrambleText do site)
const GLITCH = '▓▒░█▚▞▙▟'
const noise = (s, keep) => [...s].map((ch, i) => (ch === ' ' || i < keep ? ch : GLITCH[(i * 7 + keep * 3) % GLITCH.length])).join('')

const W = 960
const PAD = 24

// ===== janela: moldura com ╡NN. título╞ cortando a borda de cima, [_][□][×] e o comando =====
// body(y0) devolve { svg, h } com o conteúdo desenhado a partir de y0
function windowSvg({ index, title, cmd, body, label }) {
  const top = 16
  const cmdY = top + 42
  const y0 = cmd ? cmdY + 30 : top + 30
  const { svg: content, h: ch } = body(y0)
  const H = y0 + ch + PAD
  const halo = `stroke="${c.bg}" stroke-width="14" paint-order="stroke" stroke-linejoin="round"`
  const t = (s) =>
    `<text x="${PAD - 4}" y="${top + 9}" class="d" font-size="28" ${halo}><tspan class="ac">╡${index}.</tspan><tspan class="fg"> ${esc(s)}</tspan><tspan class="ac">╞</tspan></text>`
  const n = [...title].length
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label || `${index}. ${title}`)}">
<title>${esc(label || `${index}. ${title}`)}</title>
${style()}
<defs>${DEFS}</defs>
<rect width="${W}" height="${H}" fill="${c.bg}"/>
<rect x=".5" y="${top + 0.5}" width="${W - 1}" height="${H - top - 1}" fill="none" stroke="${c.border}"/>
<g class="screen">
<g filter="url(#glow)">
<g class="noise n1">${t(noise(title, 0))}</g>
<g class="noise n2">${t(noise(title, Math.ceil(n / 2)))}</g>
<g class="fin">${t(title)}</g>
<text x="${W - PAD + 4}" y="${top + 6}" class="m mu" font-size="14" text-anchor="end" ${halo}>[_][□][×]</text>
${cmd ? prompt(PAD, cmdY, cmd) : ''}
</g>
${content}
</g>
${OVERLAY(W, H)}
</svg>
`
}

// botão no estilo .btn do site, desenhado dentro do SVG
function btn(x, y, label, accent = false, size = 13) {
  const w = textW(label, size) + 22
  const col = accent ? c.accent : c.fg
  return {
    w,
    svg: `<rect x="${x + 0.5}" y="${y + 0.5}" width="${w}" height="${size + 15}" fill="none" stroke="${accent ? c.accent : c.border}"/>
<text x="${x + 11.5}" y="${y + size + 5}" class="m b" font-size="${size}" fill="${col}">${esc(label)}</text>`,
  }
}

// ===== hero: saída do neofetch =====
// No lugar do "logo da distro" vai um monograma SG em pontos (a foto em dot art fica só no site;
// no GitHub o avatar já mostra o rosto). Cada pixel do bitmap vira 2×2 pontos redondos.
const MONOGRAM = [
  ' #####    ##### ',
  '##   ##  ##   ##',
  '##       ##     ',
  ' ####    ##     ',
  '   ###   ## ####',
  '     ##  ##   ##',
  '     ##  ##   ##',
  '##   ##  ##   ##',
  ' #####    ######',
]
function monogramPath() {
  // ponto = segmento de comprimento zero com ponta redonda
  let d = ''
  MONOGRAM.forEach((row, y) =>
    [...row].forEach((ch, x) => {
      if (ch !== '#') return
      for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) d += `M${x * 2 + dx} ${y * 2 + dy}h0`
    }),
  )
  return { d, w: MONOGRAM[0].length * 2, h: MONOGRAM.length * 2 }
}

function hero() {
  const H = 452
  const art = monogramPath()
  const pitch = 8
  const ax = 40
  const ay = 160
  const rows = [
    ['cargo', cv.titulo],
    ['empresa', cv.empresa_atual],
    ['local', cv.contato.localizacao],
    ['formação', cv.formacao?.[0]?.curso],
    ['stack', cv.habilidades.slice(0, 5).join(' · ')],
    ['email', cv.contato.email],
  ].filter((r) => r[1])
  const X = 345
  const s = (i) => seq(i, 1.05)
  const kv = rows
    .map(
      ([k, v], i) => `<g ${s(i + 2)}><text x="${X}" y="${206 + i * 30}" class="m b ac" font-size="15">${esc(k)}</text><text x="${X + 92}" y="${206 + i * 30}" class="m fg" font-size="15">${esc(v)}</text></g>`,
    )
    .join('\n')
  const sw = ['fg', 'muted', 'accent', 'border', 'surface', 'bg']
    .map((t, i) => `<rect x="${X + i * 34}" y="388" width="30" height="16" fill="${c[t]}" stroke="${c.border}" stroke-width=".6"/>`)
    .join('')
  const nameW = textW(cv.nome, 58, 'vt')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(`${cv.nome}, ${cv.titulo}`)}">
<title>${esc(`${cv.nome} · ${cv.titulo}`)}</title>
${style()}
<defs>${DEFS}</defs>
<rect width="${W}" height="${H}" fill="${c.bg}"/>
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" fill="none" stroke="${c.border}"/>
<rect x="1" y="1" width="${W - 2}" height="32" fill="${c.surface}"/>
<line x1="0" y1="33.5" x2="${W}" y2="33.5" stroke="${c.border}"/>
<text x="16" y="23" class="d" font-size="20"><tspan class="ac">[0]</tspan><tspan class="fg" dx="8">savio@godinho: ~</tspan></text>
<text x="${W - 16}" y="22" class="m mu" font-size="14" text-anchor="end">[_][□][×]</text>
<g class="screen">
<path d="${art.d}" transform="translate(${ax} ${ay}) scale(${pitch})" stroke="${c.fg}" stroke-width=".7" stroke-linecap="round" fill="none" filter="url(#glow)"/>
<text x="${ax + (art.w * pitch) / 2}" y="${ay + art.h * pitch + 22}" class="m mu" font-size="12" text-anchor="middle">[ ${esc(SITE.replace('https://', ''))} ]</text>
<g filter="url(#glow)">
<text x="${X}" y="84" class="m" font-size="16"><tspan class="ac">savio@godinho</tspan><tspan class="fg">:~$ ${typed('neofetch', 0.35)}</tspan></text>
<g ${s(0)}>
  <text x="${X - 2}" y="146" class="d fg" font-size="58">${esc(cv.nome)}</text>
  <rect class="cur" x="${(X + 4 + nameW).toFixed(1)}" y="108" width="22" height="40" fill="${c.fg}" opacity=".85"/>
</g>
<line ${s(1)} x1="${X}" y1="166.5" x2="${W - 34}" y2="166.5" stroke="${c.border}" stroke-dasharray="6 4"/>
${kv}
<g ${s(rows.length + 2)}>${sw}</g>
<text ${s(rows.length + 3)} x="${X}" y="432" class="m mu" font-size="13">&gt; engenheiro de software · Santarém, Amazônia</text>
</g>
</g>
${OVERLAY(W, H)}
</svg>
`
}

// ===== botões de contato (um SVG por botão, colados no README) =====
function contactBtn(label, accent) {
  const size = 14
  const w = Math.ceil(textW(label, size) + 30)
  const H = 38
  const col = accent ? c.accent : c.fg
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${H}" viewBox="0 0 ${w} ${H}" role="img" aria-label="${esc(label)}">
<title>${esc(label)}</title>
${style()}
<defs>${DEFS}</defs>
<rect width="${w}" height="${H}" fill="${c.bg}"/>
<rect x=".5" y=".5" width="${w - 1}" height="${H - 1}" fill="${accent ? c.surface : c.bg}" stroke="${accent ? c.accent : c.border}"/>
<text x="15" y="24" class="m b" font-size="${size}" fill="${col}" filter="url(#glow)">${esc(label)}</text>
${OVERLAY(w, H)}
</svg>
`
}

// ===== 01. sobre =====
const ABOUT = `Engenheiro de software construindo SaaS para transporte fluvial e gestão portuária na Amazônia. Faço parte da equipe que projetou e desenvolve um ecossistema que conecta venda de passagens, emissão fiscal (BP-e/SEFAZ), pagamentos, gestão portuária, controle financeiro e controle de acesso físico, usado por empresas de navegação, agências, portos e passageiros. Trabalho na W3 Companhia desde 2023 e, em paralelo, atendo projetos freelance de gestão financeira e de educação com IA.`
const ABOUT_LINK = 'https://w3companhia.com/blog/yjara-viagens-inovacao-sustentavel-e-inclusiva-no-transporte-fluvial-amazonico-com-o-apoio-do-ciat'

function about(y0) {
  const size = 15
  const lh = 25
  const lines = wrap(ABOUT, Math.floor((W - 2 * PAD) / (size * ADV.plex)))
  let svg = lines.map((l, i) => `<text ${seq(i)} x="${PAD}" y="${y0 + 12 + i * lh}" class="m fg" font-size="${size}">${esc(l)}</text>`).join('\n')
  const ly = y0 + 12 + lines.length * lh + 10
  const b = btn(PAD, ly - 16, '[ saiba mais: Yjara Viagens no blog da W3 ↗ ]', true)
  svg += `\n<g ${seq(lines.length)}>${b.svg}</g>`
  return { svg, h: ly + 14 - y0 }
}

// ===== cards (projetos e código): grid de 2 colunas dentro da janela =====
const COLS = 2
const GAP = 20
const CW = (W - 2 * PAD - GAP * (COLS - 1)) / COLS
const split = (nome) => {
  const [title, ...rest] = nome.split(' – ')
  return { title: title.trim(), subtitle: rest.join(' – ').trim() }
}

function card(p, x, y, i, { shot, buttons }) {
  const { title, subtitle } = split(p.nome)
  const ip = 16
  const imgH = shot ? Math.round((CW * 10) / 16) : 0
  const descSize = 14
  const desc = wrap(p.descricao, Math.floor((CW - 2 * ip) / (descSize * ADV.plex)))
  let yy = y + imgH + ip + 22
  let s = ''
  if (shot) {
    const id = `clip${i}`
    s += `<clipPath id="${id}"><rect x="${x + 1}" y="${y + 1}" width="${CW - 2}" height="${imgH - 1}"/></clipPath>
<image href="data:image/webp;base64,${shot}" x="${x + 1}" y="${y + 1}" width="${CW - 2}" height="${imgH}" preserveAspectRatio="xMidYMin slice" clip-path="url(#${id})"/>
<rect x="${x + 1}" y="${y + 1}" width="${CW - 2}" height="${imgH - 1}" fill="url(#scan)"/>
<line x1="${x}" y1="${y + imgH + 0.5}" x2="${x + CW}" y2="${y + imgH + 0.5}" stroke="${c.border}"/>`
  }
  s += `<g filter="url(#glow)">
<text x="${x + ip}" y="${yy}" class="d" font-size="27"><tspan class="ac">▸ </tspan><tspan class="fg">${esc(title)}</tspan></text>`
  yy += 22
  if (subtitle) {
    const sub = wrap(subtitle, Math.floor((CW - 2 * ip) / (13 * ADV.plex)))
    s += sub.map((l, k) => `<text x="${x + ip}" y="${yy + k * 18}" class="m mu" font-size="13">${esc(l)}</text>`).join('')
    yy += 14 + (sub.length - 1) * 18
  }
  s += `</g><line x1="${x + ip}" y1="${yy + 0.5}" x2="${x + CW - ip}" y2="${yy + 0.5}" stroke="${c.border}" stroke-dasharray="4 3"/>`
  yy += 24
  s += desc.map((l, k) => `<text x="${x + ip}" y="${yy + k * 21}" class="m fg" font-size="${descSize}">${esc(l)}</text>`).join('\n')
  const bodyEnd = yy + (desc.length - 1) * 21
  return { s, bodyEnd, buttons, x, y, ip }
}

function cardGrid(items, y0, opts) {
  let svg = ''
  let y = y0 + 4
  for (let r = 0; r < Math.ceil(items.length / COLS); r++) {
    const row = items.slice(r * COLS, r * COLS + COLS).map((p, k) => card(p, PAD + k * (CW + GAP), y, r * COLS + k, opts(p)))
    // todos os cards da linha com a mesma altura (rodapé alinhado)
    const footY = Math.max(...row.map((cd) => cd.bodyEnd)) + 22
    const h = footY + 28 + 16 - y
    row.forEach((cd, k) => {
      let bx = cd.x + cd.ip
      const btns = cd.buttons
        .map(([label, accent]) => {
          const b = btn(bx, footY, label, accent)
          bx += b.w + 10
          return b.svg
        })
        .join('')
      svg += `<g ${seq(r * COLS + k, 0.8)}>
<rect x="${cd.x + 0.5}" y="${cd.y + 0.5}" width="${CW - 1}" height="${h - 1}" fill="${c.bg}" stroke="${c.border}"/>
${cd.s}
<g filter="url(#glow)">${btns}</g>
</g>\n`
    })
    y += h + GAP
  }
  return { svg, h: y - GAP - y0 }
}

const shotOf = (p) => {
  try {
    return readFileSync(join(root, 'public', `${p.imagem}-card.webp`)).toString('base64')
  } catch {
    return null
  }
}
const hasLink = (l) => l && l !== '#'

// ===== 03. stack: grupos de chips =====
function stack(y0) {
  let y = y0 + 6
  let svg = ''
  let n = 0
  for (const g of cv.habilidades_grupos) {
    svg += `<text ${seq(n++)} x="${PAD}" y="${y + 14}" class="d ac" font-size="24" filter="url(#glow)">## ${esc(g.grupo)}</text>`
    y += 30
    let x = PAD
    const chips = []
    for (const item of g.itens) {
      const w = textW(item, 14) + 26
      if (x + w > W - PAD) {
        x = PAD
        y += 40
      }
      chips.push(`<rect x="${x + 0.5}" y="${y + 0.5}" width="${w}" height="30" fill="${c.surface}" stroke="${c.border}"/>
<text x="${x + 13}" y="${y + 20}" class="m fg" font-size="14">${esc(item)}</text>`)
      x += w + 10
    }
    svg += `<g ${seq(n++)} filter="url(#glow)">${chips.join('')}</g>`
    y += 30 + 26
  }
  svg += `<text ${seq(n)} x="${PAD}" y="${y + 6}" class="m mu" font-size="14">&gt; no trabalho uso o stack acima · no tempo livre gosto de explorar Java e Kotlin</text>`
  return { svg, h: y + 12 - y0 }
}

// ===== 05. formação =====
function education(y0) {
  const years = (periodo) => {
    const ys = periodo.match(/\d{4}/g) || []
    return /presente/i.test(periodo) ? `${ys[0]} – atual` : ys.join(' – ')
  }
  let y = y0 + 14
  let svg = ''
  cv.formacao.forEach((f, i) => {
    const inst = f.instituicao.split(',')[0]
    const yrs = `[ ${years(f.periodo)} ]`
    svg += `<g ${seq(i)} filter="url(#glow)">
<text x="${PAD}" y="${y}" class="m b" font-size="16"><tspan class="ac">▸ </tspan><tspan class="fg">${esc(f.curso)}</tspan></text>
<text x="${W - PAD}" y="${y}" class="m ac" font-size="14" text-anchor="end">${esc(yrs)}</text>
<text x="${PAD + 20}" y="${y + 24}" class="m mu" font-size="14">${esc(inst)}</text>`
    y += 24
    const desc = f.curso.startsWith('Mestrado') ? f.descricao.replace(/^•\s*/, '').split('\n')[0] : ''
    if (desc) {
      svg += `<text x="${PAD + 20}" y="${y + 22}" class="m fg" font-size="14">${esc(desc)}</text>`
      y += 22
    }
    svg += '</g>'
    y += 40
  })
  return { svg, h: y - 40 + 8 - y0 }
}

// ===== barra de janela solta (seção de stats, cujo conteúdo são imagens externas) =====
function windowBar(index, title, cmd) {
  const H = 72
  const halo = `stroke="${c.bg}" stroke-width="14" paint-order="stroke" stroke-linejoin="round"`
  const t = (s) =>
    `<text x="${PAD - 4}" y="25" class="d" font-size="28" ${halo}><tspan class="ac">╡${index}.</tspan><tspan class="fg"> ${esc(s)}</tspan><tspan class="ac">╞</tspan></text>`
  const n = [...title].length
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(`${index}. ${title}`)}">
<title>${esc(`${index}. ${title}`)}</title>
${style()}
<defs>${DEFS}</defs>
<rect width="${W}" height="${H}" fill="${c.bg}"/>
<line x1="0" y1="16.5" x2="${W}" y2="16.5" stroke="${c.border}"/>
<g filter="url(#glow)">
<g class="noise n1">${t(noise(title, 0))}</g>
<g class="noise n2">${t(noise(title, Math.ceil(n / 2)))}</g>
<g class="fin">${t(title)}</g>
<text x="${W - PAD + 4}" y="22" class="m mu" font-size="14" text-anchor="end" ${halo}>[_][□][×]</text>
${prompt(PAD, 58, cmd)}
</g>
${OVERLAY(W, H)}
</svg>
`
}

// ===== statusbar estilo vim =====
function statusbar() {
  const H = 60
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="statusbar">
<title>NORMAL · README.md · © ${YEAR} ${esc(cv.nome)}</title>
${style()}
<defs>${DEFS}</defs>
<rect width="${W}" height="${H}" fill="${c.bg}"/>
<rect x="0" y="0" width="${W}" height="28" fill="${c.surface}"/>
<line x1="0" y1=".5" x2="${W}" y2=".5" stroke="${c.border}"/>
<line x1="0" y1="28.5" x2="${W}" y2="28.5" stroke="${c.border}"/>
<rect x="0" y="1" width="86" height="27" fill="${c.fg}"/>
<text x="43" y="20" class="m b" font-size="14" fill="${c.bg}" text-anchor="middle">NORMAL</text>
<text x="100" y="20" class="m fg" font-size="14">README.md</text>
<text x="${W - 12}" y="20" class="m mu" font-size="13" text-anchor="end">utf-8 │ pt-BR │ © ${YEAR} ${esc(cv.nome)}</text>
<g filter="url(#glow)">
<text x="4" y="50" class="m fg" font-size="14">:e ${esc(SITE.replace('https://', ''))}<tspan class="cur">█</tspan></text>
<text x="${W - 12}" y="50" class="m mu" font-size="13" text-anchor="end">:0 ↑ topo</text>
</g>
${OVERLAY(W, H)}
</svg>
`
}

// ===== escreve os SVGs (apaga os antigos, inclusive os -light de versões anteriores) =====
for (const f of readdirSync(assetsDir)) if (f.endsWith('.svg')) rmSync(join(assetsDir, f))
// o nome leva um hash do conteúdo: o GitHub guarda as imagens em cache pelo endereço, então
// cada mudança precisa virar um arquivo novo para aparecer na hora
const sizes = {}
const FILES = {}
const put = (name, svg) => {
  const hash = createHash('sha1').update(svg).digest('hex').slice(0, 8)
  const file = name.replace(/\.svg$/, `.${hash}.svg`)
  writeFileSync(join(assetsDir, file), svg)
  FILES[name] = file
  sizes[file] = Buffer.byteLength(svg)
}

put('hero.svg', hero())

const CONTACTS = [
  ['[ portfólio ↗ ]', true, SITE, 'btn-portfolio'],
  ['[ linkedin ]', false, cv.contato.linkedin, 'btn-linkedin'],
  ['[ email ]', false, `mailto:${cv.contato.email}`, 'btn-email'],
  ['[ instagram ]', false, 'https://www.instagram.com/savogodinho.targz/', 'btn-instagram'],
]
for (const [label, accent, , file] of CONTACTS) put(`${file}.svg`, contactBtn(label, accent))

put('sobre.svg', windowSvg({ index: '01', title: 'sobre', cmd: 'cat sobre.md', body: about }))
put(
  'projetos.svg',
  windowSvg({
    index: '02',
    title: 'projetos',
    cmd: 'ls -la ~/projetos',
    body: (y0) =>
      cardGrid(cv.projetos, y0, (p) => ({
        shot: shotOf(p),
        buttons: [['[ detalhes ]', true], ...(hasLink(p.link) ? [['[ abrir ↗ ]', false]] : [])],
      })),
  }),
)
put('stack.svg', windowSvg({ index: '03', title: 'stack', cmd: 'cat stack.txt', body: stack }))
put(
  'codigo.svg',
  windowSvg({
    index: '04',
    title: 'código no github',
    cmd: 'gh repo list saviogodinho2002 --public',
    body: (y0) => cardGrid(cv.projetos_codigo, y0, () => ({ shot: null, buttons: [['[ github ↗ ]', true]] })),
  }),
)
put('formacao.svg', windowSvg({ index: '05', title: 'formação', cmd: 'cat formacao.md', body: education }))
put('stats.svg', windowBar('06', 'stats', 'git log --oneline | wc -l'))
put('statusbar.svg', statusbar())

// ===== README.md =====
// sem espaço nem quebra entre as tags: o GitHub não deixa buraco entre as imagens
const img = (file, alt, href, attrs = 'width="100%"') => `<a href="${href}"><img src="assets/${FILES[file]}"alt="${esc(alt)}" ${attrs}></a>`
const hex = (s) => s.replace('#', '')
const statsQ = `bg_color=${hex(c.bg)}&title_color=${hex(c.accent)}&text_color=${hex(c.fg)}&icon_color=${hex(c.fg)}&border_color=${hex(c.border)}&ring_color=${hex(c.accent)}`
const streakQ = `background=${hex(c.bg)}&border=${hex(c.border)}&stroke=${hex(c.border)}&ring=${hex(c.accent)}&fire=${hex(c.accent)}&currStreakNum=${hex(c.fg)}&sideNums=${hex(c.fg)}&currStreakLabel=${hex(c.accent)}&sideLabels=${hex(c.muted)}&dates=${hex(c.muted)}`
const STATS = `https://github-readme-stats-drab-seven-40.vercel.app/api?username=saviogodinho2002&count_private=true&show_icons=true&rank_icon=github&border_radius=0&${statsQ}`
const STREAK = `https://github-readme-streak-stats-savio.vercel.app/?user=saviogodinho2002&count_private=true&border_radius=0&${streakQ}`
const VISITS = `https://visitor-badge.laobi.icu/badge?page_id=saviogodinho2002.saviogodinho2002&left_text=visitas&left_color=%23${hex(c.surface)}&right_color=%23${hex(c.border)}`

const readme = `<!-- Gerado por scripts/github-readme/build-readme.mjs (repo do portfólio). Edite lá e rode de novo. -->

${img('hero.svg', `${cv.nome}, ${cv.titulo}. Abrir o portfólio`, SITE)}

<p align="center">${CONTACTS.map(([label, , href, file]) => img(`${file}.svg`, label, href, 'height="38"')).join('')}<img src="${VISITS}" alt="visitas" height="38"></p>

${img('sobre.svg', '01. sobre', ABOUT_LINK)}

${img('projetos.svg', '02. projetos', `${SITE}/#projetos`)}

${img('stack.svg', '03. stack', `${SITE}/#skills`)}

${img('codigo.svg', '04. código no github', `${PROFILE}?tab=repositories`)}

${img('formacao.svg', '05. formação', `${SITE}/#formacao`)}

${img('stats.svg', '06. stats', `${PROFILE}?tab=repositories`)}<br><a href="${PROFILE}"><img width="49.5%" src="${STREAK}" alt="streak stats"></a><a href="${PROFILE}"><img width="49.5%" src="${STATS}" alt="GitHub stats"></a>

${img('statusbar.svg', `NORMAL · README.md · © ${YEAR} ${cv.nome}`, SITE)}
`
writeFileSync(join(out, 'README.md'), readme)

console.log(`README + ${Object.keys(sizes).length} SVGs em ${out}`)
for (const [n, s] of Object.entries(sizes)) console.log(`  ${n.padEnd(20)} ${(s / 1024).toFixed(1)} KB`)
