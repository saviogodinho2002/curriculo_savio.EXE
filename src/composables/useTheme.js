import { computed, ref } from 'vue'

// Estado compartilhado do tema (nível de módulo = singleton).
// O valor inicial já foi aplicado no <html> pelo script inline do index.html.
// Padrão: escuro (não segue o tema do sistema); o claro só vale se escolhido no botão.
const STORAGE_KEY = 'theme'
const root = document.documentElement

function apply(t) {
  root.dataset.theme = t
  theme.value = t
}

const theme = ref(root.dataset.theme || 'dark')

export function useTheme() {
  const isDark = computed(() => theme.value === 'dark')

  function setTheme(t) {
    apply(t)
    try {
      localStorage.setItem(STORAGE_KEY, t)
    } catch {
      // storage indisponível (aba privada etc.): tema vale só nesta sessão
    }
  }

  function toggleTheme() {
    setTheme(isDark.value ? 'light' : 'dark')
  }

  return { theme, isDark, setTheme, toggleTheme }
}
