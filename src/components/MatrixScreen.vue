<script setup>
import { ref, onMounted, reactive, onUnmounted, watch } from 'vue';
import typeSound from './TypeSound';
import '../assets/crt.css';

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
    for(let i = 0; i < projectiles.length; i++){
        if(checkCollisionWithEnemy(projectiles[i], enemy)){
            return true;
        }
    }
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

function render() {
    let screenTemp = screen.value.map(row => row.slice());

    screenTemp = renderPlayer(screenTemp);
    screenTemp = renderProjectiles(screenTemp);
    for(let i = 0; i < enemies.length; i++){
        screenTemp = renderEnemy(screenTemp, enemies[i]);
    }
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
          <div class="matrix-header">
            <div class="header-left">
              <button @click="() => window.location.href = '/'" class="back-button" title="Voltar ao terminal">
                ⬅️ Terminal
              </button>
              <h3>Visualização da Matriz</h3>
            </div>
            <div class="header-controls">
              <div class="controls-info">
                <span class="control-key">←</span> Mover Esquerda
                <span class="control-key">→</span> Mover Direita
                <span class="control-key">Espaço</span> {{ state.isPaused ? 'Continuar' : 'Pausar' }}
              </div>
              <div class="header-buttons">
                <button @click="toggleSpeedMenu" class="speed-button" title="Ajustar velocidade">
                  <span v-if="state.currentSpeed === 'normal'">⏱️</span>
                  <span v-else-if="state.currentSpeed === 'fast'">⚡</span>
                  <span v-else>🚀</span>
                </button>
                <button @click="state.isSoundEnabled = !state.isSoundEnabled" class="sound-button">
                  {{ state.isSoundEnabled ? '🔊' : '🔇' }}
                </button>
              </div>
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
.matrix-layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  filter: sepia(10%) hue-rotate(15deg) saturate(130%) brightness(110%);
}

.matrix-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #ffaa00;
}

.matrix-header h3 {
  color: #ffdd00;
  text-shadow: 0 0 5px rgba(255, 221, 0, 0.5);
  margin: 0;
}

.matrix-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 2px solid #ffaa00;
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
  background-color: rgba(0, 0, 0, 0.8);
  color: #ffee00;
  border: 1px solid #ffee00;
  padding: 8px 15px;
  border-radius: 4px;
  z-index: 100;
  box-shadow: 0 0 10px rgba(255, 238, 0, 0.3);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

/* Estilos para os botões de controle */
.header-buttons {
  display: flex;
  gap: 10px;
}

.speed-button, .sound-button {
  background-color: transparent;
  border: 2px solid #ffaa00;
  color: #ffee00;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.3s ease;
}

.speed-button:hover, .sound-button:hover {
  background-color: rgba(255, 170, 0, 0.2);
  transform: scale(1.1);
}

/* Estilos para o menu de velocidade */
.speed-dropdown {
  position: absolute;
  top: 60px;
  right: 20px;
  background-color: rgba(0, 0, 0, 0.9);
  border: 2px solid #ffaa00;
  border-radius: 8px;
  padding: 15px;
  z-index: 1000;
  min-width: 200px;
}

.speed-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ffaa00;
}

.speed-header h4 {
  margin: 0;
  color: #ffee00;
}

.close-button {
  background-color: transparent;
  border: none;
  color: #ffee00;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.speed-dropdown ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.speed-dropdown li {
  padding: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  color: #ffee00;
  transition: background-color 0.2s;
}

.speed-dropdown li:hover {
  background-color: rgba(255, 170, 0, 0.2);
}

.speed-dropdown li.active {
  background-color: rgba(255, 170, 0, 0.3);
  border-left: 3px solid #ffaa00;
}

.speed-icon {
  margin-right: 10px;
}

/* Responsividade */
@media (max-width: 768px) {
  .matrix-line {
    font-size: 14px;
  }
  
  .matrix-content {
    padding: 10px;
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.back-button {
  background-color: transparent;
  border: 2px solid #ffaa00;
  color: #ffee00;
  padding: 5px 15px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.3s ease;
}

.back-button:hover {
  background-color: rgba(255, 170, 0, 0.2);
  transform: scale(1.05);
}

.header-controls {
  display: flex;
  align-items: center;
  gap: 20px;
}

.controls-info {
  display: flex;
  align-items: center;
  gap: 15px;
  color: #ffee00;
  font-size: 14px;
}

.control-key {
  background-color: rgba(255, 170, 0, 0.2);
  border: 1px solid #ffaa00;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-weight: bold;
}

/* Responsividade para os controles */
@media (max-width: 768px) {
  .header-controls {
    flex-direction: column;
    gap: 10px;
  }
  
  .controls-info {
    font-size: 12px;
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style> 