<script setup>
import { ref, onMounted, reactive, onUnmounted, watch, computed } from 'vue';
import typeSound from './TypeSound';
import cvDataJson from '../data/curriculum.json';
import curriculo from '../assets/curriculo_savio.pdf';
import '../assets/crt.css'; // Importar os estilos CRT

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

// Adicionar detecção de dispositivo móvel
const isMobile = ref(false);

// Verificar se o dispositivo é móvel ao montar o componente
const checkIfMobile = () => {
  isMobile.value = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
};

// Referência para o campo de texto móvel
const mobileInputRef = ref(null);

// Referências reativas para as velocidades
const typingSpeed = ref(speedSettings.normal.typingSpeed);
const lineDelay = ref(speedSettings.normal.lineDelay);
const commandDelay = ref(speedSettings.normal.commandDelay);

// Controle de estado do campo de entrada móvel
const isInputActive = ref(false);

// Adicionar referência para armazenar temporariamente o texto de entrada móvel
const mobileInputText = ref('');

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
  currentSpeed: 'normal', // Velocidade atual: normal, fast, instant
  initialOverlayVisible: true, // Controle para o overlay inicial de ajuda
  isFirstTimeOverlay: true // Flag para controlar se é a primeira vez que o overlay é mostrado
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
      await typeText('  tutorial    - Mostra a tela de ajuda/instruções iniciais');

      await typeText('  basic       - Mostra as informações básicas iniciais');
      await typeText('  pdf         - Baixa o currículo em formato PDF');
      await typeText('  curriculum  - Exibe todas as informações do CV');
      await typeText('  about       - Exibe informações pessoais');

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
    case 'tutorial':
      await typeText('Abrindo a tela de ajuda...');
      state.initialOverlayVisible = true;
      state.isFirstTimeOverlay = false; // Não é mais a primeira vez
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
                         'pdf', 'sound', 'clear', 'speed', 'speed:normal', 'speed:fast', 'speed:instant',
                         'tutorial'];
  
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

