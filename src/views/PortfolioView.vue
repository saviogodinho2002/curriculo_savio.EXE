<script setup>
import '../assets/theme.css'
import '../assets/portfolio.css'
import '../assets/motion.css'
import CrtBoot from '../components/CrtBoot.vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import { buildHead } from '../seo/head'
import { SECTIONS } from '../data/sections'
import { provideLocale } from '../composables/useLocale'
import { useActiveSection } from '../composables/useActiveSection'
import TopBar from '../components/TopBar.vue'
import HeroFetch from '../components/HeroFetch.vue'
import TermWindow from '../components/TermWindow.vue'
import StatusBar from '../components/StatusBar.vue'
import AboutSection from '../components/sections/AboutSection.vue'
import ExperienceSection from '../components/sections/ExperienceSection.vue'
import ProjectsSection from '../components/sections/ProjectsSection.vue'
import SkillsSection from '../components/sections/SkillsSection.vue'
import EducationSection from '../components/sections/EducationSection.vue'
import HackathonsSection from '../components/sections/HackathonsSection.vue'
import ContactSection from '../components/sections/ContactSection.vue'

// id da seção (data/sections.js) -> componente com o conteúdo
const CONTENT = {
  sobre: AboutSection,
  experiencia: ExperienceSection,
  projetos: ProjectsSection,
  skills: SkillsSection,
  formacao: EducationSection,
  hackathons: HackathonsSection,
  contato: ContactSection,
}

// idioma vem da rota ('/' = pt, '/en/' = en) e é repassado a todos os componentes
const route = useRoute()
const { t, cv, locale } = provideLocale(computed(() => route.meta.locale ?? 'pt'))

// <head> do idioma (title, description, canonical, hreflang, Open Graph, JSON-LD),
// gravado no HTML estático pelo vite-ssg
useHead(computed(() => buildHead(locale.value, cv.value)))

const activeId = useActiveSection(['top', ...SECTIONS.map((s) => s.id)])

const pad = (n) => String(n).padStart(2, '0')
</script>

<template>
  <CrtBoot />

  <a class="skip-link" href="#conteudo">{{ t.skip }}</a>

  <TopBar :active="activeId" />

  <main id="conteudo" class="container">
    <HeroFetch :cv="cv" />

    <div class="sections">
      <TermWindow
        v-for="(s, i) in SECTIONS"
        :id="s.id"
        :key="s.id"
        :index="pad(i + 1)"
        :title="t.sections[s.id]"
      >
        <component :is="CONTENT[s.id]" :cv="cv" />
      </TermWindow>
    </div>
  </main>

  <StatusBar />
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
