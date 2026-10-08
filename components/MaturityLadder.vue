<script setup lang="ts">
import { ref } from 'vue'
import { useStepTimeline } from '../composables/useStepTimeline'

/**
 * The analysis maturity path, redrawn from the blog's second figure.
 *
 * stage 0  manual investigation
 *       1  + chat interface
 *       2  + skills
 *       3  + agentic workflow
 *       4  the bus converges into the two inputs (alerts, tools & data) and
 *          from there into investigation quality: inputs beat models
 *
 * Box is 868 × 460 in slide px; the SVG shares its coordinates so wires line
 * up with the absolutely positioned cards.
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const root = ref<HTMLElement>()

const W = 868
const H = 460
const CARD_W = 196
const CARD_H = 72
const GAP = (W - 4 * CARD_W) / 3
const BUS = 108

const LEVELS = [
  { t: 'Manual investigation', s: 'Logs and traces by hand' },
  { t: 'Chat interface', s: 'Ask via MCP or CLI' },
  { t: 'Skills', s: 'Reusable instructions' },
  { t: 'Agentic workflow', s: 'Alerts trigger an agent' },
].map((l, i) => ({ ...l, x: i * (CARD_W + GAP), cx: i * (CARD_W + GAP) + CARD_W / 2 }))

const AMBER_W = 300
const AMBER_Y = 172
const AMBER_H = 72
const INPUTS = [
  { t: 'Alerts', s: 'Clear signal or expensive noise', cx: 260 },
  { t: 'Tools and data', s: 'Instrumentation and backend fidelity', cx: W - 260 },
]
const LIME_W = 330
const LIME_Y = 300
const LIME_H = 72
const MID = W / 2
const SPLIT = 142
const JOIN = 274

useStepTimeline(root, () => props.step, (tl) => {
  tl.from('.lv-0', { opacity: 0, y: 14 })
  tl.from('.drop-0', { opacity: 0, attr: { y2: CARD_H } }, '<0.2')
  tl.from('.drop-dot-0', { opacity: 0, duration: 0.2 }, '<')
  tl.addLabel('s0')

  for (let i = 1; i < 4; i++) {
    tl.from(`.bus-${i}`, { opacity: 0, attr: { x2: LEVELS[i - 1].cx }, duration: 0.5, ease: 'power1.inOut' })
    tl.from(`.drop-${i}`, { opacity: 0, attr: { y2: CARD_H }, duration: 0.3 }, '>-0.05')
    tl.from(`.lv-${i}`, { opacity: 0, y: 14 }, '<')
    tl.from(`.drop-dot-${i}`, { opacity: 0, duration: 0.2 }, '<')
    tl.addLabel(`s${i}`)
  }

  // converge
  tl.from('.c-stem', { opacity: 0, attr: { y2: BUS }, duration: 0.3 })
  tl.from('.c-split-l', { opacity: 0, attr: { x2: MID }, duration: 0.35 })
  tl.from('.c-split-r', { opacity: 0, attr: { x2: MID }, duration: 0.35 }, '<')
  tl.from('.c-down', { opacity: 0, attr: { y2: SPLIT }, duration: 0.25 })
  tl.from('.in', { opacity: 0, y: 12, stagger: 0.08 }, '>-0.05')
  tl.from('.c-up', { opacity: 0, attr: { y2: AMBER_Y + AMBER_H }, duration: 0.25 })
  tl.from('.c-join-l', { opacity: 0, attr: { x2: INPUTS[0].cx }, duration: 0.3 })
  tl.from('.c-join-r', { opacity: 0, attr: { x2: INPUTS[1].cx }, duration: 0.3 }, '<')
  tl.from('.c-last', { opacity: 0, attr: { y2: JOIN }, duration: 0.2 })
  tl.from('.quality', { opacity: 0, y: 12 }, '>-0.05')
  tl.from('.c-dot', { opacity: 0, scale: 0, transformOrigin: '50% 50%', stagger: 0.03, duration: 0.25 }, '<')
  tl.from('.punch', { opacity: 0, y: 10, duration: 0.7 }, '>0.1')
  tl.addLabel('s4')
})
</script>

<template>
  <div ref="root" class="ladder" :style="{ width: W + 'px', height: H + 'px' }">
    <svg class="wires" :viewBox="`0 0 ${W} ${H}`" :width="W" :height="H" aria-hidden="true">
      <!-- maturity bus -->
      <line v-for="(l, i) in LEVELS" :key="'d' + i" :class="['wire', `drop-${i}`]"
        :x1="l.cx" :y1="CARD_H" :x2="l.cx" :y2="BUS" />
      <line v-for="i in 3" :key="'b' + i" :class="['wire', `bus-${i}`]"
        :x1="LEVELS[i - 1].cx" :y1="BUS" :x2="LEVELS[i].cx" :y2="BUS" />
      <circle v-for="(l, i) in LEVELS" :key="'dt' + i" class="wire-dot" :class="`drop-dot-${i}`" :cx="l.cx" :cy="CARD_H" r="3.5" />

      <!-- converge into the inputs -->
      <line class="wire c-stem" :x1="MID" :y1="BUS" :x2="MID" :y2="SPLIT" />
      <line class="wire c-split-l" :x1="MID" :y1="SPLIT" :x2="INPUTS[0].cx" :y2="SPLIT" />
      <line class="wire c-split-r" :x1="MID" :y1="SPLIT" :x2="INPUTS[1].cx" :y2="SPLIT" />
      <line v-for="(c, i) in INPUTS" :key="'cd' + i" class="wire c-down" :x1="c.cx" :y1="SPLIT" :x2="c.cx" :y2="AMBER_Y" />
      <line v-for="(c, i) in INPUTS" :key="'cu' + i" class="wire c-up" :x1="c.cx" :y1="AMBER_Y + AMBER_H" :x2="c.cx" :y2="JOIN" />
      <line class="wire c-join-l" :x1="INPUTS[0].cx" :y1="JOIN" :x2="MID" :y2="JOIN" />
      <line class="wire c-join-r" :x1="INPUTS[1].cx" :y1="JOIN" :x2="MID" :y2="JOIN" />
      <line class="wire c-last" :x1="MID" :y1="JOIN" :x2="MID" :y2="LIME_Y" />
      <circle v-for="(c, i) in INPUTS" :key="'ct' + i" class="wire-dot c-dot" :cx="c.cx" :cy="AMBER_Y" r="3.5" />
      <circle v-for="(c, i) in INPUTS" :key="'cb' + i" class="wire-dot c-dot" :cx="c.cx" :cy="AMBER_Y + AMBER_H" r="3.5" />
      <circle class="wire-dot c-dot" :cx="MID" :cy="LIME_Y" r="3.5" />
    </svg>

    <div v-for="(l, i) in LEVELS" :key="i" :class="['card', 'lv', `lv-${i}`]"
      :style="{ left: l.x + 'px', top: 0, width: CARD_W + 'px', height: CARD_H + 'px' }">
      <div class="card-title">{{ l.t }}</div>
      <div class="card-sub">{{ l.s }}</div>
    </div>

    <div v-for="(c, i) in INPUTS" :key="'in' + i" class="card amber in"
      :style="{ left: (c.cx - AMBER_W / 2) + 'px', top: AMBER_Y + 'px', width: AMBER_W + 'px', height: AMBER_H + 'px' }">
      <div class="card-title">{{ c.t }}</div>
      <div class="card-sub">{{ c.s }}</div>
    </div>

    <div class="card lime quality"
      :style="{ left: (MID - LIME_W / 2) + 'px', top: LIME_Y + 'px', width: LIME_W + 'px', height: LIME_H + 'px' }">
      <div class="card-title">Investigation quality</div>
      <div class="card-sub">Thin evidence, confident wrong guess</div>
    </div>

    <p class="punch">Inputs beat models.</p>
  </div>
</template>

<style scoped>
.ladder { position: relative; margin: 0 auto; }
.wires { position: absolute; inset: 0; overflow: visible; }
.lv, .in, .quality {
  position: absolute; display: flex; flex-direction: column; justify-content: center;
}
.lv .card-title { font-size: 1rem; }
.slidev-layout .punch {
  position: absolute; left: 0; right: 0; top: 396px; margin: 0;
  text-align: center; font-family: var(--serif); font-size: 2.3rem;
  letter-spacing: -0.02em; color: var(--b-ink); line-height: 1.1;
}
</style>
