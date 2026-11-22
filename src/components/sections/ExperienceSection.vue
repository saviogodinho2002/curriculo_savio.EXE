<script setup>
import { formatPeriod, splitTech } from '../../utils/parseCv'
import LogEntry from '../LogEntry.vue'

const props = defineProps({
  cv: { type: Object, required: true },
})

const items = (props.cv.experiencias || []).map((e) => {
  const { bullets, techs } = splitTech(e.descricao)
  return {
    key: `${e.empresa}-${e.periodo}`,
    period: formatPeriod(e.periodo),
    title: e.cargo,
    subtitle: e.empresa.replace(/,\s*/, ' · '),
    bullets,
    chips: techs,
  }
})
</script>

<template>
  <LogEntry
    v-for="(it, i) in items"
    :key="it.key"
    class="reveal-item"
    :style="{ '--i': i }"
    :period="it.period"
    :title="it.title"
    :subtitle="it.subtitle"
    :bullets="it.bullets"
    :chips="it.chips"
  />
</template>
