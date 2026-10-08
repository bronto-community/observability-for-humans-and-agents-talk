<script setup lang="ts">
import { ref } from 'vue'
import { useStepTimeline } from '../composables/useStepTimeline'

/**
 * Manual instrumentation: the two questions an engineer gets to answer, then
 * the weight that comes with answering them well.
 *
 * s0  the two decisions, question → action
 * s1  the turn: in reality it's not trivial (an empty engineer's shoulders)
 * s2  four costs drop onto the engineer, one after another
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const root = ref<HTMLElement>()

const DECISIONS = [
  { q: 'Relevant at 3 a.m.?', a: 'instrument it' },
  { q: 'Sensitive?', a: 'redact at the source' },
]
const COSTS = [
  'time to maintain it',
  'OTel domain knowledge',
  'context propagation',
  'consistency across services',
]

useStepTimeline(root, () => props.step, (tl) => {
  DECISIONS.forEach((_, i) => {
    tl.from(`.mc-q-${i}`, { opacity: 0, x: -16, duration: 0.45 })
    tl.from(`.mc-w-${i}`, { scaleX: 0, transformOrigin: '0% 50%', duration: 0.35 })
    tl.from(`.mc-a-${i}`, { opacity: 0, x: -10, duration: 0.4 }, '<0.15')
  })
  tl.addLabel('s0')
  tl.to('.mc-left', { opacity: 0.45, duration: 0.4 })
  tl.from('.mc-turn', { opacity: 0, y: 10, duration: 0.45 }, '<')
  tl.from('.mc-base', { opacity: 0, y: 14, duration: 0.45 }, '<0.1')
  tl.addLabel('s1')
  // blocks are listed top → bottom; the bottom one lands first
  ;[...COSTS.keys()].reverse().forEach((i) => {
    tl.from(`.mc-c-${i}`, { y: -260, opacity: 0, duration: 0.6, ease: 'bounce.out' }, '>-0.25')
  })
  tl.to('.mc-base', { y: 4, duration: 0.15, yoyo: true, repeat: 1 }, '>-0.2')
  tl.addLabel('s2')
})
</script>

<template>
  <div ref="root" class="mc">
    <div class="mc-left">
      <div v-for="(d, i) in DECISIONS" :key="i" class="mc-row">
        <div :class="`card mc-q mc-q-${i}`"><div class="card-title">{{ d.q }}</div></div>
        <svg :class="`mc-w mc-w-${i}`" viewBox="0 0 70 12" width="70" height="12">
          <path class="wire" d="M2 6 H62" />
          <circle class="wire-dot" cx="64" cy="6" r="4" />
        </svg>
        <div :class="`card lime mc-a mc-a-${i}`"><div class="card-title">{{ d.a }}</div></div>
      </div>
    </div>

    <div class="mc-right">
      <div class="mc-turn">The reality: <em>not trivial</em></div>
      <div class="mc-stack">
        <div v-for="(c, i) in COSTS" :key="c" :class="`mc-block mc-c-${i}`">{{ c }}</div>
      </div>
      <div class="mc-base">
        <lucide-user-round class="mc-who" />
        <span>you, the engineer</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mc { width: 880px; margin: 1.4rem auto 0; display: grid; grid-template-columns: 1fr 280px; column-gap: 3rem; align-items: end; }
.mc-left { display: flex; flex-direction: column; gap: 1.6rem; padding-bottom: 3.2rem; }
.mc-row { display: flex; align-items: center; }
.mc-q { width: 220px; padding: 1rem 1rem; }
.mc-a { width: 245px; padding: 1rem 1rem; }
.mc-q .card-title, .mc-a .card-title { font-size: 1.1rem; }
.mc-w { flex-shrink: 0; margin: 0 6px; overflow: visible; }

.mc-right { display: flex; flex-direction: column; align-items: stretch; }
.mc-turn { font-family: var(--grotesk); font-size: 1.5rem; letter-spacing: -0.02em; margin-bottom: 1.1rem; color: var(--o-mist); }
.mc-turn em { font-style: normal; color: var(--o-sun); }
.mc-stack { display: flex; flex-direction: column; gap: 4px; }
.mc-block {
  font-family: var(--mono); font-size: 0.78rem; color: var(--o-forest);
  padding: 0.7rem 0.9rem; border-radius: 4px;
  background: var(--px-mid);
}
.mc-c-0 { background: var(--px-hi); margin: 0 1.6rem; }
.mc-c-1 { background: var(--o-sun); margin: 0 1rem; }
.mc-c-2 { background: var(--px-mid); margin: 0 0.5rem; }
.mc-c-3 { background: var(--px-olive); color: var(--o-mist); }
.mc-base {
  margin-top: 6px; display: flex; align-items: center; justify-content: center; gap: 0.6rem;
  padding: 0.7rem; border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--o-mist) 22%, transparent);
  font-family: var(--mono); font-size: 0.78rem; color: var(--o-dim);
}
.mc-who { color: var(--o-mist); font-size: 1.1rem; }
</style>
