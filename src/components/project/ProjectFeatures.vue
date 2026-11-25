<script setup>
// Funcionalidades numeradas 01, 02, ... (lista ordenada de verdade, número só visual).
import RichText from './RichText.vue'

defineProps({ data: { type: Array, required: true } }) // [texto]

const pad = (n) => String(n).padStart(2, '0')
</script>

<template>
  <ol class="features">
    <li v-for="(f, i) in data" :key="i" class="feature reveal-item" :style="{ '--i': i + 1 }">
      <span class="feature__n" aria-hidden="true">{{ pad(i + 1) }}</span>
      <span><RichText :text="f" /></span>
    </li>
  </ol>
</template>

<style scoped>
.features {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
  gap: var(--space-2) var(--space-4);
  margin: 0;
  padding: 0;
  list-style: none;
}

.feature {
  display: grid;
  grid-template-columns: 3ch minmax(0, 1fr);
  gap: 1ch;
  padding-block: var(--space-2);
  border-bottom: 1px dashed var(--border);
}

.feature__n {
  color: var(--accent);
  font-weight: 700;
  text-shadow: var(--glow-accent);
}
</style>
