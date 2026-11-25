// Prints de DENTRO dos sistemas (telas com login), tirados de ambientes LOCAIS com dados
// fictícios ou anonimizados. Credenciais de teste vêm de scripts/shots/flows.local.json,
// que é ignorado pelo git e nunca é publicado.
// Uso: node scripts/shots/build-app-shots.mjs <app> [<app> ...]    (apps: mentor, mentor-questao, mentor-rotina, aguia, aguia-flashcards, aguia-card, fiam, fiam-relatorio, fiam-analise, techrios-kpi, techrios-venda)
import { execFileSync, spawn } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const CHROME =
  process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const creds = JSON.parse(readFileSync(join(root, 'scripts/shots/flows.local.json'), 'utf8'))

// O Mentor guarda o token na memória do React: depois do login, navegar por dentro do app
// (window.next.router.push, sem recarregar) mantém a sessão
const mentorLogin = (c) => [
  { goto: 'http://localhost:3000/login' },
  { waitFor: '#email' },
  { wait: 8000 }, // hidratação do React (no dev a 1ª compilação é lenta)
  { fill: ['#email', c.email] },
  { fill: ['#password', c.password] },
  { js: `[...document.querySelectorAll('button')].find((b) => b.innerText.trim() === 'Entrar')?.click()` },
  { waitJs: 'location.pathname !== "/login"' },
  { wait: 4000 },
  { log: 'location.pathname + " | " + document.body.innerText.replace(/\\s+/g, " ").slice(-260)' },
]
const mentorGo = (path, wait = 15000) => [
  { js: `window.next?.router?.push(${JSON.stringify(path)})` },
  { wait },
  { log: 'location.pathname + " | " + document.body.innerText.slice(0, 220).replace(/\\s+/g, " ")' },
]

const aguiaLogin = (c) => [
  { goto: 'http://localhost:3300/login' },
  { waitFor: '#email' },
  { fill: ['#email', c.email] },
  { fill: ['#password', c.password] },
  { submit: '#password' },
  { waitJs: 'location.pathname.startsWith("/app")' },
  { log: 'location.pathname' },
]

const fiamLogin = (c) => [
  { goto: 'http://127.0.0.1:8020/login' },
  { waitFor: 'input[type=email]' },
  { fill: ['input[type=email]', c.email] },
  { fill: ['input[type=password]', c.password] },
  { submit: 'input[type=password]' },
  { wait: 6000 },
  { log: 'location.pathname' },
]

