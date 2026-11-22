<script setup>
// Card em forma de janela de terminal: borda dupla com o título embutido
// na linha de cima (╡ 01. titulo ╞) e controles decorativos à direita.
// Ao entrar na tela pela 1ª vez a janela "abre" e o título decodifica (ver assets/motion.css).
import { ref } from 'vue'
import { useReveal } from '../composables/useReveal'
import ScrambleText from './ScrambleText.vue'

const root = ref(null)
const revealed = useReveal(root)

defineProps({
  title: { type: String, required: true },
  index: { type: String, default: '' },
  tag: { type: String, default: 'section' },
  level: { type: Number, default: 2 },
  id: { type: String, default: undefined },
})
</script>

<template>
  <component :is="tag" :id="id" ref="root" class="tw reveal" :class="{ 'is-revealed': revealed }">
    <header class="tw__bar">
      <component :is="`h${level}`" class="tw__title">
        <span class="tw__edge" aria-hidden="true">╡</span>
        <span v-if="index" class="tw__index">{{ index }}.</span>
        <ScrambleText :text="title" :active="revealed" />
        <span class="tw__edge" aria-hidden="true">╞</span>
      </component>
      <span class="tw__ctrl" aria-hidden="true">[_][□][×]</span>
    </header>

    <div class="tw__body">
      <slot />
    </div>

    <footer v-if="$slots.actions" class="tw__actions">
      <slot name="actions" />
    </footer>
  </component>
</template>

<style scoped>
.tw {
  position: relative;
  margin-top: 1.1rem; /* espaço para o título que sobe na borda */
  padding: var(--space-5) var(--space-4) var(--space-4);
  border: 3px double var(--border);
  background: var(--surface);
  transition: border-color 0.2s ease;
}

.tw:hover {
  border-color: var(--accent);
}

.tw__bar {
  position: absolute;
  top: 0;
  left: var(--space-3);
  right: var(--space-3);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  transform: translateY(-55%);
  pointer-events: none;
}

.tw__title,
.tw__ctrl {
  padding-inline: var(--space-1);
  background: var(--bg);
  line-height: 1;
}

.tw__title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--accent);
  font-size: clamp(1.4rem, 3.5vw, 1.75rem);
  text-shadow: var(--glow-accent);
}

.tw__edge {
  color: var(--border);
  text-shadow: none;
}

.tw:hover .tw__edge {
  color: var(--accent);
}

.tw__index {
  color: var(--muted);
  text-shadow: none;
}

.tw__ctrl {
  flex-shrink: 0;
  color: var(--muted);
  font-size: 0.8rem;
  text-shadow: none;
}

.tw__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-4);
  padding-top: var(--space-3);
  border-top: 1px dashed var(--border);
}

@media (max-width: 480px) {
  .tw {
    padding: var(--space-4) var(--space-3) var(--space-3);
  }

  .tw__ctrl {
    display: none;
  }
}
</style>
