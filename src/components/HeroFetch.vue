<script setup>
// Hero no formato da saída do neofetch: arte ASCII à esquerda, chave: valor à direita.
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useTheme } from '../composables/useTheme'
import { useLocale } from '../composables/useLocale'
// foto em dot art (braille, 100 colunas × 50 linhas), uma versão para cada tema;
// cai para o asciiArt do JSON se faltar
import artLight from '../data/dot-art-light.txt?raw'
import artDark from '../data/dot-art-dark.txt?raw'

// até montar, usa a arte escura (igual ao HTML pré-renderizado); depois segue o tema
const { isDark } = useTheme()
const mounted = ref(false)
onMounted(() => (mounted.value = true))
const dotArt = computed(() => (!mounted.value || isDark.value ? artDark : artLight).trimEnd())

const props = defineProps({
  cv: { type: Object, required: true },
})

const { t, pdf, pdfName } = useLocale()

const info = computed(() => {
  const { cv } = props
  const k = t.value.hero.keys
  return [
    { key: k.cargo, value: cv.titulo },
    { key: k.empresa, value: cv.empresa_atual ?? cv.experiencias?.[0]?.empresa.split(',')[0] },
    { key: k.local, value: cv.contato.localizacao },
    { key: k.formacao, value: cv.formacao?.[0]?.curso },
    { key: k.stack, value: cv.habilidades.slice(0, 5).join(' · ') },
    { key: k.email, value: cv.contato.email, href: `mailto:${cv.contato.email}` },
  ].filter((row) => row.value)
})

// blocos de cor do neofetch, usando a paleta do tema atual
const swatches = ['--fg', '--muted', '--accent', '--border', '--surface', '--bg']

// ===== Foto real atrás da dot art: clique "descriptografa" =====
// A dot art embaralha em braille aleatório e uma linha de varredura revela a foto,
// primeiro em blocos grandes tingidos de fósforo, que vão ficando nítidos.
// Clique de novo faz o caminho inverso. Sem animação com "reduzir movimento".
const PHOTO = '/me/savio.jpg'
const { locale } = useLocale()
const showPhoto = ref(false)
const animating = ref(false)
const asciiOverride = ref(null) // texto embaralhado durante a transição
const shownArt = computed(() => asciiOverride.value ?? (dotArt.value || props.cv.asciiArt))
const portraitLabels = computed(() =>
  locale.value === 'en'
    ? { show: 'Show photo of Sávio Godinho', hide: 'Back to the dot art', hintShow: 'click to decrypt', hintHide: 'click to encrypt', alt: 'Photo of Sávio Godinho' }
    : { show: 'Mostrar foto de Sávio Godinho', hide: 'Voltar para a arte em pontos', hintShow: 'clique para descriptografar', hintHide: 'clique para criptografar', alt: 'Foto de Sávio Godinho' },
)

const preRef = ref(null)
const canvasRef = ref(null)
let photo = null

onMounted(() => {
  // carrega a foto antes do clique, para a animação não engasgar
  photo = new Image()
  photo.decoding = 'async'
  photo.src = PHOTO
})

const BRAILLE_START = 0x2800

// ===== Sinal instável: os pontos "chiam" o tempo todo =====
// Em vez de sortear caracteres (viraria ruído), inverte 1 dos 8 pontos do braille:
// o desenho continua lá, só tremendo. Mais forte com o mouse em cima.
const hovering = ref(false)
let jitterRaf = 0
let lastJitter = 0
let artVisible = true
let artObserver = null

function jitterDots(text, amount) {
  let out = ''
  for (const ch of text) {
    const code = ch.charCodeAt(0)
    if (code >= BRAILLE_START && code <= BRAILLE_START + 0xff && Math.random() < amount) {
      out += String.fromCharCode(BRAILLE_START + ((code - BRAILLE_START) ^ (1 << ((Math.random() * 8) | 0))))
    } else {
      out += ch
    }
  }
  return out
}

function jitterLoop(now) {
  jitterRaf = requestAnimationFrame(jitterLoop)
  if (animating.value || showPhoto.value || !artVisible || document.hidden) return
  const interval = hovering.value ? 60 : 140
  if (now - lastJitter < interval) return
  lastJitter = now
  asciiOverride.value = jitterDots(dotArt.value || props.cv.asciiArt, hovering.value ? 0.04 : 0.006)
}

onMounted(() => {
  if (!document.documentElement.classList.contains('motion-ok')) return
  artObserver = new IntersectionObserver(([entry]) => (artVisible = entry.isIntersecting))
  if (preRef.value) artObserver.observe(preRef.value)
  jitterRaf = requestAnimationFrame(jitterLoop)
})

onUnmounted(() => {
  cancelAnimationFrame(jitterRaf)
  artObserver?.disconnect()
})