// Tratar teclas pressionadas (apenas para desktop)
const handleKeyDown = (e) => {
  if (state.isTyping || !state.promptVisible || isMobile.value) return;
  
  if (e.key === 'Enter') {
    if (state.currentInput.trim()) {
      // Verificar se o comando é válido
      const validCommands = ['help', 'about', 'curriculum', 'contact', 'experience', 'skills', 
                           'afinidades', 'education', 'projects', 'image', 'basic',
                           'pdf', 'sound', 'clear', 'speed', 'speed:normal', 'speed:fast', 'speed:instant',
                           'tutorial'];
      
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

// Função para sincronizar o campo de texto móvel com o estado do terminal
const syncMobileInput = (e) => {
  // Armazenar o texto digitado na referência temporária, não no estado principal
  mobileInputText.value = e.target.value;
  
  if (state.isSoundEnabled) {
    typeSound.typeKey();
  }
};

// Função para enviar o comando do campo móvel
const handleMobileSubmit = () => {
  if (state.isTyping || !state.promptVisible || !mobileInputText.value.trim()) return;
  
  const command = mobileInputText.value.trim();
  mobileInputText.value = ''; // Limpar o campo de entrada temporário
  
  if (mobileInputRef.value) {
    mobileInputRef.value.value = '';
    mobileInputRef.value.blur(); // Esconder o teclado após enviar
  }
  
  isInputActive.value = false; // Desativar o estado de entrada
  processCommand(command);
};

// Função para atualizar o texto visível na interface
const displayInputText = computed(() => {
  // Em dispositivos móveis, mostrar o texto da referência temporária
  // Em desktop, mostrar o texto do estado principal
  return isMobile.value ? mobileInputText.value : state.currentInput;
});

// Função para focar no campo de texto móvel
const focusMobileInput = () => {
  if (isMobile.value && mobileInputRef.value && !state.isTyping && state.promptVisible) {
    mobileInputRef.value.focus();
    isInputActive.value = true;
    
    // Garantir que o campo de entrada tenha o texto correto
    mobileInputRef.value.value = mobileInputText.value;
    
    // Pequeno atraso para garantir que o teclado virtual apareça no iOS
    setTimeout(() => {
      if (mobileInputRef.value) {
        mobileInputRef.value.focus();
      }
    }, 100);
  }
};

// Função para lidar com o desfoque do campo de entrada
const handleInputBlur = () => {
  isInputActive.value = false;
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

// Mostrar instruções iniciais de uso
const showInitialInstructions = async () => {
  await typeText('==================================================');
  await typeText(' BEM-VINDO AO CURRÍCULO TERMINAL!');
  await typeText('==================================================');
  await typeText(' ');
  
  await typeText('📋 GUIA DE USO RÁPIDO:');
  await typeText(' ');
  
  await typeText('1️⃣ LAYOUT:');
  await typeText('  • ESQUERDA: Histórico de comandos digitados e entrada de texto');
  await typeText('  • DIREITA: Saída dos comandos (resultados)');
  await typeText(' ');
  
  await typeText('2️⃣ COMO USAR:');
  await typeText('  • Digite comandos na linha onde vê "user@retro-terminal:~$"');
  await typeText('  • Pressione ENTER para executar o comando');
  await typeText('  • Use as setas ↑↓ para navegar no histórico de comandos');
  await typeText(' ');
  
  await typeText('3️⃣ BOTÕES NA BARRA SUPERIOR:');
  await typeText('  • ⏱️/⚡/🚀: Ajusta a velocidade de digitação do terminal');
  await typeText('  • 🗑️: Limpa o histórico de comandos');
  await typeText('  • ?: Mostra a lista de comandos disponíveis');
  await typeText(' ');
  
  await typeText('4️⃣ DICAS:');
  await typeText('  • Clique em qualquer comando do histórico para executá-lo novamente');
  await typeText('  • Digite "help" para ver todos os comandos disponíveis');
  await typeText('  • Digite "pdf" para baixar o currículo em PDF');
  await typeText('  • Digite "clear" para limpar a tela');
  await typeText(' ');
  
  await typeText('Experimente agora! Digite "help" para começar ou clique no botão "?" no canto superior direito.');
  await typeText('==================================================');
};

// Esconder o overlay de ajuda inicial
const hideInitialOverlay = () => {
  state.initialOverlayVisible = false;
};

// Inicialização
const initTerminal = async () => {
  // Verificar se é dispositivo móvel
  checkIfMobile();
  
  // Adicionar evento para recalcular em caso de redimensionamento
  window.addEventListener('resize', checkIfMobile);
  
  // Adicionar evento de teclado
  window.addEventListener('keydown', handleKeyDown);
  
  // Adicionar comando inicial
  addCommandLine('inicio');
  
  // Mostrar instruções iniciais
  await showInitialInstructions();
  
  // Mostrar apenas informações básicas
  //await showBasicInfo();
  
  // Mostrar prompt
  await showPrompt();
  
  // Esconder o overlay de ajuda após 8 segundos, mas apenas na primeira vez
  
};

// Remove os eventos ao desmontar o componente
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('resize', checkIfMobile);
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
  <div class="crt-monitor">
    <div class="crt-frame">
      <div class="crt-screen">
        <div class="terminal-layout">
          <!-- Coluna esquerda - histórico de comandos -->
          <div id="command-history-column" class="command-history">
            <div class="history-header">
              <h3>Histórico de Comandos</h3>
              <div class="header-buttons">
                <button @click="toggleSpeedMenu" class="speed-button" title="Ajustar velocidade">
                  <span v-if="state.currentSpeed === 'normal'">⏱️</span>
                  <span v-else-if="state.currentSpeed === 'fast'">⚡</span>
                  <span v-else>🚀</span>
                </button>
                <button @click="clearCommandHistory" class="clear-button" title="Limpar histórico">🗑️</button>
                <button id="help-button" @click="toggleHelp" class="help-button">?</button>
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
                    <button @click="processCommand('tutorial'); toggleHelp();" class="run-button" title="Executar comando">▶️</button>
                    <div class="command-description">
                      <strong>tutorial</strong> - Mostra a tela de ajuda/instruções iniciais
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
                    <button @click="processCommand('about'); toggleHelp();" class="run-button" title="Executar comando">▶️</button>
                    <div class="command-description">
                      <strong>about</strong> - Exibe informações pessoais
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
            <div id="command-prompt" class="history-input" 
                 :class="{ 'disabled': state.isTyping, 'input-active': isInputActive }" 
                 @click="focusMobileInput">
              <div class="prompt-line">
                <span class="prompt">user@retro-terminal:~$</span>
                <span class="input-text">{{ displayInputText }}</span>
                <span class="cursor" :class="{ 'blink': !state.isTyping }"></span>
              </div>
              
              <!-- Campo de entrada para dispositivos móveis - sem v-model ou :value -->
              <input 
                v-if="isMobile" 
                ref="mobileInputRef"
                type="text" 
                class="mobile-input"
                @input="syncMobileInput"
                @keydown.enter="handleMobileSubmit"
                @blur="handleInputBlur"
                :disabled="state.isTyping || !state.promptVisible"
                :placeholder="state.isTyping ? 'Aguarde...' : 'Digite um comando...'"
                autocomplete="off"
                autocorrect="off"
                autocapitalize="off"
                spellcheck="false"
              />
            </div>
          </div>
          
          <!-- Coluna direita - saída dos comandos -->
          <div id="output-panel" class="output-panel">
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
          
          <!-- Scanlines e efeitos CRT -->
          <div class="crt-scanline"></div>
          <div class="crt-glow"></div>
        </div>
        
        <!-- Overlay inicial de ajuda simplificado - Movido para fora das colunas de terminais -->
        <div v-if="state.initialOverlayVisible" class="initial-help-overlay">
          <div class="overlay-content">
            <div class="help-message">
              <div class="help-tutorial-header">
                <h2>BEM-VINDO!</h2>
                <button @click="hideInitialOverlay" class="close-button">×</button>
              </div>
              
              <p>Este terminal permite explorar o currículo de Sávio Godinho de forma interativa.</p>
              
              <div class="instruction-item mobile-tip">
                <strong>📱 DICA PARA CELULAR:</strong>
                <p>Em dispositivos móveis, é mais fácil usar o botão <span class="help-icon">?</span> para acessar os comandos do que digitar!</p>
                <p>Toque nos botões dos comandos (▶️) para executá-los diretamente.</p>
              </div>
              
              <div class="instructions">
                <div class="instruction-item">
                  <strong>📝 COMO USAR:</strong>
                  <p>• Digite comandos na parte inferior esquerda e pressione ENTER</p>
                  <p>• Use as setas ↑↓ para navegar no histórico de comandos</p>
                </div>
                
                <div class="instruction-item">
                  <strong>🧭 LAYOUT:</strong>
                  <p>• ESQUERDA: Histórico de comandos e entrada de texto</p>
                  <p>• DIREITA: Saída dos comandos (resultados)</p>
                </div>
                
                <div class="instruction-item">
                  <strong>🛠️ COMANDOS ÚTEIS:</strong>
                  <p>• <code>help</code> - Lista todos os comandos disponíveis</p>
                  <p>• <code>pdf</code> - Baixa o currículo em PDF</p>
                  <p>• <code>curriculum</code> - Exibe o currículo completo</p>
                  <p>• <code>contact</code> - Mostra informações de contato</p>
                </div>
                
                <div class="instruction-item">
                  <strong>🎛️ BOTÕES:</strong>
                  <p>• <span class="help-icon">?</span> - Mostra a lista de comandos disponíveis</p>
                  <p>• <span class="speed-icon">⏱️</span> - Ajusta velocidade de digitação</p>
                  <p>• <span class="clear-icon">🗑️</span> - Limpa o histórico de comandos</p>
                </div>
              </div>
              
              <p class="continue-note">Para continuar, clique no X...</p>
            </div>
          </div>
        </div>
      </div>
      <div class="crt-reflection"></div>
    </div>
    
    <!-- Botão flutuante para dispositivos móveis que mostra o teclado -->
    <button 
      v-if="isMobile && state.promptVisible && !state.isTyping" 
      @click="focusMobileInput" 
      class="mobile-keyboard-toggle"
      :class="{ 'active': isInputActive }"
      title="Abrir teclado para digitar comandos"
    >
      ⌨️ Digitar Comando
    </button>
  </div>
</template>

<style scoped>
/* Estilos CRT Monitor */
.crt-monitor {
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  background-color: #2a2a2a;
  border-radius: 15px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.8) inset, 0 10px 30px rgba(0, 0, 0, 0.5);
}

.crt-frame {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  background-color: #111;
  overflow: hidden;
  position: relative;
  box-shadow: 0 0 0 8px #333, 0 0 0 12px #1a1a1a;
}

.crt-screen {
  width: 100%;
  height: 100%;
  position: relative;
  background-color: #000;
  overflow: hidden;
  border-radius: 5px;
  animation: flicker 0.15s infinite alternate;
}

@keyframes flicker {
  0% {
    opacity: 0.98;
  }
  100% {
    opacity: 1.0;
  }
}

.crt-scanline {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0) 50%,
    rgba(0, 0, 0, 0.2) 50%
  );
  background-size: 100% 4px;
  pointer-events: none;
  z-index: 15;
  opacity: 0.7; /* Reduzir opacidade das scanlines para melhorar legibilidade */
}

.crt-glow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  box-shadow: 0 0 20px rgba(255, 200, 0, 0.15) inset;
  border-radius: 5px;
  pointer-events: none;
  z-index: 16;
  mix-blend-mode: screen;
}

