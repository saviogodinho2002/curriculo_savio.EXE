<script setup>
import { ref, onMounted, reactive, onUnmounted, watch } from 'vue';
import typeSound from './TypeSound';
import '../assets/crt.css';

// Layout: botão de voltar e rótulos dos controles (a lógica do jogo não muda).
// Volta para a versão do site de onde a pessoa veio (/en/ ou /).
const backHref = ref('/');
const SPEED_LABELS = { normal: 'normal', fast: 'rápida', instant: 'instantânea' };
onMounted(() => {
  try {
    const from = new URL(document.referrer);
    if (from.origin === location.origin && from.pathname.startsWith('/en')) backHref.value = '/en/';
  } catch {
    // sem referrer: volta para o português
  }
});

// Estado da matriz
const state = reactive({
  matrix: [], // Matriz atual
  isSoundEnabled: false,
  currentSpeed: 'instant',
  lines: [], // Linhas para exibição
  speedMenuVisible: false,
  isPaused: false, // Novo estado para controlar pausa
  direction: 1, // 1 para direita, -1 para esquerda
  // Controles de teclas
  isLeftPressed: false,
  isRightPressed: false,
  isSpacePressed: false
});

// Função para adicionar uma linha da matriz
const typeMatrixLine = (line) => {
  const newLine = { text: line.join(''), finished: true };
  state.lines.push(newLine);
};

// Função para exibir a matriz completa
const typeMatrix = (matrix) => {
  state.lines = [];
  state.matrix = matrix;
  
  // Adicionar cada linha da matriz
  for (let i = 0; i < matrix.length; i++) {
    typeMatrixLine(matrix[i]);
  }
};

// Função para destacar um elemento específico da matriz
const highlightCell = async (row, col) => {
  if (row >= 0 && row < state.lines.length && col >= 0 && col < state.lines[row].cells.length) {
    state.lines[row].cells[col].highlighted = true;
    resolve()
    state.lines[row].cells[col].highlighted = false;
  }
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
  cellDelay.value = speedSettings[speed].cellDelay;
  
  state.speedMenuVisible = false;
};

// Exemplo de uso
const exampleMatrix = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
  [13, 14, 15, 16]
];

const screen = ref([

]);
const height = 19;      
const width = 100;
for (let i = 0; i < height; i++) {
    if(i == 0){
        screen.value.push(new Array(width).fill('-'));
    }
    else if(i == height-1){
        screen.value.push(new Array(width).fill('-'));
    }
    else{
        screen.value.push(new Array(width).fill(' '));
    }
}
for (let i = 0; i < height; i++) {
    screen.value[i][0] = '|';
    screen.value[i][width-1] = '|';
}

// Função para lidar com o pressionar das teclas
const handleKeyDown = (e) => {
  switch(e.key) {
    case 'ArrowLeft':
      state.isLeftPressed = true;
      break;
    case 'ArrowRight':
      state.isRightPressed = true;
      break;
    case ' ': // Tecla de espaço
      e.preventDefault(); // Prevenir scroll da página
      state.isSpacePressed = true;
      break;
  }
};

// Função para lidar com a soltura das teclas
const handleKeyUp = (e) => {
  switch(e.key) {
    case 'ArrowLeft':
      state.isLeftPressed = false;
      break;
    case 'ArrowRight':
      state.isRightPressed = false;
      break;
    case ' ': // Tecla de espaço
      state.isSpacePressed = false;
      break;
  }
};
const player = {
  x: width/2,
  y: height-2,
  direction: 1,
  speed: 1
}
/* 

        #
       ###
       # #

*/
const projectile = {
    x: 0,
    y: 0,
    direction: 1,
    speed: 1,
    symbol: '^'
}
let projectiles = [];
const delayBetweenProjectiles = 1000;
let lastProjectileTime = 0;

function newProjectile(speed, symbol){//negativo vai para baixo, positivo vai para cima
    projectiles.push({
        x: player.x+1,
        y: player.y-1,
        direction: 1,
        speed: speed,
        symbol: symbol
    });
}

let enemies = [];

function newEnemy(y){
    return {
        x: 0,
        y: y,
        direction: 1,
        speed: 1
    };
}
/* 

        _
       < >
        ^

*/
function newExplosion(x, y){
    return {
        x: x,
        y: y,
        symbol: '*',
        state: 0
    }
}
let explosions = [];
let lastExplosionTime = 0;
const delayBetweenExplosions = 1000;