function scramble(text, amount) {
  let out = ''
  for (const ch of text) {
    out += ch === '\n' || Math.random() >= amount ? ch : String.fromCharCode(BRAILLE_START + ((Math.random() * 256) | 0))
  }
  return out
}

// área onde a foto cabe inteira no bloco (como object-fit: contain), centralizada
function containRect(iw, ih, w, h) {
  const scale = Math.min(w / iw, h / ih)
  const dw = iw * scale
  const dh = ih * scale
  return [(w - dw) / 2, (h - dh) / 2, dw, dh]
}

const BLOCKS = [40, 28, 20, 14, 10, 7, 5, 3, 2, 1]
const DURATION = 1400

function runDecrypt(forward) {
  const canvas = canvasRef.value
  const pre = preRef.value
  const { width: w, height: h } = pre.getBoundingClientRect()
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.round(w * dpr)
  canvas.height = Math.round(h * dpr)
  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  const off = document.createElement('canvas')
  const octx = off.getContext('2d')
  const [dx, dy, dw, dh] = containRect(photo.naturalWidth, photo.naturalHeight, w, h)
  const fg = getComputedStyle(document.documentElement).getPropertyValue('--fg').trim() || '#33ff66'
  const base = dotArt.value || props.cv.asciiArt

  return new Promise((resolve) => {
    const start = performance.now()
    let lastText = 0
    const frame = (now) => {
      const t = Math.min(1, (now - start) / DURATION)
      const p = forward ? t : 1 - t // 0 = dot art, 1 = foto

      // braille embaralhando (troca a ~20fps, cara de terminal)
      if (now - lastText > 50 || t === 1) {
        asciiOverride.value = scramble(base, Math.min(1, p * 2.2))
        lastText = now
      }

      ctx.clearRect(0, 0, w, h)
      const q = Math.max(0, (p - 0.15) / 0.85) // a foto só começa depois do embaralhamento
      if (q > 0) {
        const block = BLOCKS[Math.min(BLOCKS.length - 1, Math.floor(q * BLOCKS.length))]
        const sw = Math.max(1, Math.ceil(dw / block))
        const sh = Math.max(1, Math.ceil(dh / block))
        off.width = sw
        off.height = sh
        octx.drawImage(photo, 0, 0, sw, sh)
        const sweep = h * Math.min(1, q * 1.4)

        ctx.save()
        ctx.beginPath()
        ctx.rect(0, 0, w, sweep)
        ctx.clip()
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(off, 0, 0, sw, sh, dx, dy, dw, dh)
        // tinta de fósforo que some conforme a imagem "decifra"
        ctx.globalCompositeOperation = 'color'
        ctx.globalAlpha = 1 - q
        ctx.fillStyle = fg
        ctx.fillRect(dx, dy, dw, dh)
        ctx.restore()

        // linha de varredura
        if (sweep < h) {
          ctx.save()
          ctx.fillStyle = fg
          ctx.shadowColor = fg
          ctx.shadowBlur = 12
          ctx.fillRect(0, sweep - 2, w, 2)
          ctx.restore()
        }
      }

      if (t < 1) requestAnimationFrame(frame)
      else resolve()
    }
    requestAnimationFrame(frame)
  })
}

async function togglePortrait() {
  if (animating.value) return
  const target = !showPhoto.value
  const motionOk = document.documentElement.classList.contains('motion-ok')
  if (!motionOk || !photo) {
    showPhoto.value = target
    return
  }
  animating.value = true
  try {
    await photo.decode()
    await runDecrypt(target)
  } catch {
    // foto não carregou: troca direto
  }
  showPhoto.value = target
  asciiOverride.value = null
  animating.value = false
}
</script>

