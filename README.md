# curriculo_savio.EXE

Portfólio/currículo online de **Sávio Godinho** com estética de terminal antigo: monitor CRT de fósforo verde/âmbar no tema escuro e papel de impressora matricial no tema claro. É um site normal de uma página, sem comandos para digitar.

🔗 https://curriculo-savio-exe.vercel.app

## Visual

- **Barra superior estilo tmux:** as seções aparecem como janelas `0:~ 1:sobre 2:experiência …`, e a ativa é marcada com `*`.
- **Hero estilo neofetch:** arte ASCII à esquerda, `chave: valor` à direita e os blocos de cor do tema.
- **Seções em cards-janela:** borda dupla com o título embutido (`╡ 01. sobre ╞`).
- **Rodapé estilo modeline do vim.**
- **Tema escuro/claro:** escuro por padrão. A troca pelo botão fica salva no navegador.
- **Acessibilidade:** link "pular para o conteúdo", foco visível e respeito a `prefers-reduced-motion`.
- **Impressão:** imprime limpo, em papel claro.

## Tecnologias

- Vue 3 (Composition API) + Vue Router
- Vite
- CSS puro com tokens (`src/assets/theme.css`), sem framework
- Fontes: VT323 e IBM Plex Mono (Google Fonts)

## Rodando localmente

```bash
git clone https://github.com/saviogodinho2002/curriculo_savio.EXE.git
cd curriculo_savio.EXE
npm install
npm run dev       # http://localhost:5173
npm run build     # gera dist/
npm run preview   # serve o build localmente
```

## Editando o conteúdo

Todo o texto vem de **`src/data/curriculum.json`**: nome, resumo, habilidades, afinidades, experiências, formação, projetos, contato e arte ASCII. Basta editar esse arquivo.

Convenções que o site entende:

- **`descricao`:** um item por linha, começando com `•`.
- **Linha `• Tecnologias: A, B, C.`:** dentro de uma experiência, vira tags.
- **`periodo`:** no formato `Mês de AAAA - Mês de AAAA` (ou `- Presente`), aparece como `[jan/2023 → presente]`.
- **Nome de projeto `Título – subtítulo`:** é separado em título e subtítulo.
- **Projeto com `"link": "#"`:** fica sem botão de abrir.

Outros campos:

- **`empresa_atual`:** o que aparece em `empresa:` no hero.
- **`habilidades_grupos`:** os níveis da stack (principal / trabalho regular / experiência com). `habilidades` é a lista curta usada no hero.
- **`hackathons`:** prêmios, mostrados numa seção própria, separada dos projetos.
- **`idiomas`:** aparecem na seção de skills.

A foto em dot art do hero fica em `src/data/dot-art-dark.txt` (tema escuro) e `src/data/dot-art-light.txt` (tema claro). O PDF do botão de download fica em `src/assets/curriculo_savio.pdf`.

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
├── composables/             # useTheme, useActiveSection
├── data/                    # curriculum.json, sections.js
├── utils/parseCv.js         # transforma os textos do JSON
└── views/                   # PortfolioView (/), MatrixView (/matrix)
```

## Easter egg

Tem um joguinho escondido. A dica está no rodapé. 😉

---

Desenvolvido por Sávio Godinho
