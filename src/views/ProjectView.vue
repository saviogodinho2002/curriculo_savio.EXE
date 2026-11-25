<script setup>
// Página de um projeto (/projetos/<slug>/ e /en/projects/<slug>/).
// Só monta as peças: todo o conteúdo vem do campo "pagina" do projeto no JSON do CV,
// e cada bloco aparece só se o campo existir. Para outro sistema ganhar página basta
// preencher "pagina" e pôr os prints em public/projects/<slug>/.
import '../assets/theme.css'
import '../assets/portfolio.css'
import '../assets/motion.css'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import { buildProjectHead } from '../seo/head'
import { LOCALE_PATHS, projectPath } from '../seo/site'
import { splitTitle } from '../utils/parseCv'
import { provideLocale } from '../composables/useLocale'
import TopBar from '../components/TopBar.vue'
import TermWindow from '../components/TermWindow.vue'
import StatusBar from '../components/StatusBar.vue'
import ProjectHeader from '../components/project/ProjectHeader.vue'
import ProjectGallery from '../components/project/ProjectGallery.vue'
import ProjectProse from '../components/project/ProjectProse.vue'
import ProjectBullets from '../components/project/ProjectBullets.vue'
import ProjectStats from '../components/project/ProjectStats.vue'
import ProjectFeatures from '../components/project/ProjectFeatures.vue'
import ProjectStack from '../components/project/ProjectStack.vue'
import ProjectNav from '../components/project/ProjectNav.vue'

const route = useRoute()
const slug = computed(() => route.params.slug)
const { t, cv, locale } = provideLocale(
  computed(() => route.meta.locale ?? 'pt'),
  (l) => projectPath(l, slug.value),
)

// projetos com página, na ordem do JSON (o router já barra slug sem página)
const pages = computed(() => (cv.value.projetos || []).filter((p) => p.slug && p.pagina))
const index = computed(() => pages.value.findIndex((p) => p.slug === slug.value))
const project = computed(() => pages.value[index.value])
const page = computed(() => project.value.pagina)
const name = computed(() => splitTitle(project.value.nome))

const home = computed(() => LOCALE_PATHS[locale.value])
const back = computed(() => ({ path: home.value, hash: '#projetos' }))

const neighbour = (step) => {
  const n = pages.value.length
  if (n < 2) return null
  const p = pages.value[(index.value + step + n) % n]
  return { title: splitTitle(p.nome).title, to: projectPath(locale.value, p.slug) }
}

// ordem das janelas; as que não têm conteúdo no JSON somem
const sections = computed(() =>
  [
    { id: 'telas', comp: ProjectGallery, data: page.value.prints, props: { title: name.value.title } },
    { id: 'visao', comp: ProjectProse, data: page.value.visao },
    { id: 'stack', comp: ProjectStack, data: page.value.stack },
    { id: 'fiz', comp: ProjectBullets, data: page.value.fiz },
    { id: 'resultados', comp: ProjectStats, data: page.value.resultados },
    { id: 'funcionalidades', comp: ProjectFeatures, data: page.value.funcionalidades },
  ].filter((s) => s.data?.length),
)

useHead(computed(() => buildProjectHead(locale.value, cv.value, project.value, name.value)))

const pad = (n) => String(n).padStart(2, '0')
</script>

<template>
  <a class="skip-link" href="#conteudo">{{ t.skip }}</a>

  <TopBar active="projetos" :base="home" />

  <main id="conteudo" class="container">
    <ProjectHeader :slug="slug" :title="name.title" :page="page" :back="back" />

    <div class="sections">
      <TermWindow
        v-for="(s, i) in sections"
        :id="s.id"
        :key="`${slug}-${s.id}`"
        :index="pad(i + 1)"
        :title="t.project.sections[s.id]"
      >
        <component :is="s.comp" :data="s.data" v-bind="s.props" />
      </TermWindow>
    </div>

    <ProjectNav :prev="neighbour(-1)" :next="neighbour(1)" :back="back" />
  </main>

  <StatusBar :file="`${slug}.md`" />
</template>

<style scoped>
.sections {
  display: grid;
  gap: var(--space-6);
}

@media (max-width: 768px) {
  .sections {
    gap: var(--space-5);
  }
}
</style>
