<script setup>
// Wrapper do jogo /matrix: reproduz o container que antes vivia no App.vue,
// para o MatrixScreen renderizar exatamente como antes. O jogo não foi alterado.
import MatrixScreen from '../components/MatrixScreen.vue'
import '../assets/matrix-legacy.css'
</script>

<template>
  <div class="terminal-container">
    <div class="terminal-screen">
      <MatrixScreen />
    </div>
  </div>
</template>
