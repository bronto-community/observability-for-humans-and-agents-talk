<script setup lang="ts">
import { ref } from 'vue'
import gsap from 'gsap'
import { useStepTimeline } from '../composables/useStepTimeline'

/**
 * Build → Instrument → Operate on one dotted wire. Each click hangs an agent
 * under the next stage. Packets drift along the wire as ambient.
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const root = ref<HTMLElement>()

const STAGES = [
  { x: 110, title: 'Build', sub: 'write the code', agent: 'coding agent' },
  { x: 410, title: 'Instrument', sub: 'emit telemetry', agent: 'instrumentation agent' },
  { x: 710, title: 'Operate', sub: 'handle incidents', agent: 'AI SRE' },
]

useStepTimeline(root, () => props.step, (tl) => {
  tl.from('.ae-stage', { opacity: 0, y: 14, stagger: 0.12 })
  tl.from('.ae-main', { opacity: 0, duration: 0.4 }, '<0.1')
  tl.addLabel('s0')
  STAGES.forEach((_, i) => {
    tl.from(`.ae-drop-${i}`, { scaleY: 0, transformOrigin: '50% 0%', opacity: 0, duration: 0.35 })
    tl.from(`.ae-agent-${i}`, { opacity: 0, y: -10, scale: 0.85, duration: 0.45, ease: 'back.out(2)' }, '<0.15')
    tl.from(`.ae-stage-${i} .ae-ring`, { opacity: 0, scale: 1.08, duration: 0.3 }, '<')
    tl.addLabel(`s${i + 1}`)
  })
}, () => {
  gsap.utils.toArray<SVGCircleElement>('.ae-packet').forEach((p, i) => {
    gsap.fromTo(p, { attr: { cx: 110 } }, { attr: { cx: 710 }, duration: 4.5, ease: 'none', repeat: -1, delay: i * 1.5 })
  })
})
</script>

<template>
  <div ref="root" class="ae">
    <svg class="ae-svg" viewBox="0 0 820 300">
      <g class="ae-main">
        <path class="wire" d="M110 75 H710" />
        <circle v-for="s in STAGES" :key="s.x" class="wire-dot" :cx="s.x" cy="75" r="4" />
        <circle v-for="k in 3" :key="k" class="ae-packet" cx="110" cy="75" r="3.5" />
      </g>
      <g v-for="(s, i) in STAGES" :key="i">
        <path :class="`wire ae-drop-${i}`" :d="`M${s.x} 118 V196`" />
      </g>
    </svg>

    <div v-for="(s, i) in STAGES" :key="i" :class="`card ae-stage ae-stage-${i}`" :style="{ left: s.x - 105 + 'px' }">
      <div class="ae-ring" />
      <div class="card-title">{{ s.title }}</div>
      <div class="card-sub">{{ s.sub }}</div>
    </div>

    <div v-for="(s, i) in STAGES" :key="'a' + i" :class="`ae-agent ae-agent-${i}`" :style="{ left: s.x - 115 + 'px' }">
      <lucide-bot class="ae-bot" />
      <span>{{ s.agent }}</span>
    </div>
  </div>
</template>

<style scoped>
.ae { position: relative; width: 820px; height: 300px; margin: 2.2rem auto 0; }
.ae-svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.ae-packet { fill: var(--b-amber); }
.ae-stage {
  position: absolute; top: 34px; width: 210px; height: 84px;
  display: flex; flex-direction: column; justify-content: center;
  background: var(--b-bg);
}
.ae-ring { position: absolute; inset: -1px; border-radius: 12px; border: 2px solid var(--b-amber); pointer-events: none; }
.ae-stage .card-title { font-size: 1.3rem; }
.ae-agent {
  position: absolute; top: 196px; width: 230px; white-space: nowrap;
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  padding: 0.55rem 0.8rem; border-radius: 999px;
  background: var(--b-ink); color: var(--b-bg);
  font-family: var(--mono); font-size: 0.72rem;
}
.ae-bot { color: var(--b-amber); font-size: 1.05rem; flex-shrink: 0; }
</style>
