<script setup lang="ts">
import { ref } from 'vue'
import gsap from 'gsap'
import { useStepTimeline } from '../composables/useStepTimeline'

/**
 * The codebase as a mosaic of file tiles.
 *
 * stage 0  the codebase
 *       1  a PR: the diff is four tiles
 *       2  the instrumentation those four tiles touch is all over the grid
 *       3  a background agent sweeps the whole thing and marks gaps and
 *          over-instrumentation the diff could never have shown
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const root = ref<HTMLElement>()

const COLS = 28
const ROWS = 11
const CELL = 26
const GAP = 4
const PITCH = CELL + GAP
const GW = COLS * PITCH - GAP
const GH = ROWS * PITCH - GAP

const key = (c: number, r: number) => r * COLS + c
const DIFF = [[8, 4], [9, 4], [8, 5], [9, 5]].map(([c, r]) => key(c, r))
const SURFACE = [[2, 1], [5, 8], [13, 2], [15, 9], [18, 5], [21, 1], [24, 7], [26, 3], [11, 9], [3, 5]].map(([c, r]) => key(c, r))
const GAPS = [[13, 2], [24, 7], [6, 1], [19, 8], [10, 4 + 2]].map(([c, r]) => key(c, r))
const OVER = [[21, 1], [3, 5], [16, 4], [26, 9]].map(([c, r]) => key(c, r))

const tiles = Array.from({ length: COLS * ROWS }, (_, i) => {
  const c = i % COLS
  const r = Math.floor(i / COLS)
  return {
    i, c, r,
    shade: (c * 5 + r * 3 + ((c * r) % 7)) % 4,
    diff: DIFF.includes(i),
    surf: SURFACE.includes(i),
    gap: GAPS.includes(i),
    over: OVER.includes(i),
  }
})

/** diff centre → each surface tile, as an elbow wire */
const DX = 9 * PITCH - GAP / 2
const DY = 5 * PITCH - GAP / 2
const wires = SURFACE.map((k) => {
  const c = k % COLS
  const r = Math.floor(k / COLS)
  const x = c * PITCH + CELL / 2
  const y = r * PITCH + CELL / 2
  return { d: `M${DX} ${DY} H${x} V${y}`, x, y }
})

const CAPS = [
  'your codebase',
  'a PR shows you the diff',
  'the instrumentation it touches spans the whole codebase',
  'a background agent watches all of it',
]

