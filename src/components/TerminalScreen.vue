<script setup>
import { ref, onMounted, reactive, onUnmounted, watch } from 'vue';
import typeSound from './TypeSound';
import cvDataJson from '../data/curriculum.json';
import curriculo from '../assets/curriculo_savio.pdf';

// Configurações de velocidade de digitação
const speedSettings = {
  normal: {
    typingSpeed: 10, // velocidade em ms
    lineDelay: 150,  // tempo entre cada linha
    commandDelay: 500 // tempo entre a digitação do comando e a execução
  },
  fast: {
    typingSpeed: 3,
    lineDelay: 50,
    commandDelay: 200
  },
  instant: {
    typingSpeed: 0,
    lineDelay: 0,
    commandDelay: 0
  }
};

// Referências reativas para as velocidades
const typingSpeed = ref(speedSettings.normal.typingSpeed);
const lineDelay = ref(speedSettings.normal.lineDelay);
const commandDelay = ref(speedSettings.normal.commandDelay);

// Estado do terminal
const state = reactive({
  lines: [], // Linhas para a coluna principal (saída)
  commandLines: [], // Linhas de histórico de comandos (coluna esquerda)
  isTyping: false,
  promptVisible: false,
  currentInput: '',
  commandHistory: [],
  historyIndex: -1,
  isSoundEnabled: false,
  activeCommand: null, // Comando ativo atualmente
  helpVisible: false, // Estado para controlar a visibilidade do dropdown de ajuda
  speedMenuVisible: false, // Estado para controlar a visibilidade do menu de velocidade
  currentSpeed: 'normal' // Velocidade atual: normal, fast, instant
});

// Carregar arte ASCII do arquivo JSON
const asciiArt = cvDataJson.asciiArt.split('\n');

// Carregar dados do CV do arquivo JSON
const cvData = reactive(cvDataJson);

// Função para adicionar caractere por caractere
const typeText = async (text, isCommand = false) => {
  state.isTyping = true;
  const newLine = { text: '', isCommand, finished: false };
  state.lines.push(newLine);
  
  const lineIndex = state.lines.length - 1;
  
  for (let i = 0; i < text.length; i++) {
    // Som de digitação a cada caractere
    if (state.isSoundEnabled) {
      // Adiciona variação aleatória para não tocar em todos os caracteres
      if (Math.random() > 0.3) {
        typeSound.typeKey();
      }
    }
    
    state.lines[lineIndex].text += text[i];
    await new Promise(resolve => setTimeout(resolve, typingSpeed.value));
  }
  
  state.lines[lineIndex].finished = true;
  state.isTyping = false;
  
  return new Promise(resolve => setTimeout(resolve, lineDelay.value));
};

// Função para adicionar múltiplas linhas
const typeMultipleLines = async (text) => {
  const lines = text.split('\n');
  for (const line of lines) {
    await typeText(line);
  }
};

// Adicionar uma linha de comando ao histórico da coluna esquerda
const addCommandLine = (command) => {
  state.commandLines.push({
    text: command,
    timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  });
};

// Exibir prompt do terminal
const showPrompt = async () => {
  // Adicionar lembrete antes do prompt
  if (state.lines.length > 0) {
    // Adicionar uma linha em branco antes do lembrete
    await typeText(' ');
    // Adicionar o lembrete com uma classe especial
    const newLine = { text: 'Digite "help" para ver a lista de comandos disponíveis,\nou escolha o comando no menu de ajuda.', isCommand: false, finished: true, isHint: true };
    state.lines.push(newLine);
    await new Promise(resolve => setTimeout(resolve, lineDelay.value));
  }
  
  await new Promise(resolve => setTimeout(resolve, commandDelay.value));
  state.promptVisible = true;
  scrollToBottom();
};

// Mostrar apenas as informações básicas do CV
const showBasicInfo = async () => {
  // Mostrar ASCII Art
  for (const line of asciiArt) {
    await typeText(line);
  }
  
  // Informações básicas
  await typeText('=========================================');
  await typeText(`Nome: ${cvData.nome}`);
  await typeText(`Título: ${cvData.titulo}`);
  await typeText(`Localização: ${cvData.contato.localizacao}`);
  await typeText('=========================================');
  
  // Resumo
  await typeText('RESUMO PROFISSIONAL:');
  await typeMultipleLines(cvData.resumo);
  await typeText(' ');

  await typeText('AFINIDADES PROFISSIONAIS:');
    for (const afinidade of cvData.afinidades) {
        await typeText(`• ${afinidade}`);
    }
    await typeText(' ');
  await typeText('CONTATOS:');
  await typeText(`Email: ${cvData.contato.email}`);
  await typeText(`Telefone: ${cvData.contato.telefone}`);
  await typeText(`LinkedIn: ${cvData.contato.linkedin}`);
  await typeText(`GitHub: ${cvData.contato.github}`);
  await typeText(' ');
  
  // Instruções
 /*  await typeText('=========================================');
  await typeText('Digite "help" para ver a lista de comandos.');
  await typeText('Digite "sound" para ativar efeitos sonoros.');
  await typeText('========================================='); */
};

