// Captura a tela dos projetos com site público e salva em public/projects/:
//   <slug>.webp      1280×800 (página do projeto, og:image)
//   <slug>-card.webp  640×400 (miniatura do card)
// Agente Águia e W3Zap exigem login: os prints deles vêm de um ambiente local com dados fictícios.
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

const SITES = {
  techrios: 'https://techrios.online/',
  'yjara-viagens': 'https://yjaraviagens.com/',
  'o-mentor-app': 'https://omentorconcursos.com.br/',
  'river-fiam': 'https://app.portalfiam.org/transparency-portal',
  'porto-facil': 'https://portofacil.online/',
  ribba: 'https://rederibba.org/',
  bjmarmitaria: 'https://bjmarmitaria.com/',
  // o W3Zap demora para carregar: espera fixa longa antes do print
  w3zap: { url: 'https://app.w3zap.net/', wait: 25000 },
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Último recurso: Chrome com protocolo de depuração (CDP). Abre a página, espera um tempo
// fixo e pede o print direto, sem depender da página "terminar de carregar".
async function shotViaCdp(url, png, waitMs = 8000) {
  const port = 9300 + Math.floor(Math.random() * 500)
  const profile = mkdtempSync(join(tmpdir(), 'shots-profile-'))
  const chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--window-size=1280,800', '--lang=pt-BR', `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`, 'about:blank',
  ], { stdio: 'ignore' })
  try {
    let target
    for (let i = 0; i < 40 && !target; i++) {
      await sleep(250)
      try {
        const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()
        target = list.find((t) => t.type === 'page')
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
    await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false })
    await send('Page.navigate', { url })
    await sleep(waitMs)
    const { result } = await send('Page.captureScreenshot', { format: 'png' })
    writeFileSync(png, Buffer.from(result.data, 'base64'))
    ws.close()
  } finally {
    chrome.kill('SIGKILL')
    rmSync(profile, { recursive: true, force: true })
  }
}

const only = process.argv.slice(2)
const targets = Object.entries(SITES).filter(([slug]) => !only.length || only.includes(slug))

mkdirSync(OUT, { recursive: true })
const tmp = mkdtempSync(join(tmpdir(), 'shots-'))
try {
  for (const [slug, site] of targets) {
    const url = typeof site === 'string' ? site : site.url
    const png = join(tmp, `${slug}.png`)
    const base = [
      '--headless=new',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
      '--window-size=1280,800',
      '--lang=pt-BR',
      `--screenshot=${png}`,
    ]
    // Site com espera longa definida: vai direto para o CDP com esse tempo.
    // Senão, 1ª tentativa: espera a página "assentar" (virtual time). Páginas com conexão sempre
    // aberta (websocket/polling) nunca assentam; aí a 2ª tentativa usa um tempo fixo.
    if (typeof site === 'object' && site.wait) {
      try {
        await shotViaCdp(url, png, site.wait)
      } catch (err) {
        console.log(`falhou ${slug}: ${err.code || err.message}`)
        continue
      }
    } else try {
      execFileSync(CHROME, [...base, '--virtual-time-budget=12000', url], { stdio: 'ignore', timeout: 60_000 })
    } catch {
      try {
        execFileSync(CHROME, [...base, '--timeout=15000', url], { stdio: 'ignore', timeout: 60_000 })
      } catch {
        try {
          await shotViaCdp(url, png)
        } catch (err) {
          console.log(`falhou ${slug}: ${err.code || err.message}`)
          continue
        }
      }
    }

    const full = join(OUT, `${slug}.webp`)
    const card = join(OUT, `${slug}-card.webp`)
    execFileSync('cwebp', ['-quiet', '-q', '80', png, '-o', full])
    execFileSync('cwebp', ['-quiet', '-q', '78', '-resize', '640', '400', png, '-o', card])
    const kb = (f) => Math.round(statSync(f).size / 1024)
    console.log(`ok ${slug}: ${kb(full)} KB / card ${kb(card)} KB`)
  }
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
