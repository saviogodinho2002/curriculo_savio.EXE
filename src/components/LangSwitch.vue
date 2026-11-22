<script setup>
// Seletor de idioma no estilo do resto da barra: [pt|en], com o idioma atual invertido.
// São links comuns (<a href>) para a outra URL: rastreáveis pelo Google e sem redirecionar
// pela língua do navegador.
import { LOCALES, LOCALE_PATH, UI } from '../i18n/ui'
import { useLocale } from '../composables/useLocale'

const { locale, t } = useLocale()
</script>

<template>
  <nav class="lang" :aria-label="t.lang.aria">
    <span class="lang__bracket" aria-hidden="true">[</span>
    <template v-for="(l, i) in LOCALES" :key="l">
      <span v-if="i > 0" class="lang__sep" aria-hidden="true">|</span>
      <span v-if="l === locale" class="lang__opt lang__opt--active" aria-current="true">{{ l }}</span>
      <a
        v-else
        class="lang__opt"
        :href="LOCALE_PATH[l]"
        :hreflang="UI[l].htmlLang"
        :lang="UI[l].htmlLang"
        :title="t.lang.switchTo"
      >{{ l }}</a>
    </template>
    <span class="lang__bracket" aria-hidden="true">]</span>
  </nav>
</template>

<style scoped>
.lang {
  display: inline-flex;
  align-items: center;
  font: 500 0.85rem/1.4 var(--font-mono);
  white-space: nowrap;
}

.lang__bracket,
.lang__sep {
  color: var(--muted);
  text-shadow: none;
}

.lang__opt {
  padding: var(--space-1) 0.4ch;
  color: var(--fg);
  text-decoration: none;
  text-shadow: var(--glow);
}

a.lang__opt:hover {
  background: var(--fg);
  color: var(--bg);
  text-shadow: none;
}

.lang__opt--active {
  background: var(--accent);
  color: var(--bg);
  text-shadow: none;
}
</style>