// Mostrar todas as informações do CV
const showAllInfo = async () => {
  // Mostrar ASCII Art
  for (const line of asciiArt) {
    await typeText(line);
  }
  
  // Informações básicas
  await typeText('=========================================');
  await typeText(`Nome: ${cvData.nome}`);
  await typeText(`Título: ${cvData.titulo}`);
  await typeText(`Localização: ${cvData.contato.localizacao}`);
  await typeText('=========================================');
  
  //

  const link = document.createElement('a');
      link.href = curriculo;
      link.setAttribute('download', 'curriculo_savio.pdf');
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      document.body.removeChild(link);
      
      
      // Adicionar link clicável
      const linkLine = { 
        text: 'Currículo Sávio Godinho (PDF)', 
        isCommand: false, 
        finished: true, 
        isLink: true,
        url: curriculo,
        isDownload: true
      };
      state.lines.push(linkLine);

  // Resumo
  await typeText('RESUMO PROFISSIONAL:');
  await typeMultipleLines(cvData.resumo);
  await typeText(' ');
  
  // Habilidades
  await typeText('HABILIDADES TÉCNICAS:');
  for (const skill of cvData.habilidades) {
    await typeText(`• ${skill}`);
  }
  await typeText(' ');
  
  // Experiência
  await typeText('EXPERIÊNCIA PROFISSIONAL:');
  for (const exp of cvData.experiencias) {
    await typeText(`${exp.cargo}`);
    await typeText(`${exp.empresa}`);
    await typeText(`${exp.periodo}`);
    await typeMultipleLines(exp.descricao);
    await typeText(' ');
  }
  
  // Formação
  await typeText('FORMAÇÃO ACADÊMICA:');
  for (const edu of cvData.formacao) {
    await typeText(`${edu.curso}`);
    await typeText(`${edu.instituicao}`);
    await typeText(`${edu.periodo}`);
    if (edu.descricao) {
      await typeMultipleLines(edu.descricao);
    }
    await typeText(' ');
  }
  
  // Projetos/Prêmios
  await typeText('CONQUISTAS E PROJETOS:');
  for (const proj of cvData.projetos) {
    await typeText(`${proj.nome}`);
    await typeText(`${proj.descricao}`);
    await typeText(' ');
  }
  
  // Contato
  await typeText('CONTATO:');
  await typeText(`Email: ${cvData.contato.email}`);
  await typeText(`Telefone: ${cvData.contato.telefone}`);
  await typeText(`LinkedIn: ${cvData.contato.linkedin}`);
  await typeText(`GitHub: ${cvData.contato.github}`);
  await typeText(' ');
  
  // Instruções
  /* await typeText('=========================================');
  await typeText('Digite "help" para ver a lista de comandos.');
  await typeText('Digite "sound" para ativar efeitos sonoros.');
  await typeText('========================================='); */
};

// Limpar a saída de comandos
const clearOutput = () => {
  state.lines = [];
};

// Alternar a visibilidade do menu de velocidade
const toggleSpeedMenu = () => {
  state.speedMenuVisible = !state.speedMenuVisible;
};

// Mudar a velocidade de digitação
const changeSpeed = (speed) => {
  if (!speedSettings[speed]) return;
  
  state.currentSpeed = speed;
  typingSpeed.value = speedSettings[speed].typingSpeed;
  lineDelay.value = speedSettings[speed].lineDelay;
  commandDelay.value = speedSettings[speed].commandDelay;
  
  // Fechar o menu de velocidade
  state.speedMenuVisible = false;
};

