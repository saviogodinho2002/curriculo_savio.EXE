import { onMounted, onUnmounted, ref } from 'vue'

// Revela um elemento uma única vez, quando o topo dele passa de ~85% da altura da tela.
// Um IntersectionObserver compartilhado atende todos os elementos.
// Começa sempre "não revelado" (igual ao HTML pré-renderizado, sem divergir na hidratação).
// O CSS só esconde sob html.motion-ok, então sem JS tudo aparece. Sem motion-ok
// ("reduzir movimento"), vira revelado assim que monta.

const callbacks = new Map()
let observer

function getObserver() {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          callbacks.get(entry.target)?.()
          callbacks.delete(entry.target)
          observer.unobserve(entry.target)
        }
      },
      // threshold 0 + margem inferior: funciona até para seções mais altas que a tela
      { threshold: 0, rootMargin: '0px 0px -15% 0px' },
    )
  }
  return observer
}

export function useReveal(elRef) {
  const revealed = ref(false)

  onMounted(() => {
    const el = elRef.value?.$el ?? elRef.value
    const motionOk = document.documentElement.classList.contains('motion-ok')
    if (!motionOk || !el || typeof IntersectionObserver === 'undefined') {
      revealed.value = true
      return
    }
    callbacks.set(el, () => (revealed.value = true))
    getObserver().observe(el)
  })

  onUnmounted(() => {
    const el = elRef.value?.$el ?? elRef.value
    if (el && callbacks.has(el)) {
      callbacks.delete(el)
      observer?.unobserve(el)
    }
  })

  return revealed
}
