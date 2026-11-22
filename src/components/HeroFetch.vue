<script setup>
// Hero no formato da saída do neofetch: arte ASCII à esquerda, chave: valor à direita.
import { computed } from 'vue'
import pdf from '../assets/curriculo_savio.pdf'
import { useTheme } from '../composables/useTheme'
// foto em dot art (braille, 100 colunas × 50 linhas), uma versão para cada tema;
// cai para o asciiArt do JSON se faltar
import artLight from '../data/dot-art-light.txt?raw'
import artDark from '../data/dot-art-dark.txt?raw'

const { isDark } = useTheme()
const dotArt = computed(() => (isDark.value ? artDark : artLight).trimEnd())

const props = defineProps({
  cv: { type: Object, required: true },
})

const info = computed(() => {
  const { cv } = props
  return [
    { key: 'cargo', value: cv.titulo },
    { key: 'empresa', value: cv.empresa_atual ?? cv.experiencias?.[0]?.empresa.split(',')[0] },
    { key: 'local', value: cv.contato.localizacao },
    { key: 'formação', value: cv.formacao?.[0]?.curso },
    { key: 'stack', value: cv.habilidades.slice(0, 5).join(' · ') },
    { key: 'email', value: cv.contato.email, href: `mailto:${cv.contato.email}` },
  ].filter((row) => row.value)
})

// blocos de cor do neofetch, usando a paleta do tema atual
const swatches = ['--fg', '--muted', '--accent', '--border', '--surface', '--bg']
</script>

<template>
  <section id="top" class="hero" aria-label="Apresentação">
    <pre class="hero__ascii" aria-hidden="true">{{ dotArt || cv.asciiArt }}</pre>

    <div class="hero__info">
      <!-- animações de entrada (classes hero__cmd / seq + --i) ficam em assets/motion.css -->
      <p class="prompt">
        <span class="prompt__user">savio@godinho:~</span><span class="hero__cmd">neofetch</span>
      </p>

      <h1 class="hero__name seq" style="--i: 0">
        {{ cv.nome }}<span class="cursor" aria-hidden="true"></span>
      </h1>
      <div class="hero__rule seq" style="--i: 1" aria-hidden="true"></div>

      <dl class="kv">
        <template v-for="(row, i) in info" :key="row.key">
          <dt class="seq" :style="{ '--i': i + 2 }">{{ row.key }}</dt>
          <dd class="seq" :style="{ '--i': i + 2 }">
            <a v-if="row.href" :href="row.href">{{ row.value }}</a>
            <template v-else>{{ row.value }}</template>
          </dd>
        </template>
      </dl>

      <div class="hero__swatches seq" :style="{ '--i': info.length + 2 }" aria-hidden="true">
        <span v-for="s in swatches" :key="s" :style="{ background: `var(${s})` }"></span>
      </div>

      <div class="hero__ctas seq" :style="{ '--i': info.length + 3 }">
        <a class="btn btn--accent" :href="pdf" download="curriculo_savio.pdf">↓ baixar cv.pdf</a>
        <a class="btn" :href="cv.contato.github" target="_blank" rel="noopener">github ↗</a>
        <a class="btn" :href="cv.contato.linkedin" target="_blank" rel="noopener">linkedin ↗</a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: var(--space-5);
  min-height: calc(100vh - var(--topbar-h));
  min-height: calc(100svh - var(--topbar-h));
  padding-block: var(--space-5);
}

/* Arte densa (100 colunas): fonte minúscula que escala com a largura da tela.
   overflow: hidden é só uma rede de segurança caso a fonte de braille seja mais larga. */
.hero__ascii {
  max-width: 100%;
  margin: 0;
  overflow: hidden;
  color: var(--fg);
  font-family: var(--font-mono);
  font-size: clamp(3px, 0.55vw, 8px);
  line-height: 1;
  letter-spacing: 0;
  /* glow forte borra os pontos; aqui só um brilho leve */
  text-shadow: 0 0 2px color-mix(in srgb, var(--fg) 40%, transparent);
  user-select: none;
}

/* Claro: pontos finos somem nas faixas do papel; tinta mais escura,
   contorno para engrossar os pontos e fundo liso atrás da arte */
:root[data-theme='light'] .hero__ascii {
  color: #0f2a17;
  background: var(--surface);
  -webkit-text-stroke: 0.35px currentColor;
  text-shadow: none;
}

.hero__info {
  min-width: 0;
}

.hero__name {
  margin-block: var(--space-2) var(--space-3);
  overflow-wrap: anywhere;
}

.hero__rule {
  width: min(100%, 24ch);
  margin-bottom: var(--space-4);
  border-top: 2px dashed var(--border);
}

.hero__swatches {
  display: flex;
  margin-top: var(--space-4);
}

.hero__swatches span {
  width: 2.5ch;
  height: 1.25em;
  border: 1px solid var(--border);
}

.hero__swatches span + span {
  border-left: 0;
}

.hero__ctas {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-4);
}

@media (max-width: 768px) {
  .hero {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-4);
    min-height: 0;
  }

  /* 1 coluna: a arte ocupa a largura do container (100 colunas de braille ≈ 0.6em cada) */
  .hero__ascii {
    font-size: min(8px, calc((100vw - 2rem) / 62));
  }
}
</style>
