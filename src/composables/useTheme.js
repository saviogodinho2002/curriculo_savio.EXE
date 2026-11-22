import { computed, onMounted, ref } from 'vue'

// Estado compartilhado do tema (nível de módulo = singleton).
// Padrão: escuro. O tema real é aplicado no <html> pelo script inline do index.html
// ANTES da primeira pintura; aqui o estado começa em 'dark' (igual ao HTML pré-renderizado,
// para a hidratação não divergir) e é sincronizado com o <html> quando o componente monta.
const STORAGE_KEY = 'theme'
const theme = ref('dark')
let synced = false

function apply(t) {
  document.documentElement.dataset.theme = t
  theme.value = t
}

export function useTheme() {
  const isDark = computed(() => theme.value === 'dark')

  onMounted(() => {
    if (synced) return
    synced = true
    theme.value = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
  })

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
