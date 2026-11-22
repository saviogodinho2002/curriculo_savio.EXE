<script setup>
import { linkLabel, telHref } from '../../utils/parseCv'
import { useLocale } from '../../composables/useLocale'

const props = defineProps({
  cv: { type: Object, required: true },
})

const { t, pdf, pdfName } = useLocale()
const k = t.value.contact.keys

const c = props.cv.contato
const rows = [
  { key: k.email, value: c.email, href: `mailto:${c.email}` },
  { key: k.telefone, value: c.telefone, href: telHref(c.telefone) },
  { key: k.linkedin, value: c.linkedin && linkLabel(c.linkedin), href: c.linkedin, external: true },
  { key: k.github, value: c.github && linkLabel(c.github), href: c.github, external: true },
  { key: k.local, value: c.localizacao },
].filter((r) => r.value)
</script>

<template>
  <p class="prompt reveal-item" style="--i: 0">
    <span class="prompt__user">~</span>{{ t.contact.cmd }}
  </p>

  <dl class="kv contact__kv">
    <template v-for="(r, i) in rows" :key="r.key">
      <dt class="reveal-item" :style="{ '--i': i + 1 }">{{ r.key }}</dt>
      <dd class="reveal-item" :style="{ '--i': i + 1 }">
        <a
          v-if="r.href"
          :href="r.href"
          :target="r.external ? '_blank' : undefined"
          :rel="r.external ? 'noopener' : undefined"
        >{{ r.value }}</a>
        <template v-else>{{ r.value }}</template>
      </dd>
    </template>
  </dl>

  <div class="contact__ctas reveal-item" :style="{ '--i': rows.length + 1 }">
    <a class="btn btn--accent" :href="`mailto:${c.email}`">{{ t.contact.send }}</a>
    <a class="btn" :href="pdf" :download="pdfName">↓ cv.pdf</a>
  </div>
</template>

<style scoped>
.contact__kv {
  margin-top: var(--space-3);
}

.contact__ctas {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-4);
}
</style>
