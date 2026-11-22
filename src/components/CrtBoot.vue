<script setup>
// "Liga o monitor": ponto -> linha -> tela cheia -> conteúdo. Roda a cada carregamento.
// Vai no HTML pré-renderizado e só aparece com html.motion-ok (posto pelo script inline
// do index.html), então a animação começa na primeira pintura, antes mesmo do JS.
// Depois que o Vue monta, o overlay sai do DOM ao terminar.
import { onMounted, onUnmounted, ref } from 'vue'

const show = ref(true)
let timer

function done() {
  show.value = false
  clearTimeout(timer)
}

onMounted(() => {
  if (!document.documentElement.classList.contains('motion-ok')) {
    done()
    return
  }
  // a animação pode já ter acabado antes da hidratação: rede de segurança
  timer = setTimeout(done, 1200)
})

onUnmounted(() => clearTimeout(timer))
</script>

<template>
  <div v-if="show" class="crt-boot" aria-hidden="true" @animationend.self="done">
    <div class="crt-boot__beam"></div>
  </div>
</template>
