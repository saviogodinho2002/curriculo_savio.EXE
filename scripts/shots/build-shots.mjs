// Prints dos projetos com site público, salvos em public/projects/:
//   <slug>/<n>.webp     1280×800, telas da página do projeto (galeria)
//   <slug>.webp         = tela 1 (compatível com os usos antigos)
//   <slug>-card.webp    640×400, miniatura do card (da tela 1)
// Tela capturada em 1920×1200 e reduzida: mostra mais do site, sem cara de zoom.
// Telas logadas (sistemas locais) ficam em build-app-shots.mjs.
// Uso: node scripts/shots/build-shots.mjs [slug ...]   (precisa do Google Chrome e do cwebp)
import { execFileSync, spawn } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const CHROME =
  process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const OUT = join(root, 'public/projects')
const W = 1920
const H = 1200

// Cada tela: url (padrão = a do site), to = seletor que vai para o topo da tela (rolagem),
// wait = espera em ms depois de abrir a página.
const SITES = {
  techrios: { url: 'https://techrios.online/', shots: [{}], keepMain: true },
  'yjara-viagens': { url: 'https://yjaraviagens.com/', shots: [{}], keepMain: true },
  'o-mentor-app': { url: 'https://omentorconcursos.com.br/', shots: [{}], keepMain: true },
  'river-fiam': { url: 'https://app.portalfiam.org/transparency-portal', shots: [{}], keepMain: true },
  'porto-facil': {
    url: 'https://portofacil.online/',
    shots: [{}, { to: '#osistema' }, { to: '#vantagens' }],
  },
  ribba: {
    url: 'https://rederibba.org/',
    shots: [{}, { to: '#sobre' }, { url: 'https://rederibba.org/ribba-parceiros' }],
  },
  bjmarmitaria: {
    url: 'https://bjmarmitaria.com/',
    shots: [{}, { scrollBy: 900 }],
  },
  // o W3Zap demora para carregar e rola dentro de um contêiner (por isso o scrollIntoView)
  w3zap: {
    url: 'https://app.w3zap.net/',
    wait: 25000,
    shots: [{}, { to: '#features' }, { to: 'section:nth-of-type(5)' }],
  },
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function openCdp() {
  const port = 9300 + Math.floor(Math.random() * 500)
  const profile = mkdtempSync(join(tmpdir(), 'shots-profile-'))
  const chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    `--window-size=${W},${H}`, '--lang=pt-BR', `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`, 'about:blank',
  ], { stdio: 'ignore' })
  let target
  for (let i = 0; i < 60 && !target; i++) {
    await sleep(250)
    try {
      target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page')
    } catch {
      // Chrome ainda subindo
    }
  }
  if (!target) throw new Error('CDP não respondeu')
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej })
  let id = 0
  const pending = new Map()
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data)
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id) }
  }
  const send = (method, params = {}) => new Promise((res) => {
    const n = ++id
    pending.set(n, res)
    ws.send(JSON.stringify({ id: n, method, params }))
  })
  const evaluate = async (expression) =>
    (await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result?.result?.value
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false })
  const close = () => {
    ws.close()
    chrome.kill('SIGKILL')
    rmSync(profile, { recursive: true, force: true })
  }
  return { send, evaluate, close }
}

// recusa (ou esconde) banners de cookies e widgets flutuantes de chat, que tapariam o print
const CLEAN = `[...document.querySelectorAll('button')].find((b) => /^(recusar|rejeitar)$/i.test(b.innerText.trim()))?.click();
  document.querySelectorAll('[id*="cookie" i], [class*="cookie" i], [class*="consent" i], #lgpd, .lgpd').forEach((e) => e.remove())`

async function shoot(slug, site, tmp) {
  const cdp = await openCdp()
  const files = []
  try {
    let current = null
    for (const [i, shot] of site.shots.entries()) {
      const url = shot.url || site.url
      if (url !== current) {
        await cdp.send('Page.navigate', { url })
        await sleep(shot.wait || site.wait || 9000)
        current = url
      }
      if (shot.to) {
        const ok = await cdp.evaluate(`(() => { const e = document.querySelector(${JSON.stringify(shot.to)}); e?.scrollIntoView({ block: 'start' }); return !!e })()`)
        if (!ok) console.log(`  · ${slug} tela ${i + 1}: não achei ${shot.to}`)
        await sleep(1800) // animações de entrada da seção
      }
      if (shot.scrollBy) {
        await cdp.evaluate(`window.scrollBy(0, ${shot.scrollBy})`)
        await sleep(1500)
      }
      await cdp.evaluate(CLEAN)
      await sleep(600)
      const { result } = await cdp.send('Page.captureScreenshot', { format: 'png' })
      const png = join(tmp, `${slug}-${i + 1}.png`)
      writeFileSync(png, Buffer.from(result.data, 'base64'))
      files.push(png)
    }
  } finally {
    cdp.close()
  }
  return files
}

const only = process.argv.slice(2)
const targets = Object.entries(SITES).filter(([slug]) => !only.length || only.includes(slug))

mkdirSync(OUT, { recursive: true })
const tmp = mkdtempSync(join(tmpdir(), 'shots-'))
const webp = (png, out, q, w, h) => execFileSync('cwebp', ['-quiet', '-q', String(q), '-resize', String(w), String(h), png, '-o', out])
const kb = (f) => Math.round(statSync(f).size / 1024)
try {
  for (const [slug, site] of targets) {
    let pngs
    try {
      pngs = await shoot(slug, site, tmp)
    } catch (err) {
      console.log(`falhou ${slug}: ${err.message}`)
      continue
    }
    // tela 1 também vira o print principal e a miniatura do card
    webp(pngs[0], join(OUT, `${slug}.webp`), 82, 1280, 800)
    webp(pngs[0], join(OUT, `${slug}-card.webp`), 78, 640, 400)
    // projetos só com o print do site (keepMain) não ganham pasta de galeria aqui
    if (!site.keepMain) {
      mkdirSync(join(OUT, slug), { recursive: true })
      pngs.forEach((png, i) => webp(png, join(OUT, slug, `${i + 1}.webp`), 82, 1280, 800))
    }
    console.log(`ok ${slug}: ${pngs.length} tela(s), principal ${kb(join(OUT, `${slug}.webp`))} KB`)
  }
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
