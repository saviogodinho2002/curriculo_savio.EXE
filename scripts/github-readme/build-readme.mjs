// Gera o README do perfil do GitHub (repo saviogodinho2002/saviogodinho2002) no visual do portfólio:
// monitor CRT de fósforo verde/âmbar no tema escuro e "papel matricial" no claro.
// O Markdown do GitHub não aceita CSS nem fontes, então o visual vai em SVGs (hero neofetch,
// barras de janela e statusbar) e os links continuam em HTML/Markdown, clicáveis.
//
// Uso: node scripts/github-readme/build-readme.mjs [pasta-do-repo-do-perfil]
//      (padrão: ../saviogodinho2002, ao lado deste repo)
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const here = fileURLToPath(new URL('./', import.meta.url))
const out = resolve(process.argv[2] || join(root, '../saviogodinho2002'))
const assetsDir = join(out, 'assets')
mkdirSync(assetsDir, { recursive: true })

const read = (p) => readFileSync(join(root, p), 'utf8')
const cv = JSON.parse(read('src/data/curriculum.json'))
const ART = { dark: read('src/data/dot-art-dark.txt').trimEnd(), light: read('src/data/dot-art-light.txt').trimEnd() }

const SITE = 'https://curriculo-savio-exe.vercel.app'
const PROFILE = 'https://github.com/saviogodinho2002'
const YEAR = new Date().getFullYear()

