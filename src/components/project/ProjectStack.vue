<script setup>
// Stack agrupada: "## grupo" + chips.
defineProps({ data: { type: Array, required: true } }) // [{ grupo, itens: [] }]
</script>

<template>
  <div class="stack">
    <div v-for="(g, i) in data" :key="g.grupo" class="stack__group reveal-item" :style="{ '--i': i + 1 }">
      <h3 class="subhead stack__title">{{ g.grupo }}</h3>
      <ul class="chips stack__chips">
        <li v-for="item in g.itens" :key="item" class="chip">{{ item }}</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.stack {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
  gap: var(--space-4);
}

.stack__title {
  font-size: 1.3rem;
}

.stack__chips {
  margin: var(--space-2) 0 0;
  padding: 0;
  list-style: none;
}
</style>
