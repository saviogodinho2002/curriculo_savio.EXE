// Gera as imagens de compartilhamento (og:image, 1200×630) em public/og/og-{pt,en}.png
// a partir dos JSONs do CV e da arte em dot art, no visual do site (CRT verde/âmbar).
// Uso: node scripts/og/build-og.mjs   (precisa do Google Chrome instalado)
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const CHROME =
  process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

const read = (p) => readFileSync(join(root, p), 'utf8')
const art = read('src/data/dot-art-dark.txt').trimEnd()
const CV = {
  pt: JSON.parse(read('src/data/curriculum.json')),
  en: JSON.parse(read('src/data/curriculum.en.json')),
}
const KEYS = {
  pt: { role: 'cargo', company: 'empresa', location: 'local', stack: 'stack' },
  en: { role: 'role', company: 'company', location: 'location', stack: 'stack' },
}
const URLS = { pt: 'curriculo-savio-exe.vercel.app', en: 'curriculo-savio-exe.vercel.app/en' }

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

function html(locale) {
  const cv = CV[locale]
  const k = KEYS[locale]
  const rows = [
    [k.role, cv.titulo],
    [k.company, cv.empresa_atual],
    [k.location, cv.contato.localizacao],
    [k.stack, cv.habilidades.slice(0, 3).join(' · ')],
  ]
  return `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&family=VT323&display=block">
<style>
  * { box-sizing: border-box; margin: 0; }
  html, body { width: 1200px; height: 630px; overflow: hidden; }
  body { background: #0a0f0a; color: #33ff66; font: 24px/1.5 'IBM Plex Mono', monospace;
         text-shadow: 0 0 6px rgba(51,255,102,.45); position: relative; }
  body::after { content: ''; position: absolute; inset: 0; pointer-events: none;
         background: repeating-linear-gradient(to bottom, rgba(0,0,0,.22) 0 1px, transparent 1px 3px),
                     radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.5) 100%); }
  .frame { position: absolute; inset: 28px; border: 4px double #1f7a3a; padding: 40px 44px 64px;
         display: grid; grid-template-columns: 1fr auto; gap: 40px; align-items: center; }
  .bar { position: absolute; top: -18px; left: 28px; right: 28px; display: flex; justify-content: space-between; }
  .bar span { background: #0a0f0a; padding: 0 10px; line-height: 1; }
  .title { font: 36px/1 'VT323', monospace; color: #ffb000; text-shadow: 0 0 6px rgba(255,176,0,.45); }
  .title i { color: #1f7a3a; font-style: normal; text-shadow: none; }
  .ctrl { color: #27b35a; font-size: 18px; text-shadow: none; }
  .prompt { color: #27b35a; font-size: 22px; }
  .prompt b { color: #33ff66; font-weight: 400; }
  h1 { font: 92px/1 'VT323', monospace; margin: 10px 0 4px; letter-spacing: .01em; white-space: nowrap; }
  h1::after { content: '▋'; margin-left: 6px; }
  .rule { width: 340px; border-top: 3px dashed #1f7a3a; margin: 10px 0 22px; }
  dl { display: grid; grid-template-columns: max-content 1fr; gap: 4px 20px; font-size: 24px; white-space: nowrap; }
  dt { color: #ffb000; font-weight: 700; text-shadow: 0 0 6px rgba(255,176,0,.45); }
  dt::after { content: ':'; }
  dd { margin: 0; }
  .url { position: absolute; left: 48px; bottom: 22px; font-size: 20px; color: #ffb000;
         text-shadow: 0 0 6px rgba(255,176,0,.45); }
  pre { font: 6.4px/1 'IBM Plex Mono', monospace; letter-spacing: 0; color: #33ff66;
        text-shadow: 0 0 2px rgba(51,255,102,.4); max-width: 380px; overflow: hidden; }
</style></head><body>
<div class="frame">
  <div class="bar"><span class="title"><i>╡</i> savio@godinho <i>╞</i></span><span class="ctrl">[_][□][×]</span></div>
  <div>
    <p class="prompt">savio@godinho:~ $ <b>neofetch</b></p>
    <h1>${esc(cv.nome)}</h1>
    <div class="rule"></div>
    <dl>${rows.map(([a, b]) => `<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join('')}</dl>
  </div>
  <pre>${esc(art)}</pre>
  <p class="url">${URLS[locale]}</p>
</div>
</body></html>`
}

const tmp = mkdtempSync(join(tmpdir(), 'og-'))
mkdirSync(join(root, 'public/og'), { recursive: true })
try {
  for (const locale of ['pt', 'en']) {
    const file = join(tmp, `og-${locale}.html`)
    writeFileSync(file, html(locale))
    const out = join(root, `public/og/og-${locale}.png`)
    execFileSync(CHROME, [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--window-size=1200,630',
      '--virtual-time-budget=8000',
      `--screenshot=${out}`,
      `file://${file}`,
    ], { stdio: 'ignore' })
    console.log('ok', out)
  }
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