// ===== cores: lidas de src/assets/theme.css (mesmos tokens do site) =====
function themeTokens() {
  const css = read('src/assets/theme.css')
  const block = (sel) => css.slice(css.indexOf(sel)).split('}')[0]
  const pick = (b) => Object.fromEntries([...b.matchAll(/--([\w-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]))
  return { dark: pick(block(":root[data-theme='dark']")), light: pick(block(":root[data-theme='light']")) }
}
const THEMES = themeTokens()

const FONT = readFileSync(join(here, 'VT323.woff2')).toString('base64')
const MONO = `ui-monospace, 'SFMono-Regular', Menlo, Consolas, 'Liberation Mono', monospace`
const DISPLAY = `VT, ${MONO}`
const VT_ADVANCE = 0.4 // VT323 é monoespaçada: todo glifo avança 400/1000 em

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

// CSS comum a todos os SVGs: fonte embutida, brilho de fósforo e respeito a prefers-reduced-motion
function baseStyle(c, extra = '') {
  return `<style>
@font-face{font-family:VT;src:url(data:font/woff2;base64,${FONT}) format('woff2')}
.d{font-family:${DISPLAY}}.m{font-family:${MONO}}
.fg{fill:${c.fg}}.mu{fill:${c.muted}}.ac{fill:${c.accent}}.bd{fill:${c.border}}
@keyframes blink{50%{opacity:0}}
@keyframes inp{from{opacity:0}to{opacity:1}}
@keyframes seq{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:none}}
@keyframes flick{0%,100%{opacity:1}48%{opacity:1}50%{opacity:.94}52%{opacity:1}}
.cur{animation:blink 1.06s step-end infinite}
${extra}
@media (prefers-reduced-motion:reduce){*{animation:none!important}.noise{display:none}}
</style>`
}

// filtro de brilho (text-shadow do site); no tema claro não há brilho
const glowDefs = (dark) =>
  dark
    ? `<filter id="glow" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="1.6" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`
    : ''
const glow = (dark) => (dark ? ' filter="url(#glow)"' : '')

// fundo de tela: scanlines + vinheta (escuro) ou faixas de formulário contínuo (claro)
function screenFx(c, dark, w, h) {
  if (dark) {
    return {
      defs: `<pattern id="scan" width="4" height="3" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="${c.scanline}"/></pattern>
<radialGradient id="vig" cx="50%" cy="50%" r="75%"><stop offset="60%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity=".45"/></radialGradient>`,
      over: `<rect width="${w}" height="${h}" fill="url(#scan)" pointer-events="none"/><rect width="${w}" height="${h}" fill="url(#vig)" pointer-events="none"/>`,
      under: '',
    }
  }
  return {
    defs: `<pattern id="stripe" width="${w}" height="48" patternUnits="userSpaceOnUse"><rect width="${w}" height="24" fill="${c.stripe}"/></pattern>`,
    over: '',
    under: `<rect width="${w}" height="${h}" fill="url(#stripe)"/>`,
  }
}

// furos de arrasto do formulário contínuo, nas margens (só no tema claro)
const holes = (c, w, h, top = 18) => {
  let s = ''
  for (let y = top; y < h - 6; y += 24) s += `<circle cx="9" cy="${y}" r="4"/><circle cx="${w - 9}" cy="${y}" r="4"/>`
  return `<g fill="${c.hole}" stroke="${c.border}" stroke-width=".6">${s}</g>`
}

// ===== dot art: cada caractere braille vira 2×4 pontos redondos =====
// bits do braille Unicode: 1,2,3,7 na coluna esquerda; 4,5,6,8 na direita
const DOTS = [
  [0, 0, 0], [1, 0, 1], [2, 0, 2], [3, 1, 0],
  [4, 1, 1], [5, 1, 2], [6, 0, 3], [7, 1, 3],
] // [bit, x, y]
function dotPath(art) {
  const rows = new Map()
  art.split('\n').forEach((line, cy) => {
    ;[...line].forEach((ch, cx) => {
      const code = ch.codePointAt(0) - 0x2800
      if (code <= 0 || code > 0xff) return
      for (const [bit, dx, dy] of DOTS) {
        if (!(code & (1 << bit))) continue
        const x = cx * 2 + dx
        const y = cy * 4 + dy
        if (!rows.has(y)) rows.set(y, [])
        rows.get(y).push(x)
      }
    })
  })
  // ponto = segmento de comprimento zero com ponta redonda; "m3 0h0" anda 3 colunas e desenha
  let d = ''
  for (const [y, xs] of [...rows].sort((a, b) => a[0] - b[0])) {
    xs.sort((a, b) => a - b)
    d += `M${xs[0]} ${y}h0`
    for (let i = 1; i < xs.length; i++) d += `m${xs[i] - xs[i - 1]} 0h0`
  }
  const lines = art.split('\n')
  return { d, w: Math.max(...lines.map((l) => [...l].length)) * 2, h: lines.length * 4 }
}

// ===== hero: saída do neofetch =====
function hero(theme) {
  const c = THEMES[theme]
  const dark = theme === 'dark'
  const W = 960
  const H = 452
  const fx = screenFx(c, dark, W, H)
  const art = dotPath(ART[theme])
  const pitch = 1.8
  const ax = 30
  const ay = 62

  const k = { cargo: 'cargo', empresa: 'empresa', local: 'local', formacao: 'formação', stack: 'stack', email: 'email' }
  const rows = [
    [k.cargo, cv.titulo],
    [k.empresa, cv.empresa_atual],
    [k.local, cv.contato.localizacao],
    [k.formacao, cv.formacao?.[0]?.curso],
    [k.stack, cv.habilidades.slice(0, 5).join(' · ')],
    [k.email, cv.contato.email],
  ].filter((r) => r[1])

  const X = 440
  const cmd = 'neofetch'
  const typed = [...cmd]
    .map((ch, i) => `<tspan style="animation:inp .01s ${(0.35 + i * 0.07).toFixed(2)}s both">${esc(ch)}</tspan>`)
    .join('')
  const seq = (i) => `style="animation:seq .35s ${(1.05 + i * 0.12).toFixed(2)}s both"`

  const kv = rows
    .map(
      ([key, val], i) => `<g ${seq(i + 2)}>
  <text x="${X}" y="${206 + i * 30}" class="m ac" font-size="15" font-weight="700">${esc(key)}</text>
  <text x="${X + 92}" y="${206 + i * 30}" class="m fg" font-size="15">${esc(val)}</text>
</g>`,
    )
    .join('\n')

  const sw = ['fg', 'muted', 'accent', 'border', 'surface', 'bg']
    .map((t, i) => `<rect x="${X + i * 34}" y="388" width="30" height="16" fill="${c[t]}" stroke="${c.border}" stroke-width=".6"/>`)
    .join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(`${cv.nome}, ${cv.titulo}`)}">
<title>${esc(`${cv.nome} · ${cv.titulo}`)}</title>
${baseStyle(c, dark ? '.screen{animation:flick 5s infinite}' : '')}
<defs>${glowDefs(dark)}${fx.defs}</defs>
<rect width="${W}" height="${H}" fill="${c.bg}"/>
${fx.under}
${dark ? '' : holes(c, W, H, 54)}
<rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" fill="none" stroke="${c.border}"/>
<!-- barra da janela -->
<rect x="1" y="1" width="${W - 2}" height="32" fill="${c.surface}"/>
<line x1="0" y1="33.5" x2="${W}" y2="33.5" stroke="${c.border}"/>
<text x="16" y="23" class="d" font-size="20"><tspan class="ac">[0]</tspan><tspan class="fg" dx="8">savio@godinho: ~</tspan></text>
<text x="${W - 16}" y="23" class="m mu" font-size="14" text-anchor="end">[_][□][×]</text>

<g class="screen">
<!-- dot art -->
<path d="${art.d}" transform="translate(${ax} ${ay}) scale(${pitch})" stroke="${c.fg}" stroke-width=".72" stroke-linecap="round" fill="none"${glow(dark)}/>
<text x="${ax + (art.w * pitch) / 2}" y="${ay + art.h * pitch + 22}" class="m mu" font-size="12" text-anchor="middle">[ ${esc(SITE.replace('https://', ''))} ]</text>

<g${glow(dark)}>
<!-- prompt -->
<text x="${X}" y="84" class="m" font-size="16"><tspan class="ac">savio@godinho</tspan><tspan class="fg">:~$ </tspan><tspan class="fg">${typed}</tspan></text>
<!-- nome + cursor -->
<g ${seq(0)}>
  <text x="${X - 2}" y="146" class="d fg" font-size="58">${esc(cv.nome)}</text>
  <rect class="cur" x="${(X + 4 + [...cv.nome].length * 58 * VT_ADVANCE).toFixed(1)}" y="108" width="22" height="40" fill="${c.fg}" opacity=".85"/>
</g>
<line ${seq(1)} x1="${X}" y1="166.5" x2="${W - 34}" y2="166.5" stroke="${c.border}" stroke-dasharray="6 4"/>
${kv}
<g ${seq(rows.length + 2)}>${sw}</g>
<text ${seq(rows.length + 3)} x="${X}" y="432" class="m mu" font-size="13">&gt; ${esc('engenheiro de software · Santarém, Amazônia')}</text>
</g>
</g>
${fx.over}
</svg>
`
}

// ===== barra de janela de cada seção: ╡01. título╞ ─── [_][□][×] + linha de comando =====
const GLITCH = '▓▒░█▚▞▙▟'
const noise = (s, keep) =>
  [...s].map((ch, i) => (ch === ' ' || i < keep ? ch : GLITCH[(i * 7 + keep * 3) % GLITCH.length])).join('')

function windowBar(theme, index, title, cmd) {
  const c = THEMES[theme]
  const dark = theme === 'dark'
  const W = 960
  const H = cmd ? 70 : 40
  const halo = `stroke="${c.bg}" stroke-width="12" paint-order="stroke" stroke-linejoin="round"`
  const label = (cls, s) =>
    `<text x="14" y="27" class="d ${cls}" font-size="26" ${halo}><tspan class="ac">╡${index}.</tspan><tspan class="fg"> ${esc(s)}</tspan><tspan class="ac">╞</tspan></text>`
  // efeito de "descriptografar" o título ao carregar (ScrambleText do site): duas camadas de ruído e o final
  const n = [...title].length
  const typed = cmd
    ? [...cmd].map((ch, i) => `<tspan style="animation:inp .01s ${(0.6 + i * 0.035).toFixed(3)}s both">${esc(ch)}</tspan>`).join('')
    : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(`${index}. ${title}`)}">
<title>${esc(`${index}. ${title}`)}</title>
${baseStyle(
  c,
  `@keyframes s1{0%{opacity:1}33%{opacity:0}100%{opacity:0}}
@keyframes s2{0%{opacity:0}33%{opacity:1}66%{opacity:0}100%{opacity:0}}
@keyframes s3{0%{opacity:0}66%{opacity:1}100%{opacity:1}}
.n1{animation:s1 .5s step-end both}.n2{animation:s2 .5s step-end both}.fin{animation:s3 .5s step-end both}`,
)}
<defs>${glowDefs(dark)}</defs>
<rect width="${W}" height="${H}" fill="${c.bg}"/>
<line x1="0" y1="18.5" x2="${W}" y2="18.5" stroke="${c.border}"/>
<g${glow(dark)}>
<g class="noise n1">${label('', noise(title, 0))}</g>
<g class="noise n2">${label('', noise(title, Math.ceil(n / 2)))}</g>
<g class="fin">${label('', title)}</g>
<text x="${W - 12}" y="24" class="m mu" font-size="14" text-anchor="end" ${halo}>[_][□][×]</text>
${cmd ? `<text x="14" y="60" class="m" font-size="15"><tspan class="ac">savio@godinho</tspan><tspan class="fg">:~$ ${typed}</tspan><tspan class="fg cur">█</tspan></text>` : ''}
</g>
</svg>
`
}

// ===== statusbar estilo vim =====
function statusbar(theme) {
  const c = THEMES[theme]
  const dark = theme === 'dark'
  const W = 960
  const H = 60
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="statusbar">
<title>NORMAL · README.md · © ${YEAR} ${esc(cv.nome)}</title>
${baseStyle(c)}
<defs>${glowDefs(dark)}</defs>
<rect width="${W}" height="${H}" fill="${c.bg}"/>
<rect x="0" y="0" width="${W}" height="28" fill="${c.surface}"/>
<line x1="0" y1=".5" x2="${W}" y2=".5" stroke="${c.border}"/>
<line x1="0" y1="28.5" x2="${W}" y2="28.5" stroke="${c.border}"/>
<rect x="0" y="1" width="86" height="27" fill="${c.fg}"/>
<text x="43" y="20" class="m" font-size="14" font-weight="700" fill="${c.bg}" text-anchor="middle">NORMAL</text>
<text x="100" y="20" class="m fg" font-size="14">README.md</text>
<text x="${W - 12}" y="20" class="m mu" font-size="13" text-anchor="end">utf-8 │ pt-BR │ © ${YEAR} ${esc(cv.nome)}</text>
<g${glow(dark)}>
<text x="4" y="50" class="m fg" font-size="14">:e ${esc(SITE.replace('https://', ''))}<tspan class="cur">█</tspan></text>
<text x="${W - 12}" y="50" class="m mu" font-size="13" text-anchor="end">:0 ↑ topo</text>
</g>
</svg>
`
}

// ===== escreve os SVGs =====
const SECTIONS = [
  ['01', 'sobre', 'cat sobre.md'],
  ['02', 'projetos', 'ls -la ~/projetos'],
  ['03', 'stack', 'cat stack.txt'],
  ['04', 'código no github', 'gh repo list saviogodinho2002 --public'],
  ['05', 'formação', 'cat formacao.md'],
  ['06', 'stats', 'git log --oneline | wc -l'],
]
const sizes = {}
const put = (name, svg) => {
  writeFileSync(join(assetsDir, name), svg)
  sizes[name] = Buffer.byteLength(svg)
}
for (const theme of ['dark', 'light']) {
  put(`hero-${theme}.svg`, hero(theme))
  put(`statusbar-${theme}.svg`, statusbar(theme))
  for (const [i, title, cmd] of SECTIONS) put(`win-${i}-${theme}.svg`, windowBar(theme, i, title, cmd))
}

// ===== README.md =====
// imagem que troca com o tema do GitHub (claro = papel matricial)
const pic = (base, alt, attrs = 'width="100%"') =>
  `<picture><source media="(prefers-color-scheme: light)" srcset="assets/${base}-light.svg"><img src="assets/${base}-dark.svg" alt="${esc(alt)}" ${attrs}></picture>`
const win = (i) => {
  const [n, title] = SECTIONS.find((s) => s[0] === i)
  return pic(`win-${n}`, `${n}. ${title}`)
}

const D = THEMES.dark
const L = THEMES.light
const hex = (s) => s.replace('#', '')
const badge = (label, logo, logoColor, href) =>
  `<a href="${href}"><img src="https://img.shields.io/badge/${encodeURIComponent(label)}-${hex(D.surface)}?style=for-the-badge&logo=${logo}&logoColor=${hex(logoColor)}" alt="${esc(label)}"></a>`

const split = (nome) => {
  const [title, ...rest] = nome.split(' – ')
  return { title: title.trim(), subtitle: rest.join(' – ').trim() }
}
const hasLink = (l) => l && l !== '#'

const card = (p) => {
  const { title, subtitle } = split(p.nome)
  const page = `${SITE}/projetos/${p.slug}/`
  const links = [
    hasLink(p.link) ? `<a href="${p.link}"><code>[ abrir ↗ ]</code></a>` : '',
    `<a href="${page}"><code>[ detalhes ]</code></a>`,
  ]
    .filter(Boolean)
    .join(' ')
  return `<td width="50%" valign="top">
<a href="${page}"><img src="${SITE}${p.imagem}-card.webp" alt="Tela do ${esc(title)}" width="100%"></a>

<b>▸ ${esc(title)}</b><br>
<sub>${esc(subtitle)}</sub>

${esc(p.descricao)}

${links}
</td>`
}
const rowsOf = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n))
const projects = rowsOf(cv.projetos, 2)
  .map((r) => `<tr>\n${r.map(card).join('\n')}${r.length < 2 ? '\n<td width="50%"></td>' : ''}\n</tr>`)
  .join('\n')

// itens do CV -> ícones do skillicons.dev; o que não tem ícone vira texto
const ICONS = {
  'PHP/Laravel': ['php', 'laravel'], 'Vue 3': ['vue'], MySQL: ['mysql'], PostgreSQL: ['postgres'],
  'React/Next.js': ['react', 'nextjs'], Docker: ['docker'], Linux: ['linux'], Git: ['git'],
  'Node/TypeScript': ['nodejs', 'ts'], Redis: ['redis'], Supabase: ['supabase'],
  'Java/SpringBoot': ['java', 'spring'], Python: ['py'], Firebase: ['firebase'],
}
const stack = cv.habilidades_grupos
  .map((g) => {
    const ids = g.itens.flatMap((i) => ICONS[i] || [])
    const rest = g.itens.filter((i) => !ICONS[i])
    const url = (t) => `https://skillicons.dev/icons?i=${ids.join(',')}&theme=${t}`
    return `<b><code>${esc(g.grupo)}</code></b><br><br>
<picture><source media="(prefers-color-scheme: light)" srcset="${url('light')}"><img src="${url('dark')}" alt="${esc(g.itens.join(', '))}"></picture>${
      rest.length ? `<br><sub>+ ${esc(rest.join(' · '))}</sub>` : ''
    }`
  })
  .join('\n<br><br>\n\n')

