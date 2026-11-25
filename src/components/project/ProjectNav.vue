<script setup>
// Rodapé da página: projeto anterior / próximo (entre os que têm página) e volta à lista.
import { useLocale } from '../../composables/useLocale'

defineProps({
  prev: { type: Object, default: null }, // { title, to }
  next: { type: Object, default: null },
  back: { type: [String, Object], required: true },
})

const { t } = useLocale()
</script>

<template>
  <nav class="pnav" :aria-label="t.project.navAria">
    <RouterLink v-if="prev" class="pnav__link" :to="prev.to">
      <span class="muted">← {{ t.project.prevProject }}</span>
      <span class="pnav__title">{{ prev.title }}</span>
    </RouterLink>
    <RouterLink class="btn pnav__all" :to="back">{{ t.project.allProjects }}</RouterLink>
    <RouterLink v-if="next" class="pnav__link pnav__link--next" :to="next.to">
      <span class="muted">{{ t.project.nextProject }} →</span>
      <span class="pnav__title">{{ next.title }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.pnav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  margin-top: var(--space-6);
  padding-top: var(--space-4);
  border-top: 2px dashed var(--border);
}

.pnav__link {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  text-decoration: none;
}

.pnav__link--next {
  text-align: right;
}

.pnav__title {
  font-family: var(--font-display);
  font-size: 1.4rem;
}

.pnav__link:hover .pnav__title {
  color: var(--accent);
  text-shadow: var(--glow-accent);
}
</style>
