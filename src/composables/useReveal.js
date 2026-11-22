import { onMounted, onUnmounted, ref } from 'vue'

// Revela um elemento uma única vez, quando o topo dele passa de ~85% da altura da tela.
// Um IntersectionObserver compartilhado atende todos os elementos.
// Sem html.motion-ok (sem JS / "reduzir movimento"), já nasce revelado.

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
  const motionOk = document.documentElement.classList.contains('motion-ok')
  const revealed = ref(!motionOk)

  onMounted(() => {
    const el = elRef.value?.$el ?? elRef.value
    if (revealed.value || !el) {
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
