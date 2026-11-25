<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { hasLink, highlight, linkLabel, splitTitle } from '../../utils/parseCv'
import { useLocale } from '../../composables/useLocale'
import { projectPath } from '../../seo/site'

const props = defineProps({
  cv: { type: Object, required: true },
  // 'profissional' (seção projetos) ou 'codigo' (seção código no github)
  group: { type: String, default: 'profissional' },
})

const { t, locale } = useLocale()

const toCard = (p) => ({
  ...splitTitle(p.nome),
  key: p.nome,
  descricao: p.descricao,
  link: hasLink(p.link) ? p.link : null,
  linkText: hasLink(p.link) ? linkLabel(p.link) : '',
  // print do projeto (public/projects/<slug>-card.webp, 640×400); projetos de código não têm
  shot: p.imagem ? `${p.imagem}-card.webp` : null,
  // página própria do projeto (só os que têm "pagina" no JSON)
  page: p.slug && p.pagina ? projectPath(locale.value, p.slug) : null,
})

const groups = [
  { id: 'profissional', title: t.value.projects.professional, items: props.cv.projetos || [] },
  { id: 'codigo', title: t.value.projects.code, items: props.cv.projetos_codigo || [] },
]
  .filter((g) => g.id === props.group && g.items.length)
  .map((g) => ({ ...g, items: g.items.map(toCard) }))

// ===== Cards "corrompidos" fechando a última linha do grid =====
// Decorativos: preenchem os buracos que sobram ao lado do último projeto,
// conforme quantas colunas o grid tem na largura atual (recalcula no resize).
const gridEl = ref(null)
const fillers = ref(0)
let resizeObs = null

// ref dentro de v-for vira lista no Vue: pega o grid (só há um grupo por seção)
const gridNode = () => (Array.isArray(gridEl.value) ? gridEl.value[0] : gridEl.value)

function measureFillers() {
  const el = gridNode()
  if (!el || props.group !== 'profissional') return
  const cols = getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length
  const n = groups[0]?.items.length ?? 0
  fillers.value = cols > 1 ? (cols - (n % cols)) % cols : 0
}

onMounted(() => {
  const el = gridNode()
  if (props.group !== 'profissional' || !el) return
  measureFillers()
  resizeObs = new ResizeObserver(measureFillers)
  resizeObs.observe(el)
})

onUnmounted(() => resizeObs?.disconnect())

const GLITCH = '▓▒░█▚▞▙▟'
const noise = (len) => Array.from({ length: len }, () => GLITCH[(Math.random() * GLITCH.length) | 0]).join('')
const hex = () => '0x' + ((Math.random() * 0xffff) | 0).toString(16).toUpperCase().padStart(4, '0')

const corrupted = computed(() =>
  Array.from({ length: fillers.value }, (_, k) => {
    const en = locale.value === 'en'
    return {
      key: `corrupt-${k}`,
      title: `${noise(4)}_${noise(3)}.bin`,
      signal: en ? 'NO SIGNAL' : 'SEM SINAL',
      desc: en
        ? `READ ERROR at sector ${hex()}. This project could not be recovered: ${noise(10)}`
        : `ERRO DE LEITURA no setor ${hex()}. Não foi possível recuperar este projeto: ${noise(10)}`,
      status: en ? 'checksum mismatch' : 'checksum inválido',
      dead: en ? 'open ✗' : 'abrir ✗',
    }
  }),
)
</script>

<template>
  <div v-for="g in groups" :key="g.id" class="group">
    <div ref="gridEl" class="grid">
      <article
        v-for="(p, i) in g.items"
        :key="p.key"
        class="pcard reveal-item"
        :class="{ 'pcard--shot': p.shot }"
        :style="{ '--i': i + 1 }"
      >
        <component
          :is="p.page ? 'RouterLink' : 'figure'"
          v-if="p.shot"
          :to="p.page || undefined"
          class="pcard__shot"
          :tabindex="p.page ? -1 : undefined"
        >
          <img
            :src="p.shot"
            :alt="`${t.projects.shot} ${p.title}`"
            width="640"
            height="400"
            loading="lazy"
            decoding="async"
          />
        </component>

        <header class="pcard__head">
          <h4 class="pcard__title">{{ p.title }}</h4>
          <p v-if="p.subtitle" class="pcard__subtitle muted">{{ p.subtitle }}</p>
        </header>

        <p class="pcard__desc">
          <template v-for="(seg, i) in highlight(p.descricao)" :key="i">
            <strong v-if="seg.metric" class="metric">{{ seg.text }}</strong>
            <template v-else>{{ seg.text }}</template>
          </template>
        </p>

        <footer v-if="p.link || p.page" class="pcard__foot">
          <RouterLink v-if="p.page" class="btn btn--accent" :to="p.page">{{ t.projects.details }}</RouterLink>
          <a v-if="p.link" class="btn" :class="{ 'btn--accent': !p.page }" :href="p.link" target="_blank" rel="noopener">{{ t.projects.open }}</a>
          <span v-if="p.link" class="pcard__url muted">{{ p.linkText }}</span>
        </footer>
      </article>

      <!-- cards corrompidos: só enfeite, fecham a última linha do grid -->
      <article
        v-for="(c, k) in corrupted"
        :key="c.key"
        class="pcard pcard--shot pcard--corrupt"
        :style="{ '--i': g.items.length + k + 1 }"
        aria-hidden="true"
      >
        <div class="pcard__shot pcard__static">
          <span class="pcard__nosignal">{{ c.signal }}</span>
        </div>
        <header class="pcard__head">
          <h4 class="pcard__title pcard__title--glitch">{{ c.title }}</h4>
        </header>
        <p class="pcard__desc pcard__desc--corrupt">{{ c.desc }}</p>
        <footer class="pcard__foot">
          <span class="btn pcard__dead">{{ c.dead }}</span>
          <span class="pcard__url muted">{{ c.status }}</span>
        </footer>
      </article>
    </div>
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 19rem), 1fr));
  gap: var(--space-4);
}