.crt-reflection {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.12) 0%,
    rgba(255, 255, 255, 0) 40%
  );
  pointer-events: none;
  z-index: 20;
  border-radius: 5px;
}

.terminal-layout {
  display: flex;
  width: 100%;
  height: 100%;
  gap: 10px;
  padding: 10px;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  filter: sepia(10%) hue-rotate(15deg) saturate(130%) brightness(110%);
}

/* Ajuste para efeito de monitor CRT antigo */
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
      rgba(255, 200, 0, 0.05) 0%,
      rgba(0, 0, 0, 0) 70%
    );
  box-shadow: 0 0 30px rgba(255, 200, 0, 0.15) inset;
  border-radius: 5px;
}

/* Alterar as cores para tom âmbar/amarelo CRT antigo, com mais saturação */
.command-history, .output-panel {
  border-color: #ff9900;
}

.cmd-text {
  color: #ffdd00;
  text-shadow: 0 0 5px rgba(255, 221, 0, 0.5); /* Adicionar glow no texto */
}

.prompt {
  color: #ffdd00;
  text-shadow: 0 0 5px rgba(255, 221, 0, 0.5);
}

.input-text {
  color: #ffdd00;
  text-shadow: 0 0 5px rgba(255, 221, 0, 0.5);
}

.cursor {
  background-color: #ffdd00;
  box-shadow: 0 0 5px #ffdd00;
}

