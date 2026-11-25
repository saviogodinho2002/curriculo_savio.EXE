<script setup>
// Telas do projeto: print principal + miniaturas com legenda. Clicar no print abre
// o <dialog> nativo em tamanho grande (Esc fecha, ← → trocam de tela).
// Os prints são 1280×800 (public/projects/<slug>/<n>.webp).
import { computed, ref } from 'vue'
import RichText from './RichText.vue'
import { useLocale } from '../../composables/useLocale'

const props = defineProps({
  data: { type: Array, required: true }, // [{ src, legenda }]
  title: { type: String, default: '' },
})

const { t } = useLocale()
const current = ref(0)
const dialog = ref(null)
const shot = computed(() => props.data[current.value])
const alt = (p, i) => `${props.title} — ${p.legenda || t.value.project.shotOf(i + 1, props.data.length)}`

function go(step) {
  const n = props.data.length
  current.value = (current.value + step + n) % n
}

function open() {
  dialog.value?.showModal()
}

function close() {
  dialog.value?.close()
}

function onKey(e) {
  if (e.key === 'ArrowRight') go(1)
  if (e.key === 'ArrowLeft') go(-1)
}

// clique no fundo escuro (fora do conteúdo) fecha
function onBackdrop(e) {
  if (e.target === dialog.value) close()
}
</script>

<template>
  <div class="gallery">
    <figure class="gallery__main reveal-item" style="--i: 1">
      <button type="button" class="gallery__zoom" :aria-label="t.project.zoom" @click="open">
        <img
          :key="shot.src"
          :src="shot.src"
          :alt="alt(shot, current)"
          width="1280"
          height="800"
          :fetchpriority="current === 0 ? 'high' : undefined"
          decoding="async"
        />
      </button>
      <figcaption class="gallery__cap muted">
        <span class="gallery__count">[{{ current + 1 }}/{{ data.length }}]</span>
        <RichText :text="shot.legenda" />
      </figcaption>
    </figure>

    <ul v-if="data.length > 1" class="gallery__thumbs">
      <li v-for="(p, i) in data" :key="p.src" class="reveal-item" :style="{ '--i': i + 2 }">
        <button
          type="button"
          class="gallery__thumb"
          :class="{ 'is-active': i === current }"
          :aria-label="t.project.shotOf(i + 1, data.length)"
          :aria-current="i === current ? 'true' : undefined"
          @click="current = i"
        >
          <img :src="p.src" alt="" width="320" height="200" loading="lazy" decoding="async" />
        </button>
      </li>
    </ul>

    <dialog ref="dialog" class="lightbox" :aria-label="title" @keydown="onKey" @click="onBackdrop">
      <div class="lightbox__bar">
        <span class="muted">{{ t.project.shotOf(current + 1, data.length) }}</span>
        <button type="button" class="btn" @click="close">× {{ t.project.close }}</button>
      </div>
      <img class="lightbox__img" :src="shot.src" :alt="alt(shot, current)" width="1280" height="800" />
      <div class="lightbox__foot">
        <button v-if="data.length > 1" type="button" class="btn" @click="go(-1)">← {{ t.project.prev }}</button>
        <p class="lightbox__cap">{{ shot.legenda }}</p>
        <button v-if="data.length > 1" type="button" class="btn" @click="go(1)">{{ t.project.next }} →</button>
      </div>
    </dialog>
  </div>
</template>

<style scoped>
.gallery__main {
  margin: 0;
}

.gallery__zoom {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  border: 1px solid var(--border);
  background: var(--bg);
  cursor: zoom-in;
  overflow: hidden;
  transition: border-color 0.2s ease;
}

.gallery__zoom:hover,
.gallery__zoom:focus-visible {
  border-color: var(--accent);
}

.gallery__zoom img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  object-position: top;
}

/* scanlines por cima do print, como no card (somem no tema claro) */
.gallery__zoom::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(to bottom, var(--scanline) 0 1px, transparent 1px 3px);
}

/* troca de tela: a nova imagem "sintoniza" no lugar da anterior */
html.motion-ok .gallery__zoom img {
  animation: tune-in 260ms steps(6, end) both;
}

@keyframes tune-in {
  from { clip-path: inset(0 0 100% 0); filter: brightness(1.8); }
  to { clip-path: inset(0 0 0 0); filter: none; }
}

.gallery__cap {
  margin-top: var(--space-2);
  font-size: 0.9rem;
}

.gallery__count {
  margin-right: 1ch;
  color: var(--accent);
}

.gallery__thumbs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 9rem), 1fr));
  gap: var(--space-2);
  margin: var(--space-3) 0 0;
  padding: 0;
  list-style: none;
}

.gallery__thumb {
  display: block;
  width: 100%;
  padding: 0;
  border: 1px solid var(--border);
  background: var(--bg);
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.2s ease, border-color 0.2s ease;
}

.gallery__thumb img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  object-position: top;
}

.gallery__thumb:hover,
.gallery__thumb:focus-visible {
  opacity: 1;
  border-color: var(--fg);
}

.gallery__thumb.is-active {
  opacity: 1;
  border-color: var(--accent);
  box-shadow: 0 0 0 1px var(--accent);
}

/* ===== lightbox ===== */
.lightbox {
  width: min(96vw, 1400px);
  max-width: none;
  max-height: 96vh;
  padding: var(--space-3);
  border: 3px double var(--accent);
  background: var(--surface);
  color: var(--fg);
}

.lightbox::backdrop {
  background: color-mix(in srgb, var(--bg) 85%, transparent);
}

html.motion-ok .lightbox[open] {
  animation: win-open var(--dur) steps(6, end) both;
}

.lightbox__bar,
.lightbox__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-2);
  font-size: 0.9rem;
}

.lightbox__bar {
  margin-bottom: var(--space-2);
}

.lightbox__img {
  display: block;
  width: 100%;
  height: auto;
  max-height: calc(96vh - 8rem);
  object-fit: contain;
  background: var(--bg);
}

.lightbox__foot {
  margin-top: var(--space-2);
}

.lightbox__cap {
  flex: 1;
  margin: 0;
  text-align: center;
}

@media (max-width: 600px) {
  .lightbox__foot {
    flex-wrap: wrap;
  }

  .lightbox__cap {
    order: -1;
    flex-basis: 100%;
  }
}
</style>
