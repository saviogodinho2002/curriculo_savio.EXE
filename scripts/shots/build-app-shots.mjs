// Prints de DENTRO dos sistemas (telas com login), tirados de ambientes LOCAIS com dados
// fictícios ou anonimizados. Credenciais de teste vêm de scripts/shots/flows.local.json,
// que é ignorado pelo git e nunca é publicado.
// Uso: node scripts/shots/build-app-shots.mjs <app> [<app> ...]    (apps: mentor, aguia, fiam, techrios-kpi, techrios-venda)
import { execFileSync, spawn } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const CHROME =
  process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const creds = JSON.parse(readFileSync(join(root, 'scripts/shots/flows.local.json'), 'utf8'))

// Roteiro de cada app. Os seletores e URLs são locais; a credencial vem do arquivo ignorado.
const FLOWS = {
  mentor: (c) => ({
    slug: 'o-mentor-app',
    steps: [
      { goto: 'http://localhost:3000/login' },
      { waitFor: '#email' },
      { fill: ['#email', c.email] },
      { fill: ['#password', c.password] },
      { submit: '#password' },
      { wait: 10000 },
      { log: 'location.pathname + " | " + document.body.innerText.slice(0, 160).replace(/\\s+/g, " ")' },
      // o token fica na memória do React: navegar por dentro do app (sem recarregar) mantém a sessão
      { js: 'window.next?.router?.push("/student/ciclo")' },
      { wait: 7000 },
    ],
  }),
  // Agente Águia no Supabase local, com conta de teste criada só para o print (chat começa vazio)
  aguia: (c) => ({
    slug: 'agente-aguia',
    steps: [
      { goto: 'http://localhost:3300/login' },
      { waitFor: '#email' },
      { fill: ['#email', c.email] },
      { fill: ['#password', c.password] },
      { submit: '#password' },
      { waitJs: 'location.pathname.startsWith("/app")' },
      { log: 'location.pathname' },
      { goto: 'http://localhost:3300/app/chat' },
      { wait: 20000 },
      { log: 'location.pathname + " | " + document.body.innerText.slice(0, 140).replace(/\\s+/g, " ")' },
      { waitFor: 'textarea' },
      { fill: ['textarea', 'Faça um resumo sobre os princípios da administração pública e crie 3 flashcards.'] },
      { js: `(() => { const t = document.querySelector('textarea'); t.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); setTimeout(() => { if (t.value) t.form?.requestSubmit() }, 800) })()` },
      { wait: 70000 },
      { log: 'document.body.innerText.slice(-160).replace(/\\s+/g, " ")' },
    ],
  }),
  // FIAM rodando no clone anonimizado (river_db_demo) em 127.0.0.1:8020
  fiam: (c) => ({
    slug: 'river-fiam',
    steps: [
      { goto: 'http://127.0.0.1:8020/login' },
      { waitFor: 'input[type=email]' },
      { fill: ['input[type=email]', c.email] },
      { fill: ['input[type=password]', c.password] },
      { submit: 'input[type=password]' },
      { wait: 6000 },
      { log: 'location.pathname' },
      // abre o chat pelo botão "Iara" do cabeçalho
      { js: `[...document.querySelectorAll('.header-docs-text')].find((e) => e.textContent.trim() === 'Iara')?.closest('button, a, .v-btn')?.click()` },
      { waitFor: 'textarea' },
      { fill: ['textarea', 'Quais são os 5 projetos com maior saldo disponível? Mostre numa tabela.'] },
      { js: `document.querySelector('textarea').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))` },
      { wait: 45000 },
      { log: 'document.querySelector("textarea")?.closest("aside, section, div")?.innerText.slice(-200).replace(/\\s+/g, " ")' },
    ],
  }),
  // TechRios no clone db_techrios_demo (nomes de empresas, barcos e usuários trocados) em 127.0.0.1:8030
  'techrios-kpi': (c, u = c.Master) => ({
    slug: 'techrios',
    file: 'techrios/1',
    steps: [
      { goto: 'http://127.0.0.1:8030/login' },
      { waitFor: 'input[type=password]' },
      { fill: ['input[placeholder="Usuário"]', u.email] },
      { fill: ['input[type=password]', u.password] },
      { submit: 'input[type=password]' },
      { wait: 5000 },
      { log: 'location.pathname' },
      { goto: 'http://127.0.0.1:8030/relatorios/bi' },
      { wait: 12000 },
      { log: 'document.body.innerText.slice(0, 200).replace(/\\s+/g, " ")' },
    ],
  }),
  'techrios-venda': (c, u = c.Vendedor) => ({
    slug: 'techrios',
    file: 'techrios/2',
    steps: [
      { goto: 'http://127.0.0.1:8030/login' },
      { waitFor: 'input[type=password]' },
      { fill: ['input[placeholder="Usuário"]', u.email] },
      { fill: ['input[type=password]', u.password] },
      { submit: 'input[type=password]' },
      { wait: 5000 },
      { log: 'location.pathname' },
      { goto: 'http://127.0.0.1:8030/vender-passagens?data_hora=26/11/2026' },
      { wait: 10000 },
      { log: '[...document.querySelectorAll("button")].filter((b) => b.innerText.trim() === "Vender").length + " vendas; barcos: " + [...new Set(document.body.innerText.match(/Barco \\d+/g))].join(", ")' },
      // venda no barco 221, que tem mapa de poltronas (não é poltrona livre)
      { js: `(() => { for (const b of document.querySelectorAll('button')) { if (b.innerText.trim() !== 'Vender') continue; let el = b; while (el && !/Barco \\d+/.test(el.innerText)) el = el.parentElement; if (el && /Barco 221\\b/.test(el.innerText) && (el.innerText.match(/Barco \\d+/g) || []).length === 1) { b.click(); return } } })()` },
      { wait: 9000 },
      // seleciona 2 poltronas livres para mostrar a seleção e o total
      { js: `['P 44', 'P 45'].forEach((n) => { const el = [...document.querySelectorAll('*')].filter((e) => e.innerText?.trim() === n).pop(); el?.click() })` },
      { wait: 4000 },
      { log: 'document.body.innerText.slice(0, 300).replace(/\\s+/g, " ")' },
      { log: 'document.body.innerText.slice(0, 200).replace(/\\s+/g, " ")' },
    ],
  }),
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function openCdp() {
  const port = 9300 + Math.floor(Math.random() * 500)
  const profile = mkdtempSync(join(tmpdir(), 'app-shots-'))
  const chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--window-size=1920,1200', '--lang=pt-BR', `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`, 'about:blank',
  ], { stdio: 'ignore' })
  let target
  for (let i = 0; i < 60 && !target; i++) {
    await sleep(250)
    try {
      target = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()).find((t) => t.type === 'page')
    } catch {
      // Chrome subindo
    }
  }
  if (!target) throw new Error('CDP não respondeu')
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej })
  let id = 0
  const pending = new Map()
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data)
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id) }
  }
  const send = (method, params = {}) => new Promise((res) => {
    const n = ++id
    pending.set(n, res)
    ws.send(JSON.stringify({ id: n, method, params }))
  })
  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
    return r.result?.result?.value
  }
  const close = () => {
    ws.close()
    chrome.kill('SIGKILL')
    rmSync(profile, { recursive: true, force: true })
  }
  await send('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1200, deviceScaleFactor: 1, mobile: false })
  return { send, evaluate, close }
}

