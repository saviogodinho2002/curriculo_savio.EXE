<script setup>
// Rodapé no estilo da modeline do vim + linha de comando com o easter egg :matrix.
import { useLocale } from '../composables/useLocale'

const { t } = useLocale()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="statusbar">
    <div class="statusbar__mode">
      <div class="statusbar__left">
        <span class="kbd-inv statusbar__badge">NORMAL</span>
        <span>portfolio.vue</span>
      </div>
      <div class="statusbar__right muted">
        <span>utf-8</span>
        <span aria-hidden="true">│</span>
        <span>{{ t.htmlLang }}</span>
        <span aria-hidden="true">│</span>
        <span>© {{ year }} Sávio Godinho</span>
      </div>
    </div>

    <div class="statusbar__cmd">
      <!-- link comum (recarrega a página) para o CSS do jogo não se misturar com o do portfólio -->
      <a href="/matrix" title="?">:matrix</a>
      <a href="#top">{{ t.status.top }}</a>
    </div>
  </footer>
</template>

<style scoped>
.statusbar {
  margin-top: var(--space-6);
  font-size: 0.9rem;
}

.statusbar__mode {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-1) var(--space-3);
  padding: var(--space-1) var(--space-3);
  background: var(--surface);
  border-top: 3px double var(--border);
}

.statusbar__left,
.statusbar__right {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-1) 1ch;
}

.statusbar__badge {
  padding: 0 1ch;
  font-weight: 700;
}

.statusbar__cmd {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3) var(--space-4);
}

.statusbar__cmd a {
  text-decoration: none;
}

.statusbar__cmd a:hover {
  text-decoration: underline dashed;
}
</style>
