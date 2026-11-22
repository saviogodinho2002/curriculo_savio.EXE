<script setup>
import { useTheme } from '../composables/useTheme'
import { useLocale } from '../composables/useLocale'

const { isDark, toggleTheme } = useTheme()
const { t } = useLocale()
</script>

<template>
  <button
    type="button"
    class="btn theme-toggle"
    :aria-label="isDark ? t.theme.toLight : t.theme.toDark"
    :title="isDark ? t.theme.toLight : t.theme.toDark"
    @click="toggleTheme"
  >
    <span aria-hidden="true">
      <span class="theme-toggle__icon">{{ isDark ? '☾' : '☀' }}</span>
      <span class="theme-toggle__label"> {{ isDark ? t.theme.dark : t.theme.light }}</span>
    </span>
  </button>
</template>