// Preenche um input de forma que React/Vue percebam (setter nativo + evento input).
const fillJs = (sel, value) => `(() => {
  const el = document.querySelector(${JSON.stringify(sel)});
  if (!el) return false;
  const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, ${JSON.stringify(value)});
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  return true;
})()`

async function run(app) {
  // tela 1920×1200 reduzida para 1280×800: mostra mais do sistema sem parecer zoom
  const flow = FLOWS[app](creds[app] || creds[app.split('-')[0]] || {})
  const cdp = await openCdp()
  try {
    for (const s of flow.steps) {
      if (s.goto) await cdp.send('Page.navigate', { url: s.goto })
      if (s.wait) await sleep(s.wait)
      if (s.waitFor) {
        let ok = false
        for (let i = 0; i < 80 && !ok; i++) {
          ok = await cdp.evaluate(`!!document.querySelector(${JSON.stringify(s.waitFor)})`)
          if (!ok) await sleep(250)
        }
        if (!ok) throw new Error(`não achei ${s.waitFor}`)
      }
      if (s.waitJs) {
        let ok = false
        for (let i = 0; i < 160 && !ok; i++) {
          ok = await cdp.evaluate(`(() => { try { return !!(${s.waitJs}) } catch { return false } })()`)
          if (!ok) await sleep(250)
        }
        if (!ok) throw new Error(`condição não ocorreu: ${s.waitJs}`)
      }
      if (s.fill && !(await cdp.evaluate(fillJs(s.fill[0], s.fill[1])))) throw new Error(`campo ${s.fill[0]} não existe`)
      if (s.submit) await cdp.evaluate(`document.querySelector(${JSON.stringify(s.submit)})?.form?.requestSubmit()`)
      if (s.click) await cdp.evaluate(`document.querySelector(${JSON.stringify(s.click)})?.click()`)
      if (s.js) await cdp.evaluate(s.js)
      if (s.log) console.log(`  · ${await cdp.evaluate(s.log)}`)
    }
    // tira selos/overlays de ambiente de desenvolvimento (Next.js, Vite, Laravel Debugbar) antes do print
    await cdp.evaluate(`[...document.querySelectorAll('div')].filter((e) => /^Você está usando o ambiente de homologação$/.test(e.innerText?.trim())).forEach((e) => e.remove()); document.querySelectorAll('nextjs-portal, vite-error-overlay, .phpdebugbar, #__vue-devtools-container__, [data-nextjs-toast]').forEach((e) => e.remove())`)
    await sleep(300)
    const url = await cdp.evaluate('location.pathname')
    const { result } = await cdp.send('Page.captureScreenshot', { format: 'png' })
    const tmp = mkdtempSync(join(tmpdir(), 'app-png-'))
    const png = join(tmp, 'shot.png')
    writeFileSync(png, Buffer.from(result.data, 'base64'))
    const out = join(root, 'public/projects')
    // prints extras vão para public/projects/<slug>/<n>.webp; o principal continua em <slug>.webp + card
    const main = join(out, `${flow.file || flow.slug}.webp`)
    mkdirSync(dirname(main), { recursive: true })
    execFileSync('cwebp', ['-quiet', '-q', '82', '-resize', '1280', '800', png, '-o', main])
    if (!flow.file) execFileSync('cwebp', ['-quiet', '-q', '78', '-resize', '640', '400', png, '-o', join(out, `${flow.slug}-card.webp`)])
    rmSync(tmp, { recursive: true, force: true })
    const kb = Math.round(statSync(main).size / 1024)
    console.log(`ok ${app} → ${flow.slug} (${kb} KB), página final: ${url}`)
  } finally {
    cdp.close()
  }
}

for (const app of process.argv.slice(2)) {
  try {
    await run(app)
  } catch (err) {
    console.log(`falhou ${app}: ${err.message}`)
  }
}
