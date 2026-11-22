// Gera o currículo em inglês (public/cv/savio-godinho-resume.pdf) no mesmo layout do PDF
// em português (Google Docs): nome, contatos, títulos de seção em azul, bullets.
// O texto é a tradução do PDF em PT; ajuste aqui e rode de novo.
// Uso: node scripts/cv-pdf/build-pdf.mjs   (precisa do Google Chrome instalado)
import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../../', import.meta.url))
const CHROME =
  process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const OUT = join(root, 'public/cv/savio-godinho-resume.pdf')

const CV = {
  name: 'Sávio Godinho Moia Gaia',
  contact: [
    ['', 'Santarém, Pará, Brazil'],
    ['Phone: ', '+55 93 99212-1329'],
    ['Email: ', 'saviogmoiagaia.2001@gmail.com'],
    ['LinkedIn: ', 'https://www.linkedin.com/in/savio-godinho/'],
    ['GitHub: ', 'https://github.com/saviogodinho2002'],
  ],
  summary:
    'Software engineer building SaaS for river transportation and port management in the Amazon. I am part of the team that designed and keeps developing an ecosystem connecting ticket e-commerce, port management, financial control and physical access control, serving shipping companies, travel agencies, ports and passengers. I currently balance my main role at W3 Companhia with freelance projects, delivering consistent technical work.',
  experience: [
    {
      company: 'O Mentor Concursos,',
      place: 'Taboão da Serra/SP',
      role: 'Mid-level Software Engineer (Freelance)',
      period: 'APRIL/2026 - PRESENT',
      bullets: [
        "Restructured the tool architecture of Agente Águia's AI chat, creating and refining semantic search, flashcard generation and study summary tools.",
        "Built Agente Águia's question module: question and exam bank, an automated AI extraction pipeline and LLM-generated teaching comments.",
        "Integrated Agente Águia's question bank into Mentor: free-study sessions with filters and topics pre-selected from the student's history.",
      ],
    },
    {
      company: 'River FIAM (UFOPA),',
      place: 'Santarém/PA',
      role: 'Software Engineer (Freelance)',
      period: 'APRIL/2024 - PRESENT',
      bullets: [
        'Built the creation and approval flow for financial requests (13 types: per diems, grants, purchases, reimbursements, advances, etc.), with automatic balance control per budget line.',
        'Implemented AI features for project optimization, focused on document analysis and validation to streamline the fine-grained management of requests.',
        'Implemented an institutional integration API with its own authentication and key rotation with zero downtime.',
        'Built bank reconciliation with statement import, bulk reconciliation and accounting export, evolving into direct integration with the Banco do Brasil and Sicredi APIs.',
      ],
    },
    {
      company: 'W3 COMPANHIA,',
      place: 'Santarém/PA',
      role: 'Software Engineer',
      period: 'JAN/2023 - PRESENT',
      bullets: [
        'Architected <b>TechRios</b> (SaaS ERP for river transportation): restructured the trips, routes and data pipeline modules, driving <b>+36.7% in transactions vs. 2024</b>.',
        'Built <b>Porto Fácil</b>, a port management REST API consumed by multiple systems and physical turnstiles, cutting fee reconciliation from hours to minutes.',
        'Helped restructure <b>Yjara Viagens</b> (ticket e-commerce): API redesign, data modeling and services. Went live in Jun/2025 with <b>+44% in transaction volume</b>.',
        "Embedded AI into TechRios operations: sales assistance based on the passenger's history and an in-house MCP server for natural-language business queries.",
      ],
    },
  ],
  skills: [
    ['Core:', 'PHP/Laravel, Vue 3, MySQL, PostgreSQL, React/Next.js, REST APIs'],
    ['Regular use:', 'Docker, Linux, Git, Node/TypeScript, Redis, Supabase, MCP, RAG'],
    ['Experience with:', 'Java/SpringBoot, Python, Neo4j, Firebase'],
  ],
  education: [
    ['Federal University of Western Pará', "Bachelor's in Computer Science", 'FEB/2020 - OCT/2024'],
    ['Federal University of Western Pará', "Master's in Computing", 'AUG/2026 - PRESENT'],
  ],
  languages: 'Portuguese (native), English (intermediate)',
}

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Sávio Godinho — Resume</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&family=Open+Sans:wght@700&display=block">
<style>
  @page { size: Letter; margin: 0.5in 0.85in 0.45in 0.85in; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font: 300 9.2pt/1.38 'Merriweather', Georgia, serif; color: #555; }
  h1 { font: 700 13pt/1.3 Arial, Helvetica, sans-serif; color: #000; margin-bottom: 4pt; }
  .contact p { line-height: 1.3; }
  .contact b { color: #333; font-weight: 700; }
  h2 { font: 700 8.5pt/1.2 'Open Sans', Arial, sans-serif; color: #3d85c6; text-transform: uppercase;
       margin: 7pt 0 2pt; letter-spacing: .02em; }
  .summary { text-align: justify; }
  .job { margin-top: 4pt; }
  .job h3 { font: 400 10.6pt/1.35 'Merriweather', Georgia, serif; color: #000; }
  .job h3 b { font-weight: 700; }
  .job h3 i { font-style: italic; }
  .period { font: 400 7pt 'Open Sans', Arial, sans-serif; color: #666; text-transform: uppercase; margin-left: 2pt; white-space: nowrap; }
  ul { margin: 3pt 0 2pt 30pt; }
  li { text-align: justify; margin-bottom: 1pt; padding-left: 4pt; }
  li b { color: #333; font-weight: 700; }
  .skills li b { color: #333; }
  .edu p b { color: #333; font-weight: 700; }
  .edu i { font-style: italic; }
</style></head><body>
  <h1>${CV.name}</h1>
  <div class="contact">${CV.contact.map(([k, v]) => `<p>${k}${k ? `<b>${v}</b>` : v}</p>`).join('')}</div>

  <h2>Summary</h2>
  <p class="summary">${CV.summary}</p>

  <h2>Experience</h2>
  ${CV.experience
    .map(
      (j) => `<div class="job"><h3><b>${j.company}</b> ${j.place} — <i>${j.role}</i> <span class="period">${j.period}</span></h3>
    <ul>${j.bullets.map((b) => `<li>${b}</li>`).join('')}</ul></div>`,
    )
    .join('')}

  <h2>Technical skills</h2>
  <ul class="skills">${CV.skills.map(([k, v]) => `<li><b>${k}</b> ${v}</li>`).join('')}</ul>

  <h2>Education</h2>
  <div class="edu">${CV.education
    .map(([u, c, p]) => `<p><b>${u}</b> - <i>${c}</i> - <span class="period">${p}</span></p>`)
    .join('')}</div>

  <h2>Languages</h2>
  <p>${CV.languages}</p>
</body></html>`

const tmp = mkdtempSync(join(tmpdir(), 'cv-pdf-'))
try {
  const file = join(tmp, 'resume.html')
  writeFileSync(file, html)
  execFileSync(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--no-pdf-header-footer',
    '--virtual-time-budget=8000',
    `--print-to-pdf=${OUT}`,
    `file://${file}`,
  ], { stdio: 'ignore' })
  console.log('ok', OUT)
} finally {
  rmSync(tmp, { recursive: true, force: true })
}
