<script setup>
import { useTheme } from '../composables/useTheme'

const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <button
    type="button"
    class="btn theme-toggle"
    :aria-label="isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'"
    :title="isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'"
    @click="toggleTheme"
  >
    <span aria-hidden="true">
      <span class="theme-toggle__icon">{{ isDark ? '☾' : '☀' }}</span>
      <span class="theme-toggle__label"> {{ isDark ? 'escuro' : 'claro' }}</span>
    </span>
  </button>
</template>
