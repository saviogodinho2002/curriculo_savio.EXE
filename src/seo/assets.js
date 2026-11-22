// Arquivos em public/ com URL fixa (sem hash), citados pelo site, pelo <head> e pelo llms.txt.
export const PDF_PATHS = {
  pt: '/cv/savio-godinho-curriculo.pdf',
  en: '/cv/savio-godinho-resume.pdf',
}

export const PDF_NAMES = {
  pt: 'savio-godinho-curriculo.pdf',
  en: 'savio-godinho-resume.pdf',
}

// imagens de compartilhamento (1200×630), geradas por scripts/og/build-og.mjs
export const OG_IMAGES = {
  pt: { path: '/og/og-pt.png', alt: 'Sávio Godinho — Engenheiro de Software' },
  en: { path: '/og/og-en.png', alt: 'Sávio Godinho — Software Engineer' },
}
export const OG_SIZE = { width: 1200, height: 630 }

// versão Markdown de cada página (para agentes de IA)
export const MD_PATHS = { pt: '/index.md', en: '/en/index.md' }