useStepTimeline(root, () => props.step, (tl) => {
  tl.from('.cs-t', {
    opacity: 0, scale: 0.5, duration: 0.3, ease: 'back.out(2)',
    stagger: { each: 0.0025, from: 'random' },
  })
  tl.from('.cs-cap-0', { opacity: 0, duration: 0.3 }, '-=0.2')
  tl.addLabel('s0')

  // 1 — the diff
  tl.to('.cs-cap-0', { opacity: 0, duration: 0.2 })
  tl.to('.cs-cap-1', { opacity: 1, duration: 0.3 })
  tl.to('.l-diff', { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2.6)', stagger: 0.06 }, '<')
  tl.addLabel('s1')

  // 2 — the surface
  tl.to('.cs-cap-1', { opacity: 0, duration: 0.2 })
  tl.to('.cs-cap-2', { opacity: 1, duration: 0.3 })
  tl.to('.cs-wire', { opacity: 1, duration: 0.5, stagger: 0.05 }, '<')
  tl.to('.l-surf', { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2.6)', stagger: 0.05 }, '<0.15')
  tl.addLabel('s2')

  // 3 — the background agent
  tl.to('.cs-cap-2', { opacity: 0, duration: 0.2 })
  tl.to('.cs-cap-3', { opacity: 1, duration: 0.3 })
  tl.to('.cs-wire', { opacity: 0.35, duration: 0.4 }, '<')
  tl.to('.cs-scan', { opacity: 1, duration: 0.3 }, '<')
  tl.to('.l-gap, .l-over', {
    opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2.6)',
    stagger: (_i: number, el: Element) => Number((el as HTMLElement).dataset.c) * 0.04,
  }, '<0.1')
  tl.to('.cs-legend', { opacity: 1, duration: 0.4 }, '-=0.3')
  tl.addLabel('s3')
}, () => {
  gsap.fromTo('.cs-beam', { x: -40 }, { x: GW, duration: 3.4, ease: 'none', repeat: -1, repeatDelay: 0.3 })
})
</script>

<template>
  <div ref="root" class="cs">
    <div class="cs-caps">
      <div v-for="(c, i) in CAPS" :key="i" class="cs-cap" :class="`cs-cap-${i}`">{{ c }}</div>
    </div>

    <div class="cs-grid" :style="{ width: `${GW}px`, height: `${GH}px` }">
      <span
        v-for="t in tiles" :key="t.i" class="cs-t" :class="`sh${t.shade}`"
        :style="{ left: `${t.c * PITCH}px`, top: `${t.r * PITCH}px` }"
      >
        <i v-if="t.surf" class="l-surf" />
        <i v-if="t.diff" class="l-diff" />
        <i v-if="t.gap" class="l-gap" :data-c="t.c" />
        <i v-if="t.over" class="l-over" :data-c="t.c" />
      </span>

      <svg class="cs-wires" :viewBox="`0 0 ${GW} ${GH}`">
        <g v-for="(w, i) in wires" :key="i" class="cs-wire">
          <path class="wire" :d="w.d" />
        </g>
      </svg>

      <div class="cs-scan"><div class="cs-beam" /></div>
    </div>

    <div class="cs-legend">
      <span><i class="sw gap" />missing telemetry</span>
      <span><i class="sw over" />over-instrumented</span>
    </div>
  </div>
</template>

<style scoped>
.cs { display: flex; flex-direction: column; align-items: center; gap: 1.1rem; }

.cs-caps { position: relative; height: 2.2rem; width: 100%; }
.cs-cap {
  position: absolute; inset: 0; text-align: center;
  font-size: 1.6rem; letter-spacing: -0.02em; opacity: 0;
}
.cs-cap-0 { opacity: 1; }

.cs-grid { position: relative; }
.cs-t { position: absolute; width: 26px; height: 26px; }
.cs-t.sh0 { background: var(--o-muted); }
.cs-t.sh1 { background: var(--px-deep); }
.cs-t.sh2 { background: var(--o-card); }
.cs-t.sh3 { background: color-mix(in srgb, var(--px-shadow) 70%, var(--o-forest)); }

.cs-t i { position: absolute; inset: 0; opacity: 0; transform: scale(0.4); }
.l-diff { background: var(--o-mist); }
.l-surf { background: var(--px-mid); }
.l-gap  { background: var(--o-forest); box-shadow: inset 0 0 0 2.5px var(--o-sun); }
.l-over { background: var(--o-sprout); }

.cs-wires { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
.cs-wire { opacity: 0; }
.cs-wire .wire { stroke: var(--o-mist-tint); stroke-width: 1.3; }

.cs-scan { position: absolute; inset: -6px 0; overflow: hidden; opacity: 0; pointer-events: none; }
.cs-beam {
  position: absolute; top: 0; bottom: 0; left: 0; width: 44px;
  background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--o-sun) 28%, transparent));
  border-right: 2px solid var(--o-sun);
}

.cs-legend {
  display: flex; gap: 2rem; opacity: 0;
  font-family: var(--mono); font-size: 0.72rem; color: var(--fg-dim);
}
.cs-legend span { display: inline-flex; align-items: center; gap: 0.5rem; }
.sw { display: inline-block; width: 14px; height: 14px; }
.sw.gap { box-shadow: inset 0 0 0 2px var(--o-sun); }
.sw.over { background: var(--o-sprout); }
</style>
