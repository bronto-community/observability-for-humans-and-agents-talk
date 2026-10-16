<script setup lang="ts">
import { ref, useId } from 'vue'
import { useStepTimeline } from '../composables/useStepTimeline'

/**
 * The blog's "How we use agents for instrumentation at OllyGarden" figure,
 * redrawn on the forest canvas. Both kinds of instrumentation feed one trunk;
 * each click draws a branch to the next place an agent sits in the SDLC.
 *
 * stage 0  sources (auto + manual) and their wires
 *       1  local development       agent step
 *       2  PR review               human checkpoint
 *       3  background agent        agent step
 *       4  autonomous PRs          agent step, plus the optional loop back to
 *                                  the background agent
 *       5  human review            human checkpoint
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const root = ref<HTMLElement>()
/** mask ids must be unique: presenter view renders the slide twice */
const uid = `sp${useId()?.replace(/[^\w-]/g, '')}`

/* geometry, in the component's own 860 × 392 box */
const W = 860
const H = 392
const SRC = { x: 0, w: 250, h: 64 }
const SOURCES = [
  { title: 'Auto-instrumentation', sub: 'high volume · low signal', cy: 146 },
  { title: 'Manual instrumentation', sub: 'adds business context', cy: 246 },
]
const JX = 290        // where the two sources join
const TX = 330        // trunk
const JY = 196        // junction height (background agent row)
const ST = { x: 362, w: 318, h: 60 }
const STAGES = [
  { title: 'Local development', sub: 'coding agents with skills', human: false },
  { title: 'PR review', sub: 'agent flags blind spots', human: true },
  { title: 'Background agent', sub: 'watches the whole codebase', human: false },
  { title: 'Autonomous PRs', sub: 'agent proposes fixes', human: false },
  { title: 'Human review', sub: 'always approved before merge', human: true },
].map((s, i) => ({ ...s, cy: 36 + i * 80 }))

const srcPaths = SOURCES.map(s => `M${SRC.w} ${s.cy} H${JX} V${JY}`)
const srcLen = SOURCES.map(s => (JX - SRC.w) + Math.abs(JY - s.cy))
const joinPath = `M${JX} ${JY} H${TX}`
const stagePaths = STAGES.map(s => `M${TX} ${JY} V${s.cy} H${ST.x}`)
const stageLen = STAGES.map(s => Math.abs(s.cy - JY) + (ST.x - TX))

// optional loop on the right: background agent ⇄ autonomous PRs
const RX = ST.x + 8 + ST.w   // right edge of the stage cards
const [BG, PR] = [STAGES[2].cy, STAGES[3].cy]
const loopDown = `M${RX} ${BG - 8} H${RX + 34} V${PR - 8} H${RX + 8}`
const loopUp = `M${RX} ${PR + 8} H${RX + 58} V${BG - 18} H${RX + 8}`

const pct = (v: number, of: number) => `${(v / of) * 100}%`

useStepTimeline(root, () => props.step, (tl) => {
  tl.from('.sp-src', { opacity: 0, x: -14, stagger: 0.1, duration: 0.5 })
  SOURCES.forEach((_, i) => {
    tl.fromTo(`.sp-m-src-${i}`, { strokeDashoffset: srcLen[i] }, { strokeDashoffset: 0, duration: 0.45, ease: 'none' }, i ? '<' : '-=0.15')
  })
  tl.fromTo('.sp-m-join', { strokeDashoffset: TX - JX }, { strokeDashoffset: 0, duration: 0.2, ease: 'none' })
  tl.from('.sp-dot-src', { scale: 0, transformOrigin: '50% 50%', duration: 0.25, stagger: 0.05 }, '<')
  tl.from('.sp-legend', { opacity: 0, duration: 0.4 })
  tl.addLabel('s0')

  STAGES.forEach((_, i) => {
    tl.fromTo(`.sp-m-st-${i}`, { strokeDashoffset: stageLen[i] }, { strokeDashoffset: 0, duration: 0.4, ease: 'power1.inOut' })
    tl.fromTo(`.sp-dot-st-${i}`, { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.2, ease: 'back.out(3)' }, '-=0.05')
    tl.fromTo(`.sp-st-${i}`, { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 0.4 }, '-=0.1')
    if (i === 3) tl.fromTo('.sp-loop', { opacity: 0 }, { opacity: 1, duration: 0.4 })
    tl.addLabel(`s${i + 1}`)
  })
})
</script>

