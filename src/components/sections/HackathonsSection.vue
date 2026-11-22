<script setup>
import { hasLink, linkLabel, splitTitle } from '../../utils/parseCv'

const props = defineProps({
  cv: { type: Object, required: true },
})

// "1º lugar – Hackathon CIAT Santarém" -> colocação em destaque + nome do evento
const awards = (props.cv.hackathons || []).map((h) => {
  const { title, subtitle } = splitTitle(h.nome)
  return {
    key: h.nome,
    rank: subtitle ? title : '',
    event: subtitle || title,
    descricao: h.descricao,
    link: hasLink(h.link) ? h.link : null,
  }
})
</script>

<template>
  <p class="prompt reveal-item" style="--i: 0">
    <span class="prompt__user">~</span>cat premios.log
  </p>

  <ul class="awards">
    <li
      v-for="(a, i) in awards"
      :key="a.key"
      class="award reveal-item"
      :style="{ '--i': i + 1 }"
    >
      <h3 class="award__title">
        <span v-if="a.rank" class="award__rank">{{ a.rank }}</span>
        {{ a.event }}
      </h3>
      <p class="award__desc">{{ a.descricao }}</p>
      <a
        v-if="a.link"
        class="btn btn--accent award__link"
        :href="a.link"
        target="_blank"
        rel="noopener"
      >{{ linkLabel(a.link) }} ↗</a>
    </li>
  </ul>
</template>

<style scoped>
.awards {
  margin-top: var(--space-3);
}

.award {
  position: relative;
  padding-left: 3ch;
}

.award + .award {
  margin-top: var(--space-4);
}

.award::before {
  content: '★';
  position: absolute;
  left: 0;
  top: 0.1rem;
  color: var(--accent);
  text-shadow: var(--glow-accent);
}

.award__title {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--space-1) 1ch;
  color: var(--fg);
  font-size: 1.5rem;
}

.award__rank {
  padding: 0 0.5ch;
  background: var(--accent);
  color: var(--bg);
  text-shadow: none;
}

.award__desc {
  margin-top: var(--space-1);
  max-width: 75ch;
  font-size: 0.95rem;
}

.award__link {
  margin-top: var(--space-2);
}
</style>