<template>
  <section id="top" class="hero" :aria-label="t.hero.aria">
    <button
      type="button"
      class="hero__portrait"
      :class="{ 'is-photo': showPhoto && !animating, 'is-animating': animating, 'is-hover': hovering }"
      :aria-pressed="showPhoto"
      :aria-label="showPhoto ? portraitLabels.hide : portraitLabels.show"
      @click="togglePortrait"
      @pointerenter="hovering = true"
      @pointerleave="hovering = false"
      @focus="hovering = true"
      @blur="hovering = false"
    >
      <!-- dentro de <button> só cabe conteúdo de texto: a arte é um span com white-space: pre -->
      <span class="hero__frame">
        <span ref="preRef" class="hero__ascii" aria-hidden="true">{{ shownArt }}</span>
        <canvas ref="canvasRef" class="hero__decrypt" aria-hidden="true"></canvas>
        <img
          class="hero__photo"
          :src="PHOTO"
          :alt="portraitLabels.alt"
          width="800"
          height="800"
          loading="lazy"
          decoding="async"
        />
      </span>
      <span class="hero__hint" aria-hidden="true">[ {{ showPhoto ? portraitLabels.hintHide : portraitLabels.hintShow }} ]</span>
    </button>

    <div class="hero__info">
      <!-- animações de entrada (classes hero__cmd / seq + --i) ficam em assets/motion.css -->
      <p class="prompt">
        <span class="prompt__user">savio@godinho:~</span><span class="hero__cmd">neofetch</span>
      </p>

      <h1 class="hero__name seq" style="--i: 0">
        {{ cv.nome }}<span class="cursor" aria-hidden="true"></span>
      </h1>
      <div class="hero__rule seq" style="--i: 1" aria-hidden="true"></div>

      <dl class="kv">
        <template v-for="(row, i) in info" :key="row.key">
          <dt class="seq" :style="{ '--i': i + 2 }">{{ row.key }}</dt>
          <dd class="seq" :style="{ '--i': i + 2 }">
            <a v-if="row.href" :href="row.href">{{ row.value }}</a>
            <template v-else>{{ row.value }}</template>
          </dd>
        </template>
      </dl>

      <div class="hero__swatches seq" :style="{ '--i': info.length + 2 }" aria-hidden="true">
        <span v-for="s in swatches" :key="s" :style="{ background: `var(${s})` }"></span>
      </div>

      <div class="hero__ctas seq" :style="{ '--i': info.length + 3 }">
        <a class="btn btn--accent" :href="pdf" :download="pdfName">↓ {{ t.pdf.cta }}</a>
        <a class="btn" :href="cv.contato.github" target="_blank" rel="noopener">github ↗</a>
        <a class="btn" :href="cv.contato.linkedin" target="_blank" rel="noopener">linkedin ↗</a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: var(--space-5);
  min-height: calc(100vh - var(--topbar-h));
  min-height: calc(100svh - var(--topbar-h));
  padding-block: var(--space-5);
}

/* Arte densa (100 colunas): fonte minúscula que escala com a largura da tela.
   overflow: hidden é só uma rede de segurança caso a fonte de braille seja mais larga. */
.hero__ascii {
  display: block;
  white-space: pre;
  max-width: 100%;
  margin: 0;
  overflow: hidden;
  color: var(--fg);
  font-family: var(--font-mono);
  font-size: clamp(3px, 0.55vw, 8px);
  line-height: 1;
  letter-spacing: 0;
  /* glow forte borra os pontos; aqui só um brilho leve */
  text-shadow: 0 0 2px color-mix(in srgb, var(--fg) 40%, transparent);
  user-select: none;
}

/* Claro: pontos finos somem nas faixas do papel; tinta mais escura,
   contorno para engrossar os pontos e fundo liso atrás da arte */
:root[data-theme='light'] .hero__ascii {
  color: #0f2a17;
  background: var(--surface);
  -webkit-text-stroke: 0.35px currentColor;
  text-shadow: none;
}

/* ---- foto real atrás da dot art ---- */
.hero__portrait {
  display: block;
  max-width: 100%;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.hero__frame {
  position: relative;
  display: block;
}

.hero__decrypt,
.hero__photo {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0;
}

.hero__photo {
  /* a dot art veio da foto quadrada inteira; contain mostra a foto toda, sem zoom */
  object-fit: contain;
}

/* durante a transição: canvas por cima do braille embaralhado */
.hero__portrait.is-animating .hero__decrypt {
  opacity: 1;
}

/* foto revelada: a arte some, mas segura o tamanho do bloco (layout não pula) */
.hero__portrait.is-photo .hero__ascii {
  visibility: hidden;
}

.hero__portrait.is-photo .hero__photo {
  opacity: 1;
}

.hero__hint {
  display: block;
  margin-top: var(--space-2);
  color: var(--muted);
  font-size: 0.8rem;
  text-align: center;
  text-shadow: none;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.hero__portrait:hover .hero__hint,
.hero__portrait:focus-visible .hero__hint {
  color: var(--accent);
  opacity: 1;
}

.hero__portrait:focus-visible {
  outline: 2px dashed var(--accent);
  outline-offset: 6px;
}

.hero__info {
  min-width: 0;
}

.hero__name {
  margin-block: var(--space-2) var(--space-3);
  overflow-wrap: anywhere;
}

.hero__rule {
  width: min(100%, 24ch);
  margin-bottom: var(--space-4);
  border-top: 2px dashed var(--border);
}

.hero__swatches {
  display: flex;
  margin-top: var(--space-4);
}

.hero__swatches span {
  width: 2.5ch;
  height: 1.25em;
  border: 1px solid var(--border);
}

.hero__swatches span + span {
  border-left: 0;
}

.hero__ctas {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-4);
}

@media (max-width: 768px) {
  .hero {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-4);
    min-height: 0;
  }

  /* 1 coluna: a arte ocupa a largura do container (100 colunas de braille ≈ 0.6em cada) */
  .hero__ascii {
    font-size: min(8px, calc((100vw - 2rem) / 62));
  }
}
</style>