const code = cv.projetos_codigo
  .map((p) => {
    const { title, subtitle } = split(p.nome)
    return `- **[${title}](${p.link})** · ${subtitle}<br><sub>${p.descricao}</sub>`
  })
  .join('\n')

const years = (periodo) => {
  const ys = periodo.match(/\d{4}/g) || []
  return /presente/i.test(periodo) ? `${ys[0]} – atual` : ys.join(' – ')
}
const education = cv.formacao
  .map((f) => {
    const desc = f.curso.startsWith('Mestrado') ? f.descricao.replace(/^•\s*/, '').split('\n')[0] : ''
    return `- **${f.curso}** · ${f.instituicao.split(',')[0]} <code>${years(f.periodo)}</code>${desc ? `<br><sub>${desc}</sub>` : ''}`
  })
  .join('\n')

const statsParams = (c) =>
  `bg_color=${hex(c.bg)}&title_color=${hex(c.accent)}&text_color=${hex(c.fg)}&icon_color=${hex(c.fg)}&border_color=${hex(c.border)}&ring_color=${hex(c.accent)}`
const streakParams = (c) =>
  `background=${hex(c.bg)}&border=${hex(c.border)}&stroke=${hex(c.border)}&ring=${hex(c.accent)}&fire=${hex(c.accent)}&currStreakNum=${hex(c.fg)}&sideNums=${hex(c.fg)}&currStreakLabel=${hex(c.accent)}&sideLabels=${hex(c.muted)}&dates=${hex(c.muted)}`
