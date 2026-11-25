<script>
// só no 1º carregamento: voltar de uma página de projeto para a home (navegação
// pelo router) não liga o monitor de novo. Fica no escopo do módulo, não do componente.
let played = false
</script>

<script setup>
// "Liga o monitor": ponto -> linha -> tela cheia -> conteúdo. Roda a cada carregamento.
// Vai no HTML pré-renderizado e só aparece com html.motion-ok (posto pelo script inline
// do index.html), então a animação começa na primeira pintura, antes mesmo do JS.
// Depois que o Vue monta, o overlay sai do DOM ao terminar.
import { onMounted, onUnmounted, ref } from 'vue'

const show = ref(!played)
let timer

function done() {
  played = true
  show.value = false
  clearTimeout(timer)
}

onMounted(() => {
  if (!show.value) return
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
