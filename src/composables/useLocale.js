import { computed, inject, provide } from 'vue'
import { LOCALE_PATH, UI } from '../i18n/ui'
import cvPt from '../data/curriculum.json'
import cvEn from '../data/curriculum.en.json'
import pdfPt from '../assets/curriculo_savio.pdf'

// PDF por idioma. Enquanto não existir o PDF em inglês, a versão EN usa o PT.
const PDF = { pt: pdfPt, en: pdfPt }
const CV = { pt: cvPt, en: cvEn }

const KEY = Symbol('locale')

/**
 * Chamado uma vez pela página (PortfolioView) com o idioma da rota.
 * Os componentes filhos usam useLocale() para ler textos, CV e PDF do idioma atual.
 */
export function provideLocale(localeRef) {
  const ctx = {
    locale: localeRef,
    t: computed(() => UI[localeRef.value]),
    cv: computed(() => CV[localeRef.value]),
    pdf: computed(() => PDF[localeRef.value]),
    pdfName: computed(() => (localeRef.value === 'en' ? 'cv_savio_godinho_en.pdf' : 'curriculo_savio.pdf')),
    altLocale: computed(() => (localeRef.value === 'pt' ? 'en' : 'pt')),
    altPath: computed(() => LOCALE_PATH[localeRef.value === 'pt' ? 'en' : 'pt']),
  }
  provide(KEY, ctx)
  return ctx
}

export function useLocale() {
  const ctx = inject(KEY, null)
  if (!ctx) throw new Error('useLocale() precisa de provideLocale() num componente acima')
  return ctx
}