// Processar comando
const processCommand = async (cmd) => {
  // Limpar saída para novos resultados
  state.lines = [];
  
  // Adicionar ao histórico de comandos
  addCommandLine(cmd);
  
  // Guarda o comando atual
  state.activeCommand = cmd;
  
  // Adicionar ao histórico de comandos para navegação
  state.commandHistory.unshift(cmd);
  
  // Limpar input atual
  state.currentInput = '';
  
  // Processar comandos
  switch (cmd.trim().toLowerCase()) {
    case 'help':
      await typeText('Comandos disponíveis:');
      await typeText('  help        - Mostra esta lista de comandos');
      await typeText('  about       - Exibe informações pessoais');
      await typeText('  basic       - Mostra as informações básicas iniciais');
      await typeText('  pdf         - Baixa o currículo em formato PDF');
      await typeText('  curriculum         - Exibe todas as informações do CV');
      await typeText('  contact     - Mostra informações de contato');
      await typeText('  experience  - Exibe experiência profissional');
      await typeText('  skills      - Mostra habilidades técnicas');
      await typeText('  afinidades  - Mostra afinidades profissionais');
      await typeText('  education   - Mostra formação acadêmica');
      await typeText('  projects    - Exibe projetos e prêmios');
      await typeText('  image       - Mostra a imagem ASCII');
      
      await typeText('  sound       - Ativa/desativa os efeitos sonoros');
      await typeText('  clear       - Limpa a tela do terminal');
      await typeText('  speed       - Mostra e altera a velocidade de digitação');
      await typeText('  speed:normal - Velocidade normal de digitação');
      await typeText('  speed:fast   - Velocidade rápida de digitação');
      await typeText('  speed:instant - Exibição instantânea (sem animação)');
      break;
      
    case 'curriculum':
      await showAllInfo();
      break;
    case 'about':
      await typeMultipleLines(cvData.resumo);
      break;
    case 'skills':
      for (const skill of cvData.habilidades) {
        await typeText(`• ${skill}`);
      }
      break;
    case 'afinidades':
      await typeText('AFINIDADES PROFISSIONAIS:');
      for (const afinidade of cvData.afinidades) {
        await typeText(`• ${afinidade}`);
      }
      break;
    case 'experience':
      for (const exp of cvData.experiencias) {
        await typeText(`${exp.cargo}`);
        await typeText(`${exp.empresa}`);
        await typeText(`${exp.periodo}`);
        await typeMultipleLines(exp.descricao);
        await typeText(' ');
      }
      break;
    case 'education':
      for (const edu of cvData.formacao) {
        await typeText(`${edu.curso}`);
        await typeText(`${edu.instituicao}`);
        await typeText(`${edu.periodo}`);
        if (edu.descricao) {
          await typeMultipleLines(edu.descricao);
        }
        await typeText(' ');
      }
      break;
    case 'basic':
      await showBasicInfo();
      break;
    case 'projects':
      await typeText('CONQUISTAS E PROJETOS:');
      for (const proj of cvData.projetos) {
        await typeText(`${proj.nome}`);
        await typeText(`${proj.descricao}`);
        await typeText(' ');
      }
      break;
    case 'contact':
      await typeText(`Email: ${cvData.contato.email}`);
      await typeText(`Telefone: ${cvData.contato.telefone}`);
      await typeText(`LinkedIn: ${cvData.contato.linkedin}`);
      await typeText(`GitHub: ${cvData.contato.github}`);
      await typeText(`Localização: ${cvData.contato.localizacao}`);
      break;
    case 'image':
      for (const line of asciiArt) {
        await typeText(line);
      }
      break;
    case 'pdf':
      await typeText('Baixando currículo em PDF...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Criar um link temporário para download
      const link = document.createElement('a');
      link.href = curriculo;
      link.setAttribute('download', 'curriculo_savio.pdf');
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      await typeText('Download iniciado! Se o download não começar automaticamente, clique no link abaixo:');
      
      // Adicionar link clicável
      const linkLine = { 
        text: 'Currículo Sávio Godinho (PDF)', 
        isCommand: false, 
        finished: true, 
        isLink: true,
        url: curriculo,
        isDownload: true
      };
      state.lines.push(linkLine);
      
      break;
    case 'sound':
      state.isSoundEnabled = !state.isSoundEnabled;
      if (state.isSoundEnabled) {
        // Inicializa o contexto de áudio no primeiro uso
        typeSound.init();
        await typeText('Som ativado');
        typeSound.bootSound();
      } else {
        await typeText('Som desativado');
      }
      break;
    case 'clear':
      clearOutput();
      break;
    case 'speed':
      await typeText('Velocidade atual: ' + state.currentSpeed);
      await typeText('Para mudar a velocidade, use um dos comandos:');
      await typeText('  speed:normal   - Velocidade normal de digitação');
      await typeText('  speed:fast     - Velocidade rápida de digitação');
      await typeText('  speed:instant  - Exibição instantânea (sem animação)');
      break;
    case 'speed:normal':
      changeSpeed('normal');
      await typeText('Velocidade alterada para: normal');
      break;
    case 'speed:fast':
      changeSpeed('fast');
      await typeText('Velocidade alterada para: rápida');
      break;
    case 'speed:instant':
      changeSpeed('instant');
      await typeText('Velocidade alterada para: instantânea');
      break;
    default:
      if (state.isSoundEnabled) {
        typeSound.beep();
      }
      await typeText(`Comando não reconhecido: ${cmd}`);
      await typeText('Digite "help" para ver a lista de comandos.');
      break;
  }
  
  // Exibir prompt novamente
  await showPrompt();
};

// Executar um comando pelo clique no histórico
const executeCommandFromHistory = (command) => {
  if (state.isTyping) return;
  
  // Lista de comandos válidos
  const validCommands = ['help', 'about', 'curriculum', 'contact', 'experience', 'skills', 
                         'afinidades', 'education', 'projects', 'image', 'basic', 
                         'pdf', 'sound', 'clear', 'speed', 'speed:normal', 'speed:fast', 'speed:instant'];
  
  // Verificar se o comando é válido antes de executar
  if (validCommands.includes(command.toLowerCase())) {
    processCommand(command);
  } else {
    // Som de erro se o comando for inválido e o som estiver ativado
    if (state.isSoundEnabled) {
      typeSound.beep();
    }
  }
};

// Limpar histórico de comandos
const clearCommandHistory = () => {
  state.commandLines = [];
  state.commandHistory = [];
  state.historyIndex = -1;
  
  // Adicionar indicação que o histórico foi limpo
  addCommandLine('histórico limpo');
  
  // Som de beep se o som estiver ativado
  if (state.isSoundEnabled) {
    typeSound.beep();
  }
};

// Tratar teclas pressionadas
const handleKeyDown = (e) => {
  if (state.isTyping || !state.promptVisible) return;
  
  if (e.key === 'Enter') {
    if (state.currentInput.trim()) {
      // Verificar se o comando é válido
      const validCommands = ['help', 'about', 'curriculum', 'contact', 'experience', 'skills', 
                           'afinidades', 'education', 'projects', 'image', 'basic',
                           'pdf', 'sound', 'clear', 'speed', 'speed:normal', 'speed:fast', 'speed:instant'];
      
      if (validCommands.includes(state.currentInput.trim().toLowerCase())) {
        const command = state.currentInput.trim();
        state.currentInput = ''; // Limpar o campo de entrada
        processCommand(command);
      } else {
        // Som de erro se o comando for inválido e o som estiver ativado
        if (state.isSoundEnabled) {
          typeSound.beep();
        }
        // Mostrar mensagem de comando inválido
        state.promptVisible = false;
        state.isTyping = true;
        
        // Guardar o comando inválido e limpar o campo
        const invalidCommand = state.currentInput.trim();
        state.currentInput = '';
        
        setTimeout(async () => {
          await typeText(`Comando não reconhecido: ${invalidCommand}`);
          await typeText('Digite "help" para ver a lista de comandos.');
          state.isTyping = false;
          showPrompt();
        }, 100);
      }
    } else {
      // Se pressionar Enter sem comando, só mostra um novo prompt
      state.promptVisible = false;
      setTimeout(() => {
        showPrompt();
      }, 100);
    }
  } else if (e.key === 'Backspace') {
    if (state.currentInput.length > 0) {
      state.currentInput = state.currentInput.slice(0, -1);
      // Som de digitação no backspace
      if (state.isSoundEnabled) {
        typeSound.typeKey();
      }
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (state.historyIndex < state.commandHistory.length - 1) {
      state.historyIndex++;
      state.currentInput = state.commandHistory[state.historyIndex];
    }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (state.historyIndex > 0) {
      state.historyIndex--;
      state.currentInput = state.commandHistory[state.historyIndex];
    } else if (state.historyIndex === 0) {
      state.historyIndex = -1;
      state.currentInput = '';
    }
  } else if (e.key.length === 1) {
    state.currentInput += e.key;
    // Som de digitação
    if (state.isSoundEnabled) {
      typeSound.typeKey();
    }
  }
  
  scrollToBottom();
};

// Scroll para o fim do terminal
const scrollToBottom = () => {
  setTimeout(() => {
    window.scrollTo(0, document.body.scrollHeight);
    const terminalContent = document.querySelector('.output-content');
    if (terminalContent) {
      terminalContent.scrollTop = terminalContent.scrollHeight;
    }
  }, 0);
};

// Alternar a visibilidade da ajuda
const toggleHelp = () => {
  state.helpVisible = !state.helpVisible;
};

// Inicialização
const initTerminal = async () => {
  // Adicionar evento de teclado
  window.addEventListener('keydown', handleKeyDown);
  
  // Adicionar comando inicial
  addCommandLine('curriculum');
  
  // Mostrar apenas informações básicas
  await showAllInfo();
  
  // Mostrar prompt
  await showPrompt();
};

// Remove o evento de teclado ao desmontar o componente
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

onMounted(initTerminal);

// Adicionar uma classe ao corpo quando estiver digitando
watch(() => state.isTyping, (isTyping) => {
  if (isTyping) {
    document.body.classList.add('typing');
  } else {
    document.body.classList.remove('typing');
  }
});

// Adicionando a função downloadPDF ao componente
const downloadPDF = (pdfUrl) => {
  // Criar um link temporário para download
  const link = document.createElement('a');
  link.href = pdfUrl;
  link.setAttribute('download', 'curriculo_savio.pdf');
  link.setAttribute('target', '_blank');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Opcional: fornecer feedback visual de que o download foi iniciado
  if (state.isSoundEnabled) {
    typeSound.bootSound(); // Tocar um som para indicar que o download começou
  }
};
</script>

<template>
  <div class="terminal-layout">
    <!-- Coluna esquerda - histórico de comandos -->
    <div class="command-history">
      <div class="history-header">
        <h3>Histórico de Comandos</h3>
        <div class="header-buttons">
          <button @click="toggleSpeedMenu" class="speed-button" title="Ajustar velocidade">
            <span v-if="state.currentSpeed === 'normal'">⏱️</span>
            <span v-else-if="state.currentSpeed === 'fast'">⚡</span>
            <span v-else>🚀</span>
          </button>
          <button @click="clearCommandHistory" class="clear-button" title="Limpar histórico">🗑️</button>
          <button @click="toggleHelp" class="help-button">?</button>
        </div>
      </div>
      
      <!-- Menu de velocidade -->
      <div v-if="state.speedMenuVisible" class="speed-dropdown">
        <div class="speed-header">
          <h4>Velocidade de Digitação:</h4>
          <button @click="toggleSpeedMenu" class="close-button">×</button>
        </div>
        <ul>
          <li 
            @click="changeSpeed('normal')" 
            :class="{ 'active': state.currentSpeed === 'normal' }">
            <span class="speed-icon">⏱️</span>
            <span class="speed-label">Normal</span>
          </li>
          <li 
            @click="changeSpeed('fast')" 
            :class="{ 'active': state.currentSpeed === 'fast' }">
            <span class="speed-icon">⚡</span>
            <span class="speed-label">Rápida</span>
          </li>
          <li 
            @click="changeSpeed('instant')" 
            :class="{ 'active': state.currentSpeed === 'instant' }">
            <span class="speed-icon">🚀</span>
            <span class="speed-label">Instantânea</span>
          </li>
        </ul>
      </div>
      
      <!-- Dropdown de ajuda com comandos disponíveis -->
      <div v-if="state.helpVisible" class="help-dropdown">
        <div class="help-header">
          <h4>Comandos Disponíveis:</h4>
          <button @click="toggleHelp" class="close-button">×</button>
        </div>
        <ul>
          <li>
            <div class="command-item">
              <button @click="processCommand('help'); toggleHelp();" class="run-button" title="Executar comando">▶️</button>
              <div class="command-description">
                <strong>help</strong> - Mostra esta lista de comandos
              </div>
            </div>
          </li>
          <li>
            <div class="command-item">
              <button @click="processCommand('about'); toggleHelp();" class="run-button" title="Executar comando">▶️</button>
              <div class="command-description">
                <strong>about</strong> - Exibe informações pessoais
              </div>
            </div>
          </li>
          <li>
            <div class="command-item">
              <button @click="processCommand('basic'); toggleHelp();" class="run-button" title="Executar comando">▶️</button>
              <div class="command-description">
                <strong>basic</strong> - Mostra as informações básicas iniciais
              </div>
            </div>
          </li>
          <li>
            <div class="command-item">
              <button @click="processCommand('pdf'); toggleHelp();" class="run-button" title="Executar comando">▶️</button>
              <div class="command-description">
                <strong>pdf</strong> - Baixa o currículo em formato PDF
              </div>
            </div>
          </li>
          <li>
            <div class="command-item">
              <button @click="processCommand('curriculum'); toggleHelp();" class="run-button" title="Executar comando">▶️</button>
              <div class="command-description">
                <strong>curriculum</strong> - Exibe todas as informações do CV
              </div>
            </div>
          </li>
          <li>
            <div class="command-item">
              <button @click="processCommand('contact'); toggleHelp();" class="run-button" title="Executar comando">▶️</button>
              <div class="command-description">
                <strong>contact</strong> - Mostra informações de contato
              </div>
            </div>
          </li>
          <li>
            <div class="command-item">
              <button @click="processCommand('experience'); toggleHelp();" class="run-button" title="Executar comando">▶️</button>
              <div class="command-description">
                <strong>experience</strong> - Exibe experiência profissional
              </div>
            </div>
          </li>
          <li>
            <div class="command-item">
              <button @click="processCommand('skills'); toggleHelp();" class="run-button" title="Executar comando">▶️</button>
              <div class="command-description">
                <strong>skills</strong> - Mostra habilidades técnicas
              </div>
            </div>
          </li>
          <li>
            <div class="command-item">
              <button @click="processCommand('afinidades'); toggleHelp();" class="run-button" title="Executar comando">▶️</button>
              <div class="command-description">
                <strong>afinidades</strong> - Mostra afinidades profissionais
              </div>
            </div>
          </li>
          <li>
            <div class="command-item">
              <button @click="processCommand('education'); toggleHelp();" class="run-button" title="Executar comando">▶️</button>
              <div class="command-description">
                <strong>education</strong> - Mostra formação acadêmica
              </div>
            </div>
          </li>
          <li>
            <div class="command-item">
              <button @click="processCommand('projects'); toggleHelp();" class="run-button" title="Executar comando">▶️</button>
              <div class="command-description">
                <strong>projects</strong> - Exibe projetos e prêmios
              </div>
            </div>
          </li>
          <li>
            <div class="command-item">
              <button @click="processCommand('image'); toggleHelp();" class="run-button" title="Executar comando">▶️</button>
              <div class="command-description">
                <strong>image</strong> - Mostra a imagem ASCII
              </div>
            </div>
          </li>
          
          <li>
            <div class="command-item">
              <button @click="processCommand('sound'); toggleHelp();" class="run-button" title="Executar comando">▶️</button>
              <div class="command-description">
                <strong>sound</strong> - Ativa/desativa os efeitos sonoros
              </div>
            </div>
          </li>
          <li>
            <div class="command-item">
              <button @click="processCommand('clear'); toggleHelp();" class="run-button" title="Executar comando">▶️</button>
              <div class="command-description">
                <strong>clear</strong> - Limpa a tela do terminal
              </div>
            </div>
          </li>
          <li>
            <div class="command-item">
              <button @click="processCommand('speed'); toggleHelp();" class="run-button" title="Executar comando">▶️</button>
              <div class="command-description">
                <strong>speed</strong> - Mostra e altera a velocidade de digitação
              </div>
            </div>
          </li>
          <li>
            <div class="command-item">
              <button @click="processCommand('speed:normal'); toggleHelp();" class="run-button" title="Executar comando">▶️</button>
              <div class="command-description">
                <strong>speed:normal</strong> - Velocidade normal de digitação
              </div>
            </div>
          </li>
          <li>
            <div class="command-item">
              <button @click="processCommand('speed:fast'); toggleHelp();" class="run-button" title="Executar comando">▶️</button>
              <div class="command-description">
                <strong>speed:fast</strong> - Velocidade rápida de digitação
              </div>
            </div>
          </li>
          <li>
            <div class="command-item">
              <button @click="processCommand('speed:instant'); toggleHelp();" class="run-button" title="Executar comando">▶️</button>
              <div class="command-description">
                <strong>speed:instant</strong> - Exibição instantânea (sem animação)
              </div>
            </div>
          </li>
        </ul>
      </div>
      
      <div class="history-content">
        <div v-for="(cmd, index) in state.commandLines" 
             :key="index" 
             class="history-item"
             :class="{ 'active': state.activeCommand === cmd.text }"
             @click="executeCommandFromHistory(cmd.text)">
          <span class="cmd-time">{{ cmd.timestamp }}</span>
          <span class="cmd-text">{{ cmd.text }}</span>
        </div>
      </div>
      <div class="history-input" :class="{ 'disabled': state.isTyping }">
        <div class="prompt-line">
          <span class="prompt">user@retro-terminal:~$</span>
          <span class="input-text">{{ state.currentInput }}</span>
          <span class="cursor" :class="{ 'blink': !state.isTyping }"></span>
        </div>
      </div>
    </div>
    
    <!-- Coluna direita - saída dos comandos -->
    <div class="output-panel">
      <div class="output-header">
        <h3>Saída do Terminal</h3>
      </div>
      <div class="output-content">
        <div v-for="(line, index) in state.lines" :key="index" class="terminal-line">
          <div v-if="line.isLink" 
               @click="line.isDownload ? downloadPDF(curriculo) : window.open(line.url, '_blank')" 
               :class="{ 
                 'command-line': line.isCommand, 
                 'ascii-art': line.text.includes('⣿'),
                 'hint-line': line.isHint,
                 'link-line': line.isLink,
                 'download-link': line.isDownload
               }">
            {{ line.text }}
          </div>
          <div v-else :class="{ 
            'command-line': line.isCommand, 
            'ascii-art': line.text.includes('⣿'),
            'hint-line': line.isHint 
          }">{{ line.text }}</div>
        </div>
      </div>
    </div>
    
    <!-- Indicador de digitação desativada -->
    <div v-if="state.isTyping" class="typing-indicator">
      Aguarde... processando saída
    </div>
    
    <div class="terminal-overlay"></div>
  </div>
