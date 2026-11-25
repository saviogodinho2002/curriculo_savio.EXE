<script setup>
// "O que eu fiz": lista com marcador "> ", no estilo das experiências.
import RichText from './RichText.vue'

defineProps({ data: { type: Array, required: true } }) // [texto]
</script>

<template>
  <ul class="list-arrow bullets">
    <li v-for="(b, i) in data" :key="i" class="reveal-item" :style="{ '--i': i + 1 }">
      <RichText :text="b" />
    </li>
  </ul>
</template>

<style scoped>
.bullets {
  max-width: 80ch;
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