const STATS = 'https://github-readme-stats-drab-seven-40.vercel.app/api?username=saviogodinho2002&count_private=true&show_icons=true&rank_icon=github&border_radius=0'
const STREAK = 'https://github-readme-streak-stats-savio.vercel.app/?user=saviogodinho2002&count_private=true&border_radius=0'
const dual = (base, params, alt) =>
  `<picture><source media="(prefers-color-scheme: light)" srcset="${base}&${params(L)}"><img width="420" src="${base}&${params(D)}" alt="${alt}"></picture>`

const ABOUT = `Engenheiro de software construindo SaaS para transporte fluvial e gestão portuária na Amazônia. Faço parte da equipe que projetou e desenvolve um ecossistema que conecta venda de passagens, emissão fiscal (BP-e/SEFAZ), pagamentos, gestão portuária, controle financeiro e controle de acesso físico, usado por empresas de navegação, agências, portos e passageiros. Trabalho na W3 Companhia desde 2023 e, em paralelo, atendo projetos freelance de gestão financeira e de educação com IA. [Saiba mais](https://w3companhia.com/blog/yjara-viagens-inovacao-sustentavel-e-inclusiva-no-transporte-fluvial-amazonico-com-o-apoio-do-ciat)`

const readme = `<!-- Gerado por scripts/github-readme/build-readme.mjs (repo do portfólio). Edite lá e rode de novo. -->

<a href="${SITE}">${pic('hero', `${cv.nome}, ${cv.titulo}. Abrir o portfólio`)}</a>

<p align="center">
  ${badge('portfólio', 'gnometerminal', D.fg, SITE)}
  ${badge('LinkedIn', 'linkedin', D.fg, cv.contato.linkedin)}
  ${badge('Gmail', 'gmail', D.accent, `mailto:${cv.contato.email}`)}
  ${badge('Instagram', 'instagram', D.accent, 'https://www.instagram.com/savogodinho.targz/')}
  <img src="https://visitor-badge.laobi.icu/badge?page_id=saviogodinho2002.saviogodinho2002&left_text=visitas&left_color=%23${hex(D.surface)}&right_color=%23${hex(D.border)}" alt="visitas">
</p>

${win('01')}

${ABOUT}

${win('02')}

<table>
${projects}
</table>

${win('03')}

<div align="center">

${stack}

<br><br>

<sub>no trabalho uso o stack acima · no tempo livre gosto de explorar <b>Java</b> e <b>Kotlin</b></sub>

</div>

${win('04')}

${code}

${win('05')}

${education}

${win('06')}

<p align="center">
  ${dual(STREAK, streakParams, 'streak stats')}
  ${dual(STATS, statsParams, 'GitHub stats')}
</p>

<a href="${SITE}">${pic('statusbar', `NORMAL · README.md · © ${YEAR} ${cv.nome}`)}</a>
`
writeFileSync(join(out, 'README.md'), readme)

console.log(`README + ${Object.keys(sizes).length} SVGs em ${out}`)
for (const [n, s] of Object.entries(sizes)) console.log(`  ${n.padEnd(22)} ${(s / 1024).toFixed(1)} KB`)
void PROFILE
