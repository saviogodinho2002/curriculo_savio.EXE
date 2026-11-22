<script setup>
// Barra superior fixa no estilo da status bar do tmux:
// [sessão]  0:~ 1:sobre* 2:experiência ...        [tema] [↓ cv.pdf]
import { SECTIONS } from '../data/sections'
import ThemeToggle from './ThemeToggle.vue'
import pdf from '../assets/curriculo_savio.pdf'

defineProps({
  active: { type: String, default: 'top' },
})

const windows = [{ id: 'top', label: '~' }, ...SECTIONS]
</script>

<template>
  <header class="topbar">
    <a href="#top" class="topbar__session kbd-inv" aria-label="Ir para o início">
      [savio<span class="topbar__wide">@godinho</span>]
    </a>

    <nav class="topbar__nav" aria-label="Seções">
      <a
        v-for="(w, i) in windows"
        :key="w.id"
        :href="`#${w.id}`"
        class="topbar__win"
        :class="{ 'topbar__win--active': active === w.id }"
        :aria-current="active === w.id ? 'location' : undefined"
      >{{ i }}:{{ w.label }}</a>
    </nav>

    <div class="topbar__actions">
      <ThemeToggle />
      <a class="btn btn--accent" :href="pdf" download="curriculo_savio.pdf">
        ↓ <span class="topbar__wide">cv.</span>pdf
      </a>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 900; /* abaixo dos overlays CRT (1000) */
  display: flex;
  align-items: center;
  gap: var(--space-3);
  height: var(--topbar-h);
  padding-inline: var(--space-3);
  background: var(--surface);
  border-bottom: 3px double var(--border);
  font-size: 0.9rem;
}

.topbar__session {
  flex-shrink: 0;
  padding: 0.1rem 0.5ch;
  font-weight: 700;
  text-decoration: none;
}

.topbar__nav {
  flex: 1;
  min-width: 0;
  display: flex;
  gap: 0.5ch;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--border) transparent;
}

.topbar__win {
  flex-shrink: 0;
  padding: 0.1rem 0.5ch;
  color: var(--fg);
  text-shadow: var(--glow);
  text-decoration: none;
  white-space: pre;
}

/* marcador de janela do tmux: espaço reservado, "*" na ativa */
.topbar__win::after {
  content: ' ';
}

.topbar__win:hover {
  color: var(--accent);
  text-shadow: var(--glow-accent);
}

.topbar__win--active,
.topbar__win--active:hover {
  background: var(--accent);
  color: var(--bg);
  text-shadow: none;
}

.topbar__win--active::after {
  content: '*';
}

.topbar__actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.topbar__actions .btn {
  font-size: 0.85rem;
}

@media (max-width: 480px) {
  .topbar {
    gap: var(--space-2);
    padding-inline: var(--space-2);
  }

  .topbar__wide,
  .topbar__actions :deep(.theme-toggle__label) {
    display: none;
  }
}
</style>
