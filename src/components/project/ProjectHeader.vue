<script setup>
// Topo da página de projeto: [← projetos], prompt "cat <slug>.md", título com cursor,
// subtítulo, linha meta (período · tags · status) e links do sistema.
// Entrada animada em assets/motion.css (.phead__cmd e .phead .seq).
import { useLocale } from '../../composables/useLocale'

defineProps({
  slug: { type: String, required: true },
  title: { type: String, required: true },
  page: { type: Object, required: true },
  back: { type: [String, Object], required: true },
})

const { t } = useLocale()
</script>

<template>
  <header id="top" class="phead">
    <RouterLink class="btn phead__back" :to="back">← {{ t.project.back }}</RouterLink>

    <p class="prompt phead__prompt">
      <span class="prompt__user">savio@godinho:~/{{ t.project.dir }}</span><span class="phead__cmd">cat {{ slug }}.md</span>
    </p>

    <h1 class="phead__title seq" style="--i: 0">
      {{ title }}<span class="cursor" aria-hidden="true"></span>
    </h1>

    <p v-if="page.subtitulo" class="phead__sub seq" style="--i: 1">{{ page.subtitulo }}</p>

    <ul class="phead__meta seq" style="--i: 2">
      <li v-if="page.periodo">{{ page.periodo }}</li>
      <li v-for="tag in page.tags || []" :key="tag">{{ tag }}</li>
      <li v-if="page.status" class="phead__status">● {{ page.status }}</li>
    </ul>

    <div v-if="page.links?.length" class="phead__ctas seq" style="--i: 3">
      <a
        v-for="(l, i) in page.links"
        :key="l.url"
        class="btn"
        :class="{ 'btn--accent': i === 0 }"
        :href="l.url"
        target="_blank"
        rel="noopener"
      >{{ l.rotulo }} ↗</a>
    </div>
  </header>
</template>

<style scoped>
.phead {
  padding-block: var(--space-5) var(--space-4);
}

.phead__back {
  margin-left: calc(-1 * var(--space-2));
}

.phead__prompt {
  margin-top: var(--space-4);
}

.phead__title {
  margin-block: var(--space-2) var(--space-3);
  overflow-wrap: anywhere;
}

.phead__sub {
  max-width: 62ch;
  font-size: 1.1rem;
}

.phead__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1) 0;
  margin-top: var(--space-3);
  padding: 0;
  list-style: none;
  color: var(--muted);
  font-size: 0.9rem;
}

.phead__meta li + li::before {
  content: '·';
  margin-inline: 1ch;
  color: var(--border);
}

.phead__status {
  color: var(--accent);
  text-shadow: var(--glow-accent);
}

.phead__ctas {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-4);
  margin-left: calc(-1 * var(--space-2));
}
</style>