.pcard {
  display: flex;
  flex-direction: column;
  padding: var(--space-3);
  border: 1px solid var(--border);
  background: var(--bg);
  transition: border-color 0.2s ease;
}

.pcard:hover {
  border-color: var(--accent);
}

/* Print do projeto no topo do card, como uma "tela" dentro da janela */
.pcard__shot {
  position: relative;
  display: block;
  margin: calc(-1 * var(--space-3)) calc(-1 * var(--space-3)) var(--space-3);
  aspect-ratio: 16 / 10;
  overflow: hidden;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}

.pcard__shot img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  transition: transform 0.4s ease;
}

/* scanlines por cima do print (somem no tema claro, onde --scanline é transparente) */
.pcard__shot::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(to bottom, var(--scanline) 0 1px, transparent 1px 3px);
}

.pcard:hover .pcard__shot img {
  transform: scale(1.03);
}

@media (prefers-reduced-motion: reduce) {
  .pcard__shot img {
    transition: none;
  }

  .pcard:hover .pcard__shot img {
    transform: none;
  }
}

.pcard__head {
  padding-bottom: var(--space-2);
  margin-bottom: var(--space-2);
  border-bottom: 1px dashed var(--border);
}

.pcard__title {
  font-family: var(--font-display);
  font-size: 1.45rem;
  font-weight: 400;
  line-height: 1.15;
}

.pcard__title::before {
  content: '▸ ';
  color: var(--accent);
  text-shadow: var(--glow-accent);
}

.pcard__subtitle {
  margin-top: var(--space-1);
  font-size: 0.85rem;
}

.pcard__desc {
  font-size: 0.9rem;
}

.pcard__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-1) var(--space-2);
  margin-top: auto;
  padding-top: var(--space-3);
}

.pcard__url {
  min-width: 0;
  font-size: 0.8rem;
  overflow-wrap: anywhere;
}

/* ===== card corrompido ===== */
.pcard--corrupt {
  border-style: dashed;
  opacity: 0.75;
  user-select: none;
}

.pcard--corrupt:hover {
  border-color: var(--border);
}

/* estática de TV no lugar do print */
.pcard__static {
  display: grid;
  place-items: center;
  background:
    repeating-linear-gradient(90deg, color-mix(in srgb, var(--fg) 10%, transparent) 0 2px, transparent 2px 5px),
    repeating-linear-gradient(0deg, color-mix(in srgb, var(--fg) 14%, transparent) 0 1px, transparent 1px 4px),
    var(--surface);
}

.pcard__nosignal {
  padding: 0.1rem 0.6ch;
  border: 1px solid var(--muted);
  background: var(--bg);
  color: var(--muted);
  font-family: var(--font-display);
  font-size: 1.4rem;
  letter-spacing: 0.08em;
  text-shadow: none;
}

.pcard__title--glitch {
  color: var(--muted);
  letter-spacing: 0.05em;
}

.pcard__title--glitch::before {
  content: '✗ ';
  color: var(--muted);
  text-shadow: none;
}

.pcard__desc--corrupt {
  color: var(--muted);
  overflow-wrap: anywhere;
}

.pcard__dead {
  color: var(--muted);
  text-decoration: line-through;
  text-shadow: none;
  cursor: not-allowed;
}

.pcard__dead:hover {
  background: none;
  color: var(--muted);
}

/* chiado da estática e glitch do título (só com movimento liberado) */
html.motion-ok .pcard__static {
  animation: tv-static 0.35s steps(3) infinite;
}

html.motion-ok .pcard__title--glitch {
  animation: title-glitch 2.6s steps(1) infinite;
}

@keyframes tv-static {
  0% { background-position: 0 0, 0 0, 0 0; }
  33% { background-position: 3px 1px, 0 2px, 0 0; }
  66% { background-position: -2px 0, 0 -1px, 0 0; }
  100% { background-position: 1px -1px, 0 1px, 0 0; }
}

@keyframes title-glitch {
  0%, 100% { transform: none; text-shadow: none; }
  41% { transform: translateX(2px); text-shadow: -2px 0 var(--accent); }
  42% { transform: none; text-shadow: none; }
  73% { transform: translateX(-1px); text-shadow: 1px 0 var(--fg); }
  74% { transform: none; text-shadow: none; }
}
</style>