.help-button {
  color: #ffdd00;
  border-color: #ffdd00;
  text-shadow: 0 0 5px rgba(255, 221, 0, 0.5);
}

.help-button:hover {
  background-color: #ffdd00;
  color: #000;
}

::-webkit-scrollbar-thumb {
  background: #ffcc00;
}

/* Estilizar scrollbars */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #000;
}

/* Ajustes responsivos */
@media (max-width: 768px) {
  .terminal-layout {
    flex-direction: column;
    height: auto;
    gap: 20px; /* Aumentar o espaço entre os terminais */
  }
  
  .command-history, .output-panel {
    flex: none;
    height: 45vh; /* Reduzir ligeiramente para mostrar a separação */
    border: 2px solid #ffaa00 !important; /* Bordas mais evidentes */
    box-shadow: 0 0 15px rgba(255, 170, 0, 0.4) !important; /* Sombra para destacar */
    border-radius: 8px;
  }
  
  /* Adicionar indicadores de painel */
  .history-header::before, 
  .output-header::before {
    content: "";
    display: block;
    width: 100%;
    height: 4px;
    background: linear-gradient(to right, #ffaa00, transparent);
    margin-bottom: 5px;
  }
  
  /* Melhorar visibilidade dos cabeçalhos */
  .history-header h3, 
  .output-header h3 {
    font-size: 18px !important;
    text-shadow: 0 0 8px rgba(255, 221, 0, 0.8) !important;
    padding: 8px 0 !important;
    text-align: center !important;
    border-bottom: 1px dashed #ffaa00;
  }
  
  /* Adicionar indicador entre os terminais */
  .command-history::after {
    display: block;
    position: absolute;
    bottom: -25px;
    left: 0;
    right: 0;
    text-align: center;
    color: #ffff00;
    font-weight: bold;
    text-shadow: 0 0 8px rgba(255, 255, 0, 0.7);
    z-index: 100;
    pointer-events: none;
  }
  
  /* Adicionar botão fixo de ajuda para celular */
  .command-history::before {
    display: block;
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: rgba(0, 255, 0, 0.2);
    color: #00ff00;
    padding: 5px 10px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 100;
    pointer-events: none;
    animation: pulse 2s infinite;
  }
  
  /* Corrigir problema de rolagem na saída do terminal em celulares */
  .output-content {
    font-size: 13px !important;
    overflow-y: auto !important;
    -webkit-overflow-scrolling: touch !important; /* Melhorar rolagem no iOS */
    max-height: calc(45vh - 40px) !important; /* Altura máxima considerando o cabeçalho */
    height: 100% !important;
    padding-bottom: 20px !important;
  }
  
  .output-panel {
    display: flex !important;
    flex-direction: column !important;
    overflow: hidden !important;
  }
  
  .ascii-art {
    font-size: 4px;
    transform: scale(0.7);
    transform-origin: left top;
  }
  
  /* Ajustes no modal de tutorial para celular */
  .initial-help-overlay {
    position: fixed !important;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2000 !important;
    background-color: rgba(0, 0, 0, 0.9) !important;
  }
  
  .initial-help-overlay .help-message {
    width: 90% !important;
    max-width: none !important;
    max-height: 85vh !important;
    overflow-y: auto !important;
    padding: 15px !important;
    margin: 20px auto !important;
  }
  
  /* Destacar a dica para celular */
  .mobile-tip {
    background-color: rgba(255, 255, 0, 0.15) !important;
    border: 2px solid #ffee00 !important;
    color: #ffee00 !important;
    padding: 15px 10px !important;
    margin: 10px 0 20px 0 !important;
    text-align: center !important;
    border-radius: 8px !important;
    box-shadow: 0 0 15px rgba(255, 255, 0, 0.2) !important;
  }
  
  .mobile-tip strong {
    color: #ffee00 !important;
    font-size: 16px !important;
    margin-bottom: 8px !important;
  }
  
  .mobile-tip p {
    font-size: 14px !important;
    margin: 8px 0 !important;
  }
  
  .mobile-tip .help-icon {
    color: #ffee00 !important;
    border-color: #ffee00 !important;
    padding: 2px 6px !important;
    font-weight: bold !important;
    font-size: 16px !important;
  }
  
  .help-tutorial-header h2 {
    font-size: 20px !important;
  }
  
  .help-tutorial-header .close-button {
    position: absolute;
    top: 5px;
    right: 5px;
    width: 34px !important;
    height: 34px !important;
    font-size: 22px !important;
  }
  
  .instruction-item {
    padding: 10px !important;
    margin-bottom: 10px !important;
  }
  
  .instruction-item strong {
    font-size: 15px !important;
  }
  
  .instruction-item p {
    font-size: 13px !important;
    margin: 4px 0 !important;
  }
  
  .instructions {
    grid-template-columns: 1fr; /* Uma coluna em telas pequenas */
    gap: 15px;
  }
  
  /* Indicadores no modal de ajuda para mobile */
  .help-message::after {
    content: "👆 Deslize para cima e para baixo para ver todas as dicas 👇";
    display: block;
    margin-top: 15px;
    color: #ffff00;
    font-style: italic;
  }
  
  /* Tornar modais responsivos */
  .speed-dropdown {
    position: fixed !important;
    top: 50% !important;
    left: 50% !important;
    transform: translate(-50%, -50%) !important;
    width: 90% !important;
    max-width: 320px !important;
    z-index: 1100 !important;
  }
  
  .speed-dropdown::before {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: -1;
  }
  
  .speed-dropdown .speed-header {
    padding: 10px !important;
  }
  
  .speed-dropdown h4 {
    font-size: 18px !important;
  }
  
  .speed-dropdown li {
    padding: 12px !important;
    font-size: 16px !important;
  }
  
  .speed-icon {
    font-size: 20px !important;
  }
  
  /* Ajustar modal de ajuda para telas menores em celulares - aparecer do topo */
  .help-dropdown {
    position: fixed !important;
    top: 0 !important; /* Começa do topo */
    left: 0 !important; 
    right: 0 !important;
    transform: none !important; /* Remove a transformação de centralização */
    width: 100% !important; /* Ocupa toda a largura */
    max-width: 100% !important;
    height: 100vh !important; /* Altura máxima da viewport */
    max-height: 100vh !important;
    overflow-y: auto !important;
    padding: 15px !important;
    border-radius: 0 !important; /* Remove bordas arredondadas */
    z-index: 2500 !important; /* Garante que fique acima de tudo */
    display: flex !important;
    flex-direction: column !important;
    background-color: rgba(0, 0, 0, 0.95) !important; /* Fundo mais escuro para melhor contraste */
  }
  
  .help-dropdown::before {
    content: "";
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: -1;
  }
  
  /* Ajustar o cabeçalho do modal para ficar fixo no topo */
  .help-dropdown .help-header {
    position: sticky !important;
    top: 0 !important;
    background-color: rgba(0, 0, 0, 0.95) !important;
    padding: 15px 0 !important;
    margin-bottom: 15px !important;
    z-index: 10 !important;
    border-bottom: 2px solid #ffaa00 !important;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
  }
  
  .help-dropdown h4 {
    font-size: 18px !important;
    margin: 0 !important;
  }
  
  /* Ajustar a lista de comandos para tela cheia */
  .help-dropdown ul {
    padding: 10px !important;
    margin-bottom: 20px !important;
    flex: 1 !important;
  }
  
  /* Melhorar visibilidade dos itens de comando */
  .help-dropdown li {
    margin-bottom: 15px !important;
    padding: 10px !important;
    border-bottom: 1px dashed rgba(255, 255, 0, 0.3) !important;
  }
  
  .command-description {
    font-size: 14px !important;
  }
  
  .command-description strong {
    display: block !important;
    margin-bottom: 3px !important;
  }
  
  .run-button {
    width: 32px !important;
    height: 32px !important;
    min-width: 32px !important;
    font-size: 18px !important;
  }
  
  .help-dropdown .command-item {
    padding: 5px 0 !important;
  }
  
  /* Remover a indicação de scroll */
  .help-dropdown::after {
    content: none !important;
  }
  
  /* Aumentar o botão de fechar no modal de comandos */
  .help-dropdown .close-button {
    width: 40px !important;
    height: 40px !important;
    font-size: 24px !important;
    background-color: rgba(255, 170, 0, 0.2) !important;
    border: 2px solid #ffaa00 !important;
  }
  
  /* Tornar a linha de prompt clicável em dispositivos móveis */
  #command-prompt {
    cursor: text;
    position: relative;
  }
  
  /* Mensagem de instrução para usuários móveis sobre digitação */
  #command-prompt::before {
    content: "Toque aqui para digitar um comando";
    position: absolute;
    top: -30px;
    left: 0;
    right: 0;
    text-align: center;
    color: #ffcc00;
    font-size: 12px;
    padding: 5px;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 4px;
    animation: pulse 2s infinite;
    pointer-events: none;
  }
  
  /* Estilo especial quando o campo de entrada está ativo */
  #command-prompt.input-active {
    border: 2px solid #00ff00;
    background-color: rgba(0, 255, 0, 0.1);
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