// Roteiro de cada app. Os seletores e URLs são locais; a credencial vem do arquivo ignorado.
const FLOWS = {
  mentor: (c) => ({
    slug: 'o-mentor-app',
    steps: [...mentorLogin(c), ...mentorGo('/student/ciclo', 12000)],
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
      ...fiamLogin(c),
      // abre o chat pelo botão "Iara" do cabeçalho
      { js: `[...document.querySelectorAll('.header-docs-text')].find((e) => e.textContent.trim() === 'Iara')?.closest('button, a, .v-btn')?.click()` },
      { waitFor: 'textarea' },
      { fill: ['textarea', 'Quais são os 5 projetos com maior saldo disponível? Mostre numa tabela.'] },
      { js: `document.querySelector('textarea').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))` },
      { wait: 45000 },
      { log: 'document.querySelector("textarea")?.closest("aside, section, div")?.innerText.slice(-200).replace(/\\s+/g, " ")' },
    ],
  }),
  'mentor-questao': (c) => ({
    slug: 'o-mentor-app',
    file: 'o-mentor-app/2',
    steps: [
      ...mentorLogin(c),
      ...mentorGo('/student/questoes', 15000),
      // escolhe a matéria e abre o caderno de questões
      { js: `[...document.querySelectorAll('button, [role=button], label')].find((b) => b.innerText.trim() === 'Direito Constitucional')?.click()` },
      { wait: 1500 },
      { js: `[...document.querySelectorAll('button')].find((b) => b.innerText.trim() === 'Começar')?.click()` },
      { wait: 12000 },
      // responde e abre o comentário do professor (gerado por LLM)
      { js: `[...document.querySelectorAll('button, [role=button], label')].find((b) => /^C\\s*Certo$/.test(b.innerText.trim()))?.click()` },
      { wait: 3000 },
      { js: `[...document.querySelectorAll('button, [role=button]')].find((b) => b.innerText.trim() === 'Explicação do professor')?.click()` },
      { wait: 4000 },
      { log: 'document.body.innerText.replace(/\\s+/g, " ").slice(0, 400)' },
    ],
  }),
  'mentor-rotina': (c) => ({
    slug: 'o-mentor-app',
    file: 'o-mentor-app/3',
    steps: [
      ...mentorLogin(c),
      ...mentorGo('/rotina', 20000),
      // compromissos pessoais do usuário de teste viram um rótulo neutro (só na tela, para o print)
      { js: `[...document.querySelectorAll('*')].filter((e) => e.children.length === 0 && /^amorzinho/i.test(e.textContent.trim())).forEach((e) => (e.textContent = 'Compromisso'))` },
    ],
  }),
  'aguia-flashcards': (c) => ({
    slug: 'agente-aguia',
    file: 'agente-aguia/2',
    steps: [
      ...aguiaLogin(c),
      { goto: 'http://localhost:3300/app/flashcards' },
      { wait: 20000 },
      { log: 'document.body.innerText.replace(/\\s+/g, " ").slice(0, 300)' },
    ],
  }),
  'aguia-card': (c) => ({
    slug: 'agente-aguia',
    file: 'agente-aguia/3',
    steps: [
      ...aguiaLogin(c),
      { goto: 'http://localhost:3300/app/flashcards/' + encodeURIComponent('Direito Administrativo') },
      { wait: 20000 },
      // revela a resposta dos dois primeiros cards
      { js: `[...document.querySelectorAll('button')].filter((b) => b.innerText.trim() === 'Revelar').slice(0, 2).forEach((b) => b.click())` },
      { wait: 2500 },
    ],
  }),
  'fiam-relatorio': (c) => ({
    slug: 'river-fiam',
    file: 'river-fiam/2',
    steps: [
      ...fiamLogin(c),
      { goto: 'http://127.0.0.1:8020/reports?project_id=18' },
      { wait: 9000 },
      { log: 'document.body.innerText.slice(0, 240).replace(/\\s+/g, " ")' },
    ],
  }),
  // pedido do clone com uma nota fiscal fictícia já analisada pela IA (scratchpad fiam-nf.php)
  'fiam-analise': (c) => ({
    slug: 'river-fiam',
    file: 'river-fiam/3',
    steps: [
      ...fiamLogin(c),
      { goto: 'http://127.0.0.1:8020/demands/11187/legal-person-payments' },
      { wait: 9000 },
      // o arquivo fica no passo "Nota Fiscal" (ou "Documentos") do pedido
      { js: `[...document.querySelectorAll('*')].filter((e) => e.children.length === 0 && e.innerText?.trim() === 'Nota Fiscal').pop()?.click()` },
      { wait: 2500 },
      { js: `document.querySelector('.v-chip.tw-cursor-pointer') || [...document.querySelectorAll('*')].filter((e) => e.children.length === 0 && e.innerText?.trim() === 'Documentos').pop()?.click()` },
      { wait: 2500 },
      { log: '[...document.querySelectorAll(".v-chip")].map((e) => e.innerText.trim()).filter(Boolean).join(" | ")' },
      { js: `document.querySelector('.v-chip.tw-cursor-pointer')?.click()` },
      { wait: 3000 },
      { log: '(document.querySelector(".v-dialog, .v-overlay__content")?.innerText || "sem modal").slice(0, 300).replace(/\\s+/g, " ")' },
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
