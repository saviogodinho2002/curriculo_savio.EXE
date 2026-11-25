<script setup>
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
</script>

<template>
  <div v-for="g in groups" :key="g.id" class="group">
    <div class="grid">
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
</style>