/* Simulação de tela curvada - reduzida para melhorar legibilidade nas bordas */
.crt-screen::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(
      ellipse at center, 
      transparent 0%, 
      rgba(0, 0, 0, 0.1) 90%, 
      rgba(0, 0, 0, 0.2) 100%
    );
  z-index: 11;
  pointer-events: none;
  border-radius: 5px;
}

/* Melhorar a visibilidade do texto em todos os componentes */
.history-header h3 {
  color: #ffdd00;
  text-shadow: 0 0 5px rgba(255, 221, 0, 0.5);
}

.output-header h3 {
  color: #ffdd00;
  text-shadow: 0 0 5px rgba(255, 221, 0, 0.5);
}

.terminal-line {
  text-shadow: 0 0 3px rgba(255, 221, 0, 0.3);
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

/* Estilos para o overlay inicial de ajuda */
.initial-help-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7); /* Ajusto a opacidade para melhor legibilidade */
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: all;
}

.overlay-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.close-overlay-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(80, 80, 0, 0.5);
  color: #ffff00;
  border: 2px solid #ffaa00;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1001;
  box-shadow: 0 0 12px rgba(255, 255, 0, 0.6), inset 0 0 8px rgba(255, 255, 0, 0.3);
  transition: all 0.2s ease;
}

