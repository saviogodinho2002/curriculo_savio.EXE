<script setup>
import { RouterView } from 'vue-router'
// Vercel Web Analytics (sem cookies): conta visitas e páginas vistas em todas as rotas.
// Vercel Speed Insights: mede o desempenho real (Core Web Vitals: LCP, CLS, INP).
// Os dois só enviam dados no site publicado na Vercel; em dev não fazem nada.
import { Analytics } from '@vercel/analytics/vue'
import { SpeedInsights } from '@vercel/speed-insights/vue'
</script>

<template>
  <RouterView />
  <Analytics />
  <SpeedInsights />
</template>
