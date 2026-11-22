import { onMounted, onUnmounted, ref } from 'vue'

// Devolve o id da seção que está cruzando o meio da tela.
// Usado para destacar a janela ativa na TopBar.
export function useActiveSection(ids) {
  const activeId = ref(ids[0] ?? '')
  let observer

  onMounted(() => {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) activeId.value = entry.target.id
        }
      },
      // faixa fina no meio da viewport: só uma seção cruza por vez
      { rootMargin: '-45% 0px -50% 0px' },
    )

    for (const id of ids) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
  })

  onUnmounted(() => observer?.disconnect())

  return activeId
}
