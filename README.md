# CV Terminal

Um currículo interativo em formato de terminal, desenvolvido com Vue.js. Esta aplicação simula um terminal de linha de comando que permite ao usuário explorar informações de currículo de forma interativa.

![Preview do CV Terminal](screenshot.png)

## Características

- Interface retro de terminal com efeitos visuais nostálgicos
- Digitação animada com diferentes velocidades configuráveis
- Efeitos sonoros de digitação (opcional)
- Layout em duas colunas: histórico de comandos e saída
- Menu de ajuda com lista de comandos disponíveis
- Suporte a navegação pelo histórico de comandos

## Tecnologias Utilizadas

- Vue.js 3 (Composition API)
- Vite
- JavaScript ES6+
- CSS3 com animações e efeitos

## Instalação

```bash
# Clonar o repositório
git clone https://github.com/saviogodinho2002/cv-terminal.git

# Entrar no diretório do projeto
cd cv-terminal

# Instalar dependências
npm install
```

## Executando a aplicação

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Construir para produção
npm run build

# Visualizar build de produção localmente
npm run preview
```

## Comandos Disponíveis no Terminal

O terminal interativo suporta os seguintes comandos:

- `help` - Mostra a lista de comandos disponíveis
- `about` - Exibe informações pessoais
- `basic` - Mostra as informações básicas iniciais
- `all` - Exibe todas as informações do CV
- `contact` - Mostra informações de contato
- `experience` - Exibe experiência profissional
- `skills` - Mostra habilidades técnicas
- `afinidades` - Mostra afinidades profissionais
- `education` - Mostra formação acadêmica
- `projects` - Exibe projetos e prêmios
- `image` - Mostra a imagem ASCII
- `pdf` - Baixa o currículo em formato PDF
- `sound` - Ativa/desativa os efeitos sonoros
- `clear` - Limpa a tela do terminal
- `speed` - Mostra opções de velocidade de digitação
  - `speed:normal` - Velocidade normal de digitação
  - `speed:fast` - Velocidade rápida de digitação
  - `speed:instant` - Exibição instantânea (sem animação)

## Como Usar

1. Abra a aplicação no navegador
2. O terminal carregará automaticamente as informações básicas
3. Digite comandos na linha de prompt ou use o menu de ajuda (botão `?`)
4. Navegue pelo histórico de comandos com as setas para cima e para baixo
5. Ajuste a velocidade de digitação usando o botão de velocidade ou os comandos `speed`

## Estrutura de Dados

As informações do currículo são armazenadas em formato JSON em `src/data/curriculum.json`. Para personalizar o currículo, basta editar este arquivo.

## Personalização

- Modifique o arquivo `src/data/curriculum.json` para atualizar as informações do CV
- Edite o arquivo `src/components/TerminalScreen.vue` para alterar o comportamento e aparência do terminal
- Personalize os efeitos sonoros em `src/components/TypeSound.js`

## Responsividade

A aplicação é totalmente responsiva e se adapta a diferentes tamanhos de tela, incluindo dispositivos móveis.

---

Desenvolvido por Sávio Godinho Moia Gaia
