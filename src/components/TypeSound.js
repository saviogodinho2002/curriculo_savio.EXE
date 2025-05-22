// Classe para gerenciar efeitos sonoros do terminal
class TypeSound {
  constructor() {
    this.audioContext = null;
    this.isEnabled = false;
    this.isMuted = false;
    this.volume = 0.15; // Volume baixo por padrão
  }

  // Inicializa o contexto de áudio (precisa ser chamado após interação do usuário)
  init() {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.isEnabled = true;
      }
    } catch (error) {
      console.warn('Web Audio API não suportada:', error);
      this.isEnabled = false;
    }
  }

  // Cria um som de digitação
  typeKey() {
    if (!this.isEnabled || this.isMuted || !this.audioContext) return;
    
    // Criar oscilador
    const osc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    // Configurar oscilador
    osc.type = 'square';
    osc.frequency.setValueAtTime(
      440 + Math.random() * 220, // Frequência aleatória para variar o som
      this.audioContext.currentTime
    );
    
    // Configurar gain (volume)
    gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01, // Quase zero
      this.audioContext.currentTime + 0.08 // Duração curta
    );
    
    // Conectar ao destino de saída
    osc.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Iniciar oscilador
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.08);
  }

  // Toca um som de "beep" de erro
  beep() {
    if (!this.isEnabled || this.isMuted || !this.audioContext) return;
    
    // Criar oscilador
    const osc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    // Configurar oscilador
    osc.type = 'square';
    osc.frequency.setValueAtTime(220, this.audioContext.currentTime);
    
    // Configurar gain (volume)
    gainNode.gain.setValueAtTime(this.volume * 1.5, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + 0.3
    );
    
    // Conectar ao destino de saída
    osc.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Iniciar oscilador
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.3);
  }

  // Toca um som de boot do sistema
  bootSound() {
    if (!this.isEnabled || this.isMuted || !this.audioContext) return;
    
    // Criar oscilador
    const osc = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    // Configurar oscilador
    osc.type = 'sine';
    
    // Criar sweep de frequência
    osc.frequency.setValueAtTime(150, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      1500,
      this.audioContext.currentTime + 0.5
    );
    
    // Configurar gain (volume)
    gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + 0.5
    );
    
    // Conectar ao destino de saída
    osc.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Iniciar oscilador
    osc.start();
    osc.stop(this.audioContext.currentTime + 0.5);
  }

  // Ativa/desativa som
  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }
}

// Exporta uma única instância para todo o aplicativo
export default new TypeSound(); 