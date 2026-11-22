<script setup>
import { bullets, formatPeriod } from '../../utils/parseCv'
import LogEntry from '../LogEntry.vue'

const props = defineProps({
  cv: { type: Object, required: true },
})

const items = (props.cv.formacao || []).map((f) => ({
  key: `${f.instituicao}-${f.curso}`,
  period: formatPeriod(f.periodo),
  title: f.curso,
  subtitle: f.instituicao.replace(/,\s*/, ' · '),
  bullets: bullets(f.descricao),
}))
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
  />
</template>