</template>

<style scoped>
.terminal-layout {
  display: flex;
  width: 100%;
  height: 100%;
  gap: 10px;
  padding: 10px;
  box-sizing: border-box;
  position: relative;
}

/* Estilos da coluna de histórico de comandos */
.command-history {
  flex: 0 0 30%;
  display: flex;
  flex-direction: column;
  background-color: rgba(0, 0, 0, 0.8);
  border: 1px solid #00aa00;
  border-radius: 5px;
  overflow: hidden;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #1b1b1b;
  border-bottom: 1px solid #333;
}

.history-header h3 {
  margin: 0;
  color: #00ff00;
  font-size: 1em;
  text-align: center;
}

.header-buttons {
  display: flex;
  gap: 8px;
}

.speed-button {
  background-color: #333;
  color: #33ccff;
  border: 1px solid #33ccff;
  border-radius: 4px;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
}

.speed-button:hover {
  background-color: #33ccff;
  color: #000;
}

.clear-button {
  background-color: #333;
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
  border-radius: 4px;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
}

.clear-button:hover {
  background-color: #ff6b6b;
  color: #000;
}

.help-button {
  background-color: #333;
  color: #0f0;
  border: 1px solid #0f0;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: bold;
  padding: 0;
}

.help-button:hover {
  background-color: #0f0;
  color: #000;
}