.close-overlay-button:hover {
  background-color: #ffff00;
  color: #000;
  transform: rotate(90deg);
  box-shadow: 0 0 20px rgba(255, 255, 0, 0.9);
}

/* Novos estilos para a mensagem central */
.help-message {
  background-color: rgba(0, 0, 0, 0.85);
  border: 2px solid #00ff00;
  border-radius: 10px;
  padding: 30px;
  max-width: 800px;
  color: #00ff00;
  text-align: center;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
  animation: glow 2s infinite alternate;
  position: relative; /* Adicionado para posicionamento do botão */
}

@keyframes glow {
  from { box-shadow: 0 0 10px rgba(0, 255, 0, 0.3); }
  to { box-shadow: 0 0 20px rgba(0, 255, 0, 0.7); }
}

.help-tutorial-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #00ff00;
  padding-bottom: 10px;
}

.help-tutorial-header h2 {
  margin: 0;
  font-size: 24px;
  color: #00ff00;
}

.help-tutorial-header .close-button {
  background-color: rgba(80, 80, 0, 0.5);
  color: #ffff00;
  border: 2px solid #ffaa00;
  position: relative;
  top: 0;
  right: 0;
}

.instructions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin: 25px 0;
  text-align: left;
}

.instruction-item {
  border: 1px dotted #00aa00;
  border-radius: 5px;
  padding: 15px;
  background-color: rgba(0, 50, 0, 0.3);
}

