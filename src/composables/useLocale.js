import { computed, inject, provide } from 'vue'
import { LOCALE_PATH, UI } from '../i18n/ui'
import cvPt from '../data/curriculum.json'
import cvEn from '../data/curriculum.en.json'
import { PDF_NAMES, PDF_PATHS } from '../seo/assets'

const CV = { pt: cvPt, en: cvEn }

const KEY = Symbol('locale')

/**
 * Chamado uma vez pela página (PortfolioView, ProjectView) com o idioma da rota.
 * Os componentes filhos usam useLocale() para ler textos, CV e PDF do idioma atual.
 * pathFor(locale) dá o endereço desta mesma página em cada idioma (seletor pt|en).
 */
export function provideLocale(localeRef, pathFor = (l) => LOCALE_PATH[l]) {
  const ctx = {
    locale: localeRef,
    t: computed(() => UI[localeRef.value]),
    cv: computed(() => CV[localeRef.value]),
    // PDFs ficam em public/cv/ (URL fixa, sem hash)
    pdf: computed(() => PDF_PATHS[localeRef.value]),
    pdfName: computed(() => PDF_NAMES[localeRef.value]),
    altLocale: computed(() => (localeRef.value === 'pt' ? 'en' : 'pt')),
    altPath: computed(() => pathFor(localeRef.value === 'pt' ? 'en' : 'pt')),
    pathFor,
  }
  provide(KEY, ctx)
  return ctx
}

export function useLocale() {
  const ctx = inject(KEY, null)
  if (!ctx) throw new Error('useLocale() precisa de provideLocale() num componente acima')
  return ctx
}
