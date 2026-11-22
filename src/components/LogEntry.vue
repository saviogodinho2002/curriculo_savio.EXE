<script setup>
// Item de linha do tempo em estilo log: [período] título @ subtítulo, bullets e chips.
// Usado em Experiência e Formação.
import { highlight } from '../utils/parseCv'

defineProps({
  period: { type: String, default: '' },
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  bullets: { type: Array, default: () => [] },
  chips: { type: Array, default: () => [] },
})
</script>

<template>
  <article class="log">
    <p v-if="period" class="log__period">[{{ period }}]</p>
    <h3 class="log__title">{{ title }}</h3>
    <p v-if="subtitle" class="log__sub">@ {{ subtitle }}</p>

    <ul v-if="bullets.length" class="list-arrow log__bullets">
      <li v-for="b in bullets" :key="b">
        <template v-for="(seg, i) in highlight(b)" :key="i">
          <strong v-if="seg.metric" class="metric">{{ seg.text }}</strong>
          <template v-else>{{ seg.text }}</template>
        </template>
      </li>
    </ul>

    <div v-if="chips.length" class="chips log__chips">
      <span v-for="c in chips" :key="c" class="chip">{{ c }}</span>
    </div>
  </article>
</template>

<style scoped>
.log {
  position: relative;
  padding-left: var(--space-4);
  border-left: 2px solid var(--border);
}

.log::before {
  content: '◆';
  position: absolute;
  top: 0.1rem;
  left: -0.42rem;
  color: var(--accent);
  font-size: 0.75rem;
  line-height: 1.65rem;
  text-shadow: var(--glow-accent);
}

.log + .log {
  margin-top: var(--space-5);
}

.log__period {
  color: var(--muted);
  font-size: 0.9rem;
}

.log__title {
  margin-top: var(--space-1);
  color: var(--fg);
}

.log__sub {
  color: var(--accent);
  text-shadow: var(--glow-accent);
}

.log__bullets {
  margin-top: var(--space-3);
}

.log__chips {
  margin-top: var(--space-3);
}
</style>