function calcWaveMovement(x) {
  const yBase = 5       ; // valor central da onda
  const amplitude = 1; // variação máxima
  const comprimentoDeOnda = 48; // frequência da onda

  const y = Math.round(yBase + amplitude * Math.sin((2 * Math.PI * x) / comprimentoDeOnda));
  return y;
}

function tick() {
  if (state.isPaused) return; // Não atualizar se estiver pausado
  
  // Aqui você pode usar as variáveis de controle para determinar o comportamento
  if (state.isLeftPressed) {
    if(player.x-1 != 0){
        player.x -= player.speed;
    }
    
    // Mover para esquerda
  }
  if (state.isRightPressed) {
    if(player.x+1 != width-4){
        player.x += player.speed;
    }
    // Mover para direita
  }
  if (state.isSpacePressed) {
    if(lastProjectileTime == 0){
        projectiles.push({
        x: player.x+4,
        y: player.y,
        direction: 1,
        speed: 1,
        symbol: '^',
        
    });
    projectiles.push({
        x: player.x+1,
        y: player.y,
        direction: 1,
        speed: 1,
        symbol: '^',
        
    });
    lastProjectileTime = delayBetweenProjectiles;
    }
    
  }
  enemies = enemies.filter(enemy => enemy.x != width-7 && !enemeyCollosionWithAnyProjectile(enemy));
  for(let i = 0; i < enemies.length; i++){
        enemies[i].x += enemies[i].speed;
        enemies[i].y = calcWaveMovement(enemies[i].x);
  }

  const sortSpawnEnemy = Math.random() < 0.01;
  if(sortSpawnEnemy){
    enemies.push(newEnemy(1+ Math.floor(Math.random() * height/2)));
  }


  if(lastProjectileTime > 0){
    lastProjectileTime -= 100;

  }
  projectiles = projectiles.filter(projectile => projectile.y != 1);
  for(let i = 0; i < projectiles.length; i++){
    projectiles[i].y -= projectiles[i].speed;
  }
  explosions = explosions.filter(explosion => explosion.state < 4);
  for(let i = 0; i < explosions.length; i++){
    explosions[i].state += 1;
  }
}
function renderPlayer(screenTemp){
    screenTemp[player.y][player.x] = '<';
    screenTemp[player.y][player.x+1] = 'w';
    screenTemp[player.y][player.x+2] = '|';
    screenTemp[player.y][player.x+3] = '|';
    screenTemp[player.y][player.x+4] = 'w';
    screenTemp[player.y][player.x+5] = '>';
    
   
    return screenTemp;
}
function enemeyCollosionWithAnyProjectile(enemy){
    let collision = false;
    let i;
    for(let i = 0; i < projectiles.length; i++){
        if(checkCollisionWithEnemy(projectiles[i], enemy)){
            collision = true;
             projectiles.splice(i, 1); // remove o projétil que colidiu
            explosions.push(newExplosion(enemy.x+2, enemy.y+1));
            break;
        }
    }
    
    return collision;
}
function checkCollisionWithEnemy(projectile, enemy) {
    if (projectile.y === enemy.y + 1) {
        if (projectile.x >= enemy.x && projectile.x <= enemy.x + 4) {
            return true;
        }
    }
    
    return false;
}

function renderEnemy(screenTemp, enemy){
    

    screenTemp[enemy.y+1][enemy.x] = '<';
    screenTemp[enemy.y+1][enemy.x+1] = '_';
    screenTemp[enemy.y+1][enemy.x+2] = '-';
    screenTemp[enemy.y+1][enemy.x+3] = '_';
    screenTemp[enemy.y+1][enemy.x+4] = '>';

    
    return screenTemp;
}

function renderProjectiles(screenTemp){
    for(let i = 0; i < projectiles.length; i++){
        screenTemp[projectiles[i].y][projectiles[i].x] = projectiles[i].symbol;
    }
    return screenTemp;
}
function renderExplosions(screenTemp){
    for(let i = 0; i < explosions.length; i++){
        const currentExplosion = explosions[i];
        for(let j = 0; j < currentExplosion.state; j++){
            screenTemp[currentExplosion.y+j][currentExplosion.x] = currentExplosion.symbol;
            screenTemp[currentExplosion.y-j][currentExplosion.x] = currentExplosion.symbol;
            screenTemp[currentExplosion.y][currentExplosion.x+j] = currentExplosion.symbol;
            screenTemp[currentExplosion.y][currentExplosion.x-j] = currentExplosion.symbol;
            screenTemp[currentExplosion.y+j][currentExplosion.x+j] = currentExplosion.symbol;
            screenTemp[currentExplosion.y-j][currentExplosion.x-j] = currentExplosion.symbol;
            screenTemp[currentExplosion.y+j][currentExplosion.x-j] = currentExplosion.symbol;
            screenTemp[currentExplosion.y-j][currentExplosion.x+j] = currentExplosion.symbol;
        }
       
        
    }
    return screenTemp;
}

