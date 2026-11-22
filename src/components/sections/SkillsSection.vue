<script setup>
import { computed } from 'vue'

const props = defineProps({
  cv: { type: Object, required: true },
})

// usa os níveis (principal / trabalho regular / experiência com) se existirem
const groups = computed(() =>
  props.cv.habilidades_grupos?.length
    ? props.cv.habilidades_grupos
    : [{ grupo: 'stack', itens: props.cv.habilidades || [] }],
)
</script>

<template>
  <div class="skills">
    <div>
      <h3 class="subhead">stack</h3>
      <p class="prompt"><span class="prompt__user">~</span>ls -R stack/</p>
      <div v-for="g in groups" :key="g.grupo" class="tier">
        <p class="tier__name">{{ g.grupo }}/</p>
        <div class="chips">
          <span
            v-for="(h, i) in g.itens"
            :key="h"
            class="chip reveal-item"
            :style="{ '--i': i }"
          >{{ h }}</span>
        </div>
      </div>
    </div>

    <div>
      <h3 class="subhead">afinidades</h3>
      <p class="prompt"><span class="prompt__user">~</span>cat afinidades.txt</p>
      <ul class="checklist">
        <li
          v-for="(a, i) in cv.afinidades"
          :key="a"
          class="reveal-item"
          :style="{ '--i': i }"
        >{{ a }}</li>
      </ul>

      <template v-if="cv.idiomas?.length">
        <h3 class="subhead idiomas__head">idiomas</h3>
        <dl class="kv idiomas">
          <template v-for="i in cv.idiomas" :key="i.idioma">
            <dt>{{ i.idioma }}</dt>
            <dd>{{ i.nivel }}</dd>
          </template>
        </dl>
      </template>
    </div>
  </div>
</template>

<style scoped>
.skills {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
  gap: var(--space-5);
}

.subhead + .prompt {
  margin-top: var(--space-2);
}

.tier {
  margin-top: var(--space-3);
}

.tier__name {
  margin-bottom: var(--space-1);
  color: var(--accent);
  font-size: 0.85rem;
  text-shadow: var(--glow-accent);
}

.checklist {
  margin-top: var(--space-3);
}

.checklist li {
  padding-left: 4ch;
  text-indent: -4ch;
}

.checklist li + li {
  margin-top: var(--space-1);
}

.checklist li::before {
  content: '[x] ';
  color: var(--accent);
  text-shadow: var(--glow-accent);
  white-space: pre;
}

.idiomas__head {
  margin-top: var(--space-5);
}

.idiomas {
  margin-top: var(--space-2);
}
</style>