.help-dropdown {
  position: absolute;
  width: 30%; /* Mesmo tamanho da coluna de histórico de comandos */
  max-width: 100%;
  background-color: #111;
  border: 1px solid #0f0;
  padding: 10px;
  z-index: 10;
  color: #0f0;
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
  top: 40px; /* Posicionamento abaixo do cabeçalho */
  left: 0;
}

.help-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  border-bottom: 1px solid #0f0;
  padding-bottom: 5px;
}

.help-header h4 {
  margin: 0;
}

.help-dropdown ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.help-dropdown li {
  padding: 5px 0;
  border-bottom: 1px dotted #333;
}

.help-dropdown li:last-child {
  border-bottom: none;
}

.close-button {
  background-color: transparent;
  color: #0f0;
  border: 1px solid #0f0;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  padding: 0;
}

.close-button:hover {
  background-color: #0f0;
  color: #000;
}

.history-content {
  flex: 1;
  overflow-y: auto;
  padding: 5px;
}

.history-item {
  padding: 5px 10px;
  margin-bottom: 5px;
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s;
}

.history-item:hover {
  background-color: rgba(0, 255, 0, 0.1);
}

.history-item.active {
  background-color: rgba(0, 255, 0, 0.2);
  border-left: 3px solid #00ff00;
}

