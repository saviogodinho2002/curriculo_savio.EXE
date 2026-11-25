<script setup>
// Texto do JSON com destaques (**marcados** e métricas como +36,7%), sem v-html.
import { highlight } from '../../utils/parseCv'

defineProps({ text: { type: String, default: '' } })
</script>

<template>
  <template v-for="(seg, i) in highlight(text)" :key="i">
    <strong v-if="seg.metric" class="metric">{{ seg.text }}</strong>
    <template v-else>{{ seg.text }}</template>
  </template>
</template>