<template>
  <div ref="root" class="sp" :style="{ aspectRatio: `${W} / ${H}` }">
    <svg class="sp-wires" :viewBox="`0 0 ${W} ${H}`">
      <defs>
        <mask v-for="(d, i) in srcPaths" :id="`${uid}-src-${i}`" :key="`ms${i}`" maskUnits="userSpaceOnUse">
          <path :class="`sp-m-src-${i}`" :d="d" class="sp-m" :stroke-dasharray="srcLen[i]" />
        </mask>
        <mask :id="`${uid}-join`" maskUnits="userSpaceOnUse">
          <path class="sp-m sp-m-join" :d="joinPath" :stroke-dasharray="TX - JX" />
        </mask>
        <mask v-for="(d, i) in stagePaths" :id="`${uid}-st-${i}`" :key="`mt${i}`" maskUnits="userSpaceOnUse">
          <path :class="`sp-m-st-${i}`" :d="d" class="sp-m" :stroke-dasharray="stageLen[i]" />
        </mask>
      </defs>

      <path v-for="(d, i) in srcPaths" :key="`s${i}`" class="wire" :d="d" :mask="`url(#${uid}-src-${i})`" />
      <path class="wire" :d="joinPath" :mask="`url(#${uid}-join)`" />
      <path v-for="(d, i) in stagePaths" :key="`t${i}`" class="wire" :d="d" :mask="`url(#${uid}-st-${i})`" />

      <marker :id="`${uid}-arrow`" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="7" markerHeight="7" orient="auto">
        <path d="M0 0 L8 4 L0 8 z" class="wire-dot" />
      </marker>
      <g class="sp-loop">
        <path class="wire" :d="loopDown" :marker-end="`url(#${uid}-arrow)`" />
        <path class="wire" :d="loopUp" :marker-end="`url(#${uid}-arrow)`" />
        <text class="sp-loop-label" :x="RX + 70" :y="(BG + PR) / 2 - 4">optional</text>
        <text class="sp-loop-label" :x="RX + 70" :y="(BG + PR) / 2 + 10">loop</text>
      </g>

      <circle v-for="(s, i) in SOURCES" :key="`ds${i}`" class="wire-dot sp-dot-src" :cx="SRC.w" :cy="s.cy" r="4.5" />
      <circle v-for="(s, i) in STAGES" :key="`dt${i}`" class="wire-dot" :class="`sp-dot-st-${i}`" :cx="ST.x" :cy="s.cy" r="4.5" />
    </svg>

    <div
      v-for="(s, i) in SOURCES" :key="`src${i}`" class="card amber sp-card sp-src"
      :style="{ left: pct(SRC.x, W), top: pct(s.cy - SRC.h / 2, H), width: pct(SRC.w, W), height: pct(SRC.h, H) }"
    >
      <div class="card-title">{{ s.title }}</div>
      <div class="card-sub">{{ s.sub }}</div>
    </div>

    <div
      v-for="(s, i) in STAGES" :key="`st${i}`" class="card sp-card" :class="[`sp-st-${i}`, { lime: s.human }]"
      :style="{ left: pct(ST.x + 8, W), top: pct(s.cy - ST.h / 2, H), width: pct(ST.w, W), height: pct(ST.h, H) }"
    >
      <div class="card-title">{{ s.title }}</div>
      <div class="card-sub">{{ s.sub }}</div>
    </div>

    <div class="sp-legend">
      <div><span class="sw lime" />human checkpoint</div>
      <div><span class="sw" />automated agent step</div>
    </div>
  </div>
</template>

<style scoped>
.sp { position: relative; width: 860px; max-width: 100%; margin: 0.5rem auto 0; }
.sp-wires { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.sp-m { fill: none; stroke: #fff; stroke-width: 8; }
.sp-loop { opacity: 0; }
.sp-loop-label { font-family: var(--mono); font-size: 10.5px; fill: var(--fg-dim); }

.sp-card {
  position: absolute; box-sizing: border-box;
  display: flex; flex-direction: column; justify-content: center;
  padding: 0.4rem 0.8rem;
}
.sp-card .card-title { font-size: 1.02rem; }
/* stages start hidden; the timeline brings them in */
.sp-card[class*='sp-st-'] { opacity: 0; }

.sp-legend {
  position: absolute; right: 0; bottom: 4px;
  display: flex; flex-direction: column; gap: 0.45rem;
  font-family: var(--mono); font-size: 0.66rem; color: var(--fg-dim);
}
.sp-legend div { display: flex; align-items: center; gap: 0.5rem; }
.sw {
  width: 14px; height: 14px; border-radius: 4px; background: var(--card-bg);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--o-mist) 22%, transparent);
}
.sw.lime { background: var(--card-lime-bg); box-shadow: inset 0 0 0 1px var(--o-sun); }
</style>
