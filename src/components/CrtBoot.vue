<script setup>
// "Liga o monitor": ponto -> linha -> tela cheia -> conteúdo. Roda a cada carregamento.
// Só existe quando html.motion-ok está presente (há JS e o visitante não pediu menos movimento).
import { onMounted, onUnmounted, ref } from 'vue'

const show = ref(document.documentElement.classList.contains('motion-ok'))
let timer

function done() {
  show.value = false
  clearTimeout(timer)
}

onMounted(() => {
  // rede de segurança: se o animationend não disparar, some mesmo assim
  if (show.value) timer = setTimeout(done, 1200)
})

onUnmounted(() => clearTimeout(timer))
</script>

<template>
  <div v-if="show" class="crt-boot" aria-hidden="true" @animationend.self="done">
    <div class="crt-boot__beam"></div>
  </div>
</template>