function render() {
    let screenTemp = screen.value.map(row => row.slice());

    screenTemp = renderPlayer(screenTemp);
    screenTemp = renderProjectiles(screenTemp);
    for(let i = 0; i < enemies.length; i++){
        screenTemp = renderEnemy(screenTemp, enemies[i]);
    }
    screenTemp = renderExplosions(screenTemp);
  typeMatrix(screenTemp);
}
setInterval(()=>{
    tick();
    render();
  
}, 1000/30);

onMounted(() => {
  //typeMatrix(exampleMatrix);
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  window.removeEventListener('keyup', handleKeyUp);
});

</script>

<template>
  <div class="crt-monitor">
    <div class="crt-frame">
      <div class="crt-screen">
        <div class="matrix-layout">
          <!-- Cabeçalho com controles e instruções -->
          <header class="matrix-header">
            <div class="header-left">
              <a :href="backHref" class="back-button" title="Voltar ao portfólio">← portfólio</a>
              <h1 class="matrix-title">naves<span>.exe</span></h1>
              <span class="matrix-subtitle">batalha em ASCII</span>
            </div>
            <div class="header-controls">
              <div class="controls-info">
                <span><kbd class="control-key">←</kbd><kbd class="control-key">→</kbd> mover</span>
                <span><kbd class="control-key">espaço</kbd> {{ state.isPaused ? 'continuar' : 'pausar' }}</span>
              </div>
              <div class="header-buttons">
                <button @click="toggleSpeedMenu" class="speed-button" title="Ajustar velocidade">
                  vel: {{ SPEED_LABELS[state.currentSpeed] || state.currentSpeed }}
                </button>
                <button @click="state.isSoundEnabled = !state.isSoundEnabled" class="sound-button" title="Ligar/desligar som">
                  som: {{ state.isSoundEnabled ? 'on' : 'off' }}
                </button>
              </div>
            </div>
          </header>
          <p class="touch-hint">Este jogo precisa de teclado: ← → para mover e espaço para pausar.</p>
          
          <!-- Menu de velocidade -->
          <div v-if="state.speedMenuVisible" class="speed-dropdown">
            <div class="speed-header">
              <h4>velocidade</h4>
              <button @click="toggleSpeedMenu" class="close-button">×</button>
            </div>
            <ul>
              <li 
                @click="changeSpeed('normal')" 
                :class="{ 'active': state.currentSpeed === 'normal' }">
                <span class="speed-label">normal</span>
              </li>
              <li 
                @click="changeSpeed('fast')" 
                :class="{ 'active': state.currentSpeed === 'fast' }">
                <span class="speed-label">rápida</span>
              </li>
              <li 
                @click="changeSpeed('instant')" 
                :class="{ 'active': state.currentSpeed === 'instant' }">
                <span class="speed-label">instantânea</span>
              </li>
            </ul>
          </div>
          
          <!-- Área da matriz -->
          <div class="matrix-content">
            <div v-for="(line, lineIndex) in state.lines" 
                 :key="lineIndex" 
                 class="matrix-line">
              {{ line.text }}
            </div>
          </div>
          
          <!-- Indicador de digitação -->
          <div v-if="state.isTyping" class="typing-indicator">
            Processando matriz...
          </div>
          
          <!-- Efeitos CRT -->
          <div class="crt-scanline"></div>
          <div class="crt-glow"></div>
        </div>
      </div>
      <div class="crt-reflection"></div>
    </div>
  </div>
</template>

<style scoped>
/* Layout no estilo do portfólio: cantos retos, borda dupla, botões [ ], VT323 + IBM Plex Mono.
   As linhas do jogo (.matrix-line) mantêm fonte, cor e espaçamento originais. */
.matrix-layout {
  --amber: #ffb000;
  --amber-dim: #9a6a00;
  --yellow: #ffee00;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 16px 20px 20px;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  font-family: 'IBM Plex Mono', 'Courier New', monospace;
}

/* ---- cabeçalho (barra estilo tmux) ---- */
.matrix-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 10px 24px;
  margin-bottom: 14px;
  padding-bottom: 12px;
  border-bottom: 3px double var(--amber-dim);
}