.cmd-time {
  font-size: 0.8em;
  color: #00aa00;
}

.cmd-text {
  font-weight: bold;
  color: #00ff00;
}

.history-input {
  padding: 10px;
  border-top: 1px solid #00aa00;
  background-color: rgba(0, 0, 0, 0.5);
  position: relative;
  cursor: text;
}

/* Estilo para quando não é possível digitar */
.history-input::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: none;
  z-index: 5;
  cursor: not-allowed;
}

.history-input.disabled::before {
  display: block;
}

/* Estilos da coluna de saída de comandos */
.output-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: rgba(0, 0, 0, 0.8);
  border: 1px solid #00aa00;
  border-radius: 5px;
  overflow: hidden;
}

.output-header {
  padding: 10px;
  background-color: rgba(0, 150, 0, 0.2);
  border-bottom: 1px solid #00aa00;
}

.output-header h3 {
  margin: 0;
  color: #00ff00;
  font-size: 1em;
  text-align: center;
}

.output-content {
  flex: 1;
  overflow-y: auto;
  padding: 15px;
  font-size: 14px;
}

/* Estilos do terminal */
.terminal-line {
  padding: 2px 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.command-line {
  color: #00ff00;
  font-weight: bold;
}

.hint-line {
  color: #33ccff;
  font-style: italic;
  font-weight: bold;
  text-align: center;
  border-top: 1px dotted #33ccff;
  border-bottom: 1px dotted #33ccff;
  padding: 5px 0;
  margin: 5px 0;
}

.ascii-art {
  font-family: monospace;
  line-height: 1;
  font-size: 10px;
  letter-spacing: 0;
}

.prompt-line {
  display: flex;
  align-items: center;
  cursor: text;
}

.prompt {
  color: #00ff00;
  font-weight: bold;
  margin-right: 8px;
}

.input-text {
  color: #00ff00;
}

.cursor {
  display: inline-block;
  width: 10px;
  height: 16px;
  background-color: #00ff00;
  margin-left: 2px;
  vertical-align: middle;
}

.cursor.blink {
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* Pequenos efeitos de ruído no terminal */
.terminal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
  background-image: 
    radial-gradient(
      ellipse at center,
      rgba(0, 255, 0, 0.05) 0%,
      rgba(0, 255, 0, 0) 70%
    );
}

/* Estilizar scrollbars */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #000;
}