.instruction-item strong {
  display: block;
  margin-bottom: 10px;
  font-size: 16px;
  color: #00ffaa;
}

.instruction-item p {
  margin: 5px 0;
  font-size: 14px;
}

.instruction-item code {
  background-color: rgba(0, 50, 0, 0.5);
  padding: 2px 6px;
  border-radius: 3px;
  font-family: monospace;
  font-weight: bold;
}

.help-icon, .speed-icon, .clear-icon {
  display: inline-block;
  padding: 2px 5px;
  border: 1px solid;
  border-radius: 4px;
  margin-right: 5px;
}

.help-icon {
  color: #00ff00;
  border-color: #00ff00;
}

.speed-icon {
  color: #33ccff;
  border-color: #33ccff;
}

.clear-icon {
  color: #ff6b6b;
  border-color: #ff6b6b;
}

.continue-note {
  margin-top: 20px;
  font-style: italic;
  color: #aaffaa;
  font-size: 14px;
}

/* Estilo para campo de entrada em dispositivos móveis */
.mobile-input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  z-index: -10;
}

/* Botão flutuante para abrir teclado em dispositivos móveis */
.mobile-keyboard-toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: rgba(0, 255, 0, 0.2);
  color: #00ff00;
  border: 2px solid #00ff00;
  border-radius: 30px;
  padding: 12px 20px;
  font-size: 16px;
  z-index: 1000;
  box-shadow: 0 0 15px rgba(0, 255, 0, 0.3);
  cursor: pointer;
  transition: all 0.3s;
  animation: pulse 2s infinite;
}

.mobile-keyboard-toggle.active {
  background-color: rgba(0, 255, 0, 0.4);
  color: #000;
  border-color: #00ff00;
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.6);
  transform: scale(1.05);
}

.mobile-keyboard-toggle:hover, 
.mobile-keyboard-toggle:focus {
  background-color: rgba(0, 255, 0, 0.4);
  transform: scale(1.05);
}

/* Ajustes responsivos */
@media (max-width: 768px) {
  .terminal-layout {
    flex-direction: column;
    height: auto;
    gap: 20px; /* Aumentar o espaço entre os terminais */
  }
  
  /* ... existing mobile styles ... */
  
  /* Tornar a linha de prompt clicável em dispositivos móveis */
  #command-prompt {
    cursor: text;
    position: relative;
  }
  
  /* Mensagem de instrução para usuários móveis sobre digitação */
  #command-prompt::before {
    content: "Toque aqui para digitar um comando";
    position: absolute;
    top: -30px;
    left: 0;
    right: 0;
    text-align: center;
    color: #ffcc00;
    font-size: 12px;
    padding: 5px;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 4px;
    animation: pulse 2s infinite;
    pointer-events: none;
  }
  
  /* Estilo especial quando o campo de entrada está ativo */
  #command-prompt.input-active {
    border: 2px solid #00ff00;
    background-color: rgba(0, 255, 0, 0.1);
  }
  
  /* Ocultar a mensagem de instrução quando o campo está ativo */
  #command-prompt.input-active::before {
    display: none;
  }
}
</style>