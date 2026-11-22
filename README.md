# curriculo_savio.EXE

Portfólio/currículo online de **Sávio Godinho** com estética de terminal antigo: monitor CRT de fósforo verde/âmbar no tema escuro e papel de impressora matricial no tema claro. É um site normal de uma página, sem comandos para digitar.

🔗 https://curriculo-savio-exe.vercel.app (português) · https://curriculo-savio-exe.vercel.app/en/ (English)

## Visual

- **Barra superior estilo tmux:** as seções aparecem como janelas `0:~ 1:sobre 2:experiência …`, e a ativa é marcada com `*`.
- **Hero estilo neofetch:** arte ASCII à esquerda, `chave: valor` à direita e os blocos de cor do tema.
- **Seções em cards-janela:** borda dupla com o título embutido (`╡ 01. sobre ╞`).
- **Rodapé estilo modeline do vim.**
- **Tema escuro/claro:** escuro por padrão. A troca pelo botão fica salva no navegador.
- **Acessibilidade:** link "pular para o conteúdo", foco visível e respeito a `prefers-reduced-motion`.
- **Impressão:** imprime limpo, em papel claro.
- **Bilíngue:** `/` em português e `/en/` em inglês, com seletor `[pt|en]` na barra.
- **Animações:** boot do monitor CRT, neofetch "executando", janelas abrindo ao rolar e títulos que decodificam.

## Tecnologias

- Vue 3 (Composition API) + Vue Router
- Vite + [vite-ssg](https://github.com/antfu-collective/vite-ssg): o build pré-renderiza cada página em HTML estático
- [@unhead/vue](https://unhead.unjs.io): `<head>` por idioma
- CSS puro com tokens (`src/assets/theme.css`), sem framework
- Fontes: VT323 e IBM Plex Mono (Google Fonts)

## Rodando localmente

```bash
git clone https://github.com/saviogodinho2002/curriculo_savio.EXE.git
cd curriculo_savio.EXE
npm install
npm run dev       # http://localhost:5173
npm run build     # gera dist/ com o HTML pré-renderizado (/, /en/, /matrix/)
npm run preview   # serve o build localmente
```

## Editando o conteúdo

Todo o texto vem de **`src/data/curriculum.json`** (português) e **`src/data/curriculum.en.json`** (inglês), com o mesmo formato: nome, resumo, habilidades, afinidades, experiências, formação, projetos, contato. Edite os dois. Os textos fixos da interface (rótulos, botões, prompts) ficam em `src/i18n/ui.js`.

Convenções que o site entende:

- **`descricao`:** um item por linha, começando com `•`.
- **Linha `• Tecnologias: A, B, C.`:** dentro de uma experiência, vira tags.
- **`periodo`:** `Janeiro de 2023 - Presente` (pt) ou `January 2023 - Present` (en); aparece como `[jan/2023 → presente]`.
- **`**trecho**`:** destaca o trecho em âmbar (números como `+44%` são destacados sozinhos).
- **Nome de projeto `Título – subtítulo`:** é separado em título e subtítulo.
- **Projeto com `"link": "#"`:** fica sem botão de abrir.

Outros campos:

- **`empresa_atual`:** o que aparece em `empresa:` no hero.
- **`habilidades_grupos`:** os níveis da stack (principal / trabalho regular / experiência com). `habilidades` é a lista curta usada no hero.
- **`hackathons`:** prêmios, mostrados numa seção própria, separada dos projetos.
- **`idiomas`:** aparecem na seção de skills.

A foto em dot art do hero fica em `src/data/dot-art-dark.txt` (tema escuro) e `src/data/dot-art-light.txt` (tema claro).

Os PDFs ficam em `public/cv/` com URL fixa: `savio-godinho-curriculo.pdf` (pt) e `savio-godinho-resume.pdf` (en).

## SEO e IAs

Tudo é gerado no `npm run build` a partir dos JSONs, então nunca fica desatualizado:

- **HTML estático** de `/` e `/en/` com o conteúdo completo, `title`/`description` por idioma, `canonical`, `hreflang` (pt-BR, en, x-default), Open Graph com imagem e JSON-LD `ProfilePage` + `Person` (`src/seo/head.js`).
- **`sitemap.xml`** e **`robots.txt`** (`src/seo/files.js`).
- **`/llms.txt`** (também em `/llm.txt`), **`/llms-full.txt`** e as páginas em Markdown **`/index.md`** e **`/en/index.md`**, no padrão [llmstxt.org](https://llmstxt.org) (`src/seo/llms.js`).
- A URL do site fica numa constante só: `SITE_URL` em `src/seo/site.js`.

Arquivos gerados por script (rodar de novo quando o conteúdo mudar; precisam do Google Chrome):

```bash
node scripts/og/build-og.mjs       # public/og/og-{pt,en}.png (imagem de compartilhamento 1200×630)
node scripts/cv-pdf/build-pdf.mjs  # public/cv/savio-godinho-resume.pdf (currículo em inglês)
```

## Estrutura

```
src/
├── assets/
│   ├── theme.css            # tokens de cor dos temas escuro/claro
│   ├── portfolio.css        # base global + primitivos (.btn, .chip, .kv…)
│   ├── matrix-legacy.css    # estilos do jogo /matrix (não mexer)
│   └── crt.css              # estilos do jogo /matrix
├── components/
│   ├── TopBar.vue           # barra tmux
│   ├── HeroFetch.vue        # hero neofetch
│   ├── TermWindow.vue       # card-janela
│   ├── LogEntry.vue         # item de linha do tempo (experiência/formação)
│   ├── StatusBar.vue        # rodapé vim
│   ├── ThemeToggle.vue
│   ├── sections/            # conteúdo de cada seção
│   ├── MatrixScreen.vue     # jogo /matrix
│   └── TypeSound.js         # sons do jogo
├── composables/             # useTheme, useLocale, useReveal, useActiveSection
├── data/                    # curriculum.json, curriculum.en.json, sections.js, dot art
├── i18n/ui.js               # textos da interface (pt/en)
├── seo/                     # head, sitemap/robots, llms.txt, URLs
├── utils/parseCv.js         # transforma os textos do JSON
└── views/                   # PortfolioView (/ e /en/), MatrixView (/matrix)
public/
├── cv/                      # PDFs (pt e en)
├── og/                      # imagens de compartilhamento
└── 404.html
scripts/                     # geradores das imagens og e do PDF em inglês
```

## Easter egg

Tem um joguinho escondido. A dica está no rodapé. 😉

---

Desenvolvido por Sávio Godinho
