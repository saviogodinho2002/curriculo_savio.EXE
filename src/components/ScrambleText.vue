<script setup>
// Texto que "decodifica": caracteres aleatórios que vão se fixando da esquerda para a direita.
// Acessível: leitores de tela leem só o texto real (sr-only); a animação é aria-hidden.
import { onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  text: { type: String, required: true },
  active: { type: Boolean, default: true },
  duration: { type: Number, default: 420 },
  delay: { type: Number, default: 150 },
})

// só ASCII: largura idêntica em qualquer fonte monoespaçada (o texto não "pula")
const GLYPHS = '#$%&*+<>/\\=_-01'
const motionOk = document.documentElement.classList.contains('motion-ok')

const display = ref(motionOk ? scrambled(props.text, 0) : props.text)
let raf = 0
let timer = 0

function scrambled(text, progress) {
  const fixed = Math.floor(text.length * progress)
  let out = ''
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    out += i < fixed || ch === ' ' ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0]
  }
  return out
}

function run() {
  const start = performance.now()
  let last = 0
  const tick = (now) => {
    const p = Math.min(1, (now - start) / props.duration)
    // troca os glifos a ~30fps: cara de terminal, não de vídeo
    if (now - last > 33 || p === 1) {
      display.value = p === 1 ? props.text : scrambled(props.text, p)
      last = now
    }
    if (p < 1) raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
}

watch(
  () => props.active,
  (on) => {
    if (!on) return
    if (!motionOk) {
      display.value = props.text
      return
    }
    timer = setTimeout(run, props.delay)
  },
  { immediate: true },
)

watch(
  () => props.text,
  (t) => {
    if (!raf || !motionOk) display.value = t
  },
)

onUnmounted(() => {
  cancelAnimationFrame(raf)
  clearTimeout(timer)
})
</script>

<template>
  <span class="sr-only">{{ text }}</span><span aria-hidden="true">{{ display }}</span>
</template>
