<script setup>
// Resultados em blocos número + rótulo. Quando a janela abre, o número "conta" do zero
// até o valor (só com html.motion-ok). O HTML pré-renderizado já traz o valor final.
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useReveal } from '../../composables/useReveal'

const props = defineProps({ data: { type: Array, required: true } }) // [{ valor, rotulo }]

const root = ref(null)
const revealed = useReveal(root)
const shown = ref(props.data.map((s) => s.valor))
let raf

// "+36,7%" -> { pre: '+', num: 36.7, dec: 1, sep: ',', suf: '%' }; sem número, não anima
function parse(v) {
  const m = String(v).match(/^(\D*?)(\d+(?:[.,]\d+)?)(.*)$/)
  if (!m) return null
  const sep = m[2].includes(',') ? ',' : '.'
  const dec = m[2].split(/[.,]/)[1]?.length ?? 0
  return { pre: m[1], num: Number(m[2].replace(',', '.')), dec, sep, suf: m[3] }
}

const format = (p, n) => `${p.pre}${n.toFixed(p.dec).replace('.', p.sep)}${p.suf}`

function count() {
  const parts = props.data.map((s) => parse(s.valor))
  const start = performance.now()
  const dur = 900
  const tick = (now) => {
    const k = Math.min(1, (now - start) / dur)
    const ease = 1 - (1 - k) ** 3
    shown.value = props.data.map((s, i) => (parts[i] ? format(parts[i], parts[i].num * ease) : s.valor))
    if (k < 1) raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
}

onMounted(() => {
  if (!document.documentElement.classList.contains('motion-ok') || revealed.value) return
  // janela ainda fechada: zera e conta quando ela abrir
  shown.value = props.data.map((s) => {
    const p = parse(s.valor)
    return p ? format(p, 0) : s.valor
  })
  const stop = watch(revealed, (v) => {
    if (!v) return
    stop()
    setTimeout(count, 250)
  })
})

onUnmounted(() => cancelAnimationFrame(raf))
</script>

<template>
  <dl ref="root" class="stats">
    <div v-for="(s, i) in data" :key="s.rotulo" class="stat reveal-item" :style="{ '--i': i + 1 }">
      <dt class="stat__label muted">{{ s.rotulo }}</dt>
      <dd class="stat__value">{{ shown[i] }}</dd>
    </div>
  </dl>
</template>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
  gap: var(--space-3);
  margin: 0;
}

.stat {
  display: flex;
  flex-direction: column-reverse; /* número em cima, rótulo embaixo (dt continua antes no HTML) */
  gap: var(--space-1);
  padding: var(--space-3);
  border: 1px dashed var(--border);
  background: var(--bg);
}

.stat__value {
  margin: 0;
  color: var(--accent);
  font-family: var(--font-display);
  font-size: clamp(2.2rem, 5vw, 3rem);
  line-height: 1;
  text-shadow: var(--glow-accent);
  font-variant-numeric: tabular-nums;
}

.stat__label {
  font-size: 0.9rem;
}
</style>