::-webkit-scrollbar-thumb {
  background: #00aa00;
  border-radius: 3px;
}

/* Ajustes responsivos */
@media (max-width: 768px) {
  .terminal-layout {
    flex-direction: column;
    height: auto;
  }
  
  .command-history, .output-panel {
    flex: none;
    height: 50vh;
  }
  
  .output-content {
    font-size: 12px;
  }
  
  .ascii-art {
    font-size: 4px;
    transform: scale(0.7);
    transform-origin: left top;
  }
}

@media (min-width: 1200px) {
  .output-content {
    font-size: 14px;
  }
  
  .ascii-art {
    font-size: 12px;
  }
}

.typing-indicator {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: #0f0;
  border: 1px solid #0f0;
  padding: 8px 15px;
  border-radius: 4px;
  z-index: 100;
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

/* Adicionar cursor not-allowed ao corpo inteiro quando estiver digitando */
:deep(body) {
  cursor: default;
}

:deep(body.typing) {
  cursor: not-allowed;
}

.speed-dropdown {
  position: absolute;
  width: 30%; /* Mesmo tamanho da coluna de histórico de comandos */
  max-width: 100%;
  background-color: #111;
  border: 1px solid #33ccff;
  padding: 10px;
  z-index: 10;
  color: #33ccff;
  box-shadow: 0 0 10px rgba(51, 204, 255, 0.5);
  top: 40px; /* Posicionamento abaixo do cabeçalho */
  left: 0;
}

.speed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  border-bottom: 1px solid #33ccff;
  padding-bottom: 5px;
}

