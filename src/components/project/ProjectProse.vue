<script setup>
// Parágrafos corridos (visão geral do projeto).
import RichText from './RichText.vue'

defineProps({ data: { type: Array, required: true } }) // [texto]
</script>

<template>
  <div class="prose">
    <p v-for="(p, i) in data" :key="i" class="reveal-item" :style="{ '--i': i + 1 }">
      <RichText :text="p" />
    </p>
  </div>
</template>

<style scoped>
.prose {
  max-width: 72ch;
}
</style>