.header-left {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 6px 16px;
}

.matrix-title {
  margin: 0;
  font: 400 2rem/1 'VT323', monospace;
  color: var(--yellow);
  text-shadow: 0 0 6px rgba(255, 221, 0, 0.5);
}

.matrix-title span {
  color: var(--amber);
}

.matrix-subtitle {
  color: var(--amber-dim);
  font-size: 0.85rem;
}

.header-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 20px;
}

.controls-info {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 16px;
  color: var(--yellow);
  font-size: 0.85rem;
}

.control-key {
  display: inline-block;
  margin-right: 4px;
  padding: 0 6px;
  border: 1px solid var(--amber-dim);
  color: var(--amber);
  font: 700 0.8rem/1.6 'IBM Plex Mono', monospace;
}

.header-buttons {
  display: flex;
  gap: 4px;
}

/* botões no formato [ texto ], como no portfólio */
.back-button,
.speed-button,
.sound-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5ch;
  padding: 4px 8px;
  border: 0;
  background: transparent;
  color: var(--yellow);
  font: 500 0.9rem/1.4 'IBM Plex Mono', monospace;
  text-decoration: none;
  text-shadow: 0 0 5px rgba(255, 238, 0, 0.35);
  white-space: nowrap;
  cursor: pointer;
}

.back-button {
  color: var(--amber);
}

.back-button::before,
.speed-button::before,
.sound-button::before {
  content: '[';
}

.back-button::after,
.speed-button::after,
.sound-button::after {
  content: ']';
}

.back-button:hover,
.speed-button:hover,
.sound-button:hover,
.back-button:focus-visible,
.speed-button:focus-visible,
.sound-button:focus-visible {
  background: var(--amber);
  color: #000;
  text-shadow: none;
  outline: none;
}

/* ---- área do jogo ---- */
.matrix-content {
  flex: 1;
  display: grid;
  justify-content: center;
  align-content: start;
  overflow: auto;
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.35);
  border: 3px double var(--amber-dim);
  font-family: 'Courier New', monospace;
  letter-spacing: 0;
}

.matrix-line {
  color: #ffee00;
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 10px;
  text-shadow: 0 0 5px rgba(255, 238, 0, 0.3);
  white-space: pre;
  font-family: 'Courier New', monospace;
  letter-spacing: 0;
}

.typing-indicator {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.85);
  color: var(--yellow);
  border: 1px solid var(--amber);
  padding: 6px 14px;
  z-index: 100;
  font-size: 0.85rem;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

/* aviso só em telas de toque (o jogo depende de teclado) */
.touch-hint {
  display: none;
  margin: 0 0 12px;
  padding: 6px 10px;
  border: 1px dashed var(--amber-dim);
  color: var(--amber);
  font-size: 0.8rem;
}

@media (hover: none) and (pointer: coarse) {
  .touch-hint {
    display: block;
  }
}

/* ---- menu de velocidade ---- */
.speed-dropdown {
  position: absolute;
  top: 64px;
  right: 20px;
  background-color: rgba(0, 0, 0, 0.95);
  border: 3px double var(--amber);
  padding: 12px 14px;
  z-index: 1000;
  min-width: 200px;
}

.speed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px dashed var(--amber-dim);
}

.speed-header h4 {
  margin: 0;
  color: var(--amber);
  font: 400 1.4rem/1 'VT323', monospace;
}

.close-button {
  background-color: transparent;
  border: none;
  color: var(--yellow);
  font-size: 22px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background: var(--amber);
  color: #000;
}

.speed-dropdown ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.speed-dropdown li {
  padding: 6px 10px;
  cursor: pointer;
  color: var(--yellow);
  font-size: 0.9rem;
}

.speed-dropdown li::before {
  content: '  ';
  white-space: pre;
  color: var(--amber);
}

.speed-dropdown li:hover {
  background-color: rgba(255, 176, 0, 0.15);
}

.speed-dropdown li.active::before {
  content: '> ';
}

.speed-dropdown li.active {
  color: var(--amber);
}

/* ---- responsivo ---- */
@media (max-width: 768px) {
  .matrix-layout {
    padding: 12px;
  }

  .matrix-line {
    font-size: 13px;
  }

  .matrix-content {
    padding: 10px;
  }

  .speed-dropdown {
    top: auto;
    bottom: 20px;
    right: 12px;
    left: 12px;
  }
}
</style> 