.speed-header h4 {
  margin: 0;
}

.speed-dropdown ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.speed-dropdown li {
  padding: 8px 10px;
  border-radius: 4px;
  margin-bottom: 5px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.2s;
}

.speed-dropdown li:hover {
  background-color: rgba(51, 204, 255, 0.2);
}

.speed-dropdown li.active {
  background-color: rgba(51, 204, 255, 0.3);
  border-left: 3px solid #33ccff;
}

.speed-icon {
  margin-right: 10px;
  font-size: 16px;
}

.speed-label {
  font-weight: bold;
}

.command-item {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.command-description {
  flex: 1;
}

.run-button {
  background-color: transparent;
  color: #0f0;
  border: 1px solid #0f0;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  padding: 0;
  margin-right: 10px;
  transition: all 0.2s;
}

.run-button:hover {
  background-color: #0f0;
  color: #000;
  transform: scale(1.1);
}

.link-line {
  color: #33ccff;
  text-decoration: underline;
  cursor: pointer;
  font-weight: bold;
}

.link-line:hover {
  color: #00aaff;
  text-decoration: underline;
}

.download-link {
  color: #33ff33; /* Um verde mais brilhante para links de download */
  text-decoration: underline;
  cursor: pointer;
  font-weight: bold;
  display: inline-block;
  padding: 4px 8px;
  border: 1px dotted #33ff33;
  border-radius: 4px;
  margin: 5px 0;
  transition: all 0.2s ease;
}

.download-link:hover {
  color: #000;
  background-color: #33ff33;
  border: 1px solid #33ff33;
}

.download-link::before {
  content: "📥 ";
}
</style>