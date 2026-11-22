<script setup>
import { computed } from 'vue'
import { splitResumo } from '../../utils/parseCv'

const props = defineProps({
  cv: { type: Object, required: true },
})

const resumo = computed(() => splitResumo(props.cv.resumo))
</script>

<template>
  <p class="prompt reveal-item" style="--i: 0">
    <span class="prompt__user">~</span>cat sobre.md
  </p>

  <p class="about__intro reveal-item" style="--i: 1">{{ resumo.intro }}</p>

  <template v-if="resumo.highlights.length">
    <p v-if="resumo.label" class="about__label muted reveal-item" style="--i: 2">{{ resumo.label }}</p>
    <ul class="list-arrow">
      <li
        v-for="(h, i) in resumo.highlights"
        :key="h"
        class="reveal-item"
        :style="{ '--i': i + 3 }"
      >{{ h }}</li>
    </ul>
  </template>
</template>

<style scoped>
.about__intro {
  margin-top: var(--space-3);
  max-width: 70ch;
}

.about__label {
  margin-block: var(--space-4) var(--space-2);
}
</style>
