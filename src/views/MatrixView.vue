<script setup>
// Wrapper do jogo /matrix: reproduz o container que antes vivia no App.vue,
// para o MatrixScreen renderizar exatamente como antes. O jogo não foi alterado.
// O jogo usa window/AudioContext já ao ser importado, então ele só carrega no
// navegador (ClientOnly + import assíncrono); a pré-renderização gera só a moldura.
// (<ClientOnly> é registrado globalmente pelo vite-ssg)
import { defineAsyncComponent } from 'vue'
import { useHead } from '@unhead/vue'
import '../assets/crt.css'
import '../assets/matrix-legacy.css'

// Ordem do CSS igual à de antes: crt.css (que o jogo importa) ANTES do matrix-legacy.css.
// Os dois definem @keyframes flicker e a scrollbar; o último a carregar vence.
// Como o jogo agora carrega assíncrono, o crt.css é puxado aqui primeiro.
const MatrixScreen = defineAsyncComponent(() => import('../components/MatrixScreen.vue'))

useHead({
  title: 'matrix',
  meta: [{ name: 'robots', content: 'noindex, follow' }],
})
</script>

<template>
  <div class="terminal-container">
    <div class="terminal-screen">
      <ClientOnly>
        <MatrixScreen />
      </ClientOnly>
    </div>
  </div>
</template>
