<script setup>
import { hasLink, highlight, linkLabel, splitTitle } from '../../utils/parseCv'

const props = defineProps({
  cv: { type: Object, required: true },
})

const toCard = (p) => ({
  ...splitTitle(p.nome),
  key: p.nome,
  descricao: p.descricao,
  link: hasLink(p.link) ? p.link : null,
  linkText: hasLink(p.link) ? linkLabel(p.link) : '',
})

const groups = [
  { id: 'profissional', title: 'profissional', items: props.cv.projetos || [] },
  { id: 'codigo', title: 'código no github', items: props.cv.projetos_codigo || [] },
]
  .filter((g) => g.items.length)
  .map((g) => ({ ...g, items: g.items.map(toCard) }))
</script>

<template>
  <div v-for="g in groups" :key="g.id" class="group">
    <h3 class="subhead reveal-item" style="--i: 0">{{ g.title }}</h3>

    <div class="grid">
      <article
        v-for="(p, i) in g.items"
        :key="p.key"
        class="pcard reveal-item"
        :style="{ '--i': i + 1 }"
      >
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

        <footer v-if="p.link" class="pcard__foot">
          <a class="btn btn--accent" :href="p.link" target="_blank" rel="noopener">abrir ↗</a>
          <span class="pcard__url muted">{{ p.linkText }}</span>
        </footer>
      </article>
    </div>
  </div>
</template>

<style scoped>
.group + .group {
  margin-top: var(--space-5);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 19rem), 1fr));
  gap: var(--space-4);
  margin-top: var(--space-3);
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
