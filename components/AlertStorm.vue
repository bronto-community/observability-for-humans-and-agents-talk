<script setup lang="ts">
import { ref } from 'vue'
import gsap from 'gsap'
import { useStepTimeline } from '../composables/useStepTimeline'

/**
 * Alerts get more expensive once agents consume them.
 *
 * stage 0  one alert → one agent investigation
 *       1  an alert storm fans out into dozens of investigations; the token
 *          budget drains while the bill climbs
 *       2  a gate (suppression, triage agent) goes in front, the fan-out
 *          collapses to a few clear signals and the bill drops with it
 *
 * Box 868 × 372 in slide px, SVG in the same coordinates.
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const root = ref<HTMLElement>()

const W = 868
const H = 372
const SRC = { x: 0, y: 140, w: 150, h: 84 }
const OUT = { x: SRC.x + SRC.w, y: SRC.y + SRC.h / 2 }

// the investigation grid
const COLS = 8
const ROWS = 6
const CELL = 36
const NODE = 26
const GX = 410
const GY = OUT.y - (ROWS * CELL) / 2
const NODES = Array.from({ length: COLS * ROWS }, (_, i) => {
  const c = i % COLS
  const r = Math.floor(i / COLS)
  return { i, x: GX + c * CELL, y: GY + r * CELL, cx: GX + c * CELL + NODE / 2, cy: GY + r * CELL + NODE / 2 }
})
// the handful that survive the gate: clear signals
const KEEP = [10, 27, 37]

const ONE = { x: 450, y: OUT.y - 42, w: 210, h: 84 }
const GATE = { x: 232, y: OUT.y - 72, w: 112, h: 144 }

const METER = { x: 760, y: 54, w: 44, h: 230 }
const SPEND = 4800
const GATED = 60

const spent = ref<HTMLElement>()

useStepTimeline(root, () => props.step, (tl) => {
  tl.from('.src', { opacity: 0, x: -12 })
  tl.from('.w-one', { opacity: 0, attr: { x2: OUT.x } , duration: 0.5 }, '>-0.1')
  tl.from('.one', { opacity: 0, x: 12 }, '>-0.1')
  tl.from('.meter, .m-label', { opacity: 0, duration: 0.4 }, '<')
  tl.addLabel('s0')

  // ── the storm
  tl.to('.one, .w-one', { opacity: 0, duration: 0.25 })
  tl.to('.src-one', { opacity: 0, duration: 0.2 }, '<')
  tl.to('.src-many', { opacity: 1, duration: 0.2 }, '>')
  tl.from('.src-stack', { opacity: 0, x: 0, y: 0, stagger: 0.04, duration: 0.25 }, '<')
  tl.from('.fan', { attr: { x2: OUT.x, y2: OUT.y }, opacity: 0, duration: 0.5, stagger: { each: 0.012, from: 'random' } }, '<0.1')
  tl.from('.node', { opacity: 0, scale: 0.3, transformOrigin: '50% 50%', duration: 0.35, ease: 'back.out(2)', stagger: { each: 0.012, from: 'random' } }, '<0.2')
  tl.to('.m-fill', { scaleY: 0, transformOrigin: '50% 100%', duration: 1.6, ease: 'power1.in' }, '<')
  const bill = { v: 0 }
  tl.to(bill, {
    v: SPEND, duration: 1.6, ease: 'power1.in',
    onUpdate: () => { if (spent.value) spent.value.textContent = Math.round(bill.v).toLocaleString('en-US') },
  }, '<')
  tl.from('.drained', { opacity: 0, y: 6, duration: 0.4 }, '>-0.2')
  tl.addLabel('s1')

  // ── the gate
  tl.from('.gate', { opacity: 0, scaleY: 0.6, transformOrigin: '50% 50%', duration: 0.4 })
  tl.from('.gate-chip', { opacity: 0, y: 6, stagger: 0.08, duration: 0.3 }, '>-0.1')
  tl.to('.fan', { opacity: 0, duration: 0.4 }, '<')
  tl.to('.node:not(.keep)', { opacity: 0.12, scale: 0.7, transformOrigin: '50% 50%', duration: 0.5, stagger: { each: 0.006, from: 'random' } }, '<')
  tl.to('.src-stack', { opacity: 0, duration: 0.3 }, '<')
  tl.to('.src-many', { opacity: 0, duration: 0.2 }, '<')
  tl.to('.src-clear', { opacity: 1, duration: 0.3 }, '>')
  tl.from('.w-gate', { opacity: 0, attr: { x2: OUT.x }, duration: 0.3 }, '<')
  tl.from('.w-keep', { attr: { x2: GATE.x + GATE.w, y2: OUT.y }, opacity: 0, duration: 0.45, stagger: 0.08 }, '>')
  tl.to('.n-hi', { opacity: 1, duration: 0.3 }, '<0.1')
  tl.to('.node.keep', { scale: 1.15, transformOrigin: '50% 50%', duration: 0.3, ease: 'back.out(3)' }, '<')
  tl.to('.m-fill', { scaleY: 0.82, duration: 0.8, ease: 'power2.out' }, '<')
  tl.to(bill, {
    v: GATED, duration: 0.8, ease: 'power2.out',
    onUpdate: () => { if (spent.value) spent.value.textContent = Math.round(bill.v).toLocaleString('en-US') },
  }, '<')
  tl.to('.drained', { opacity: 0, duration: 0.25 }, '<')
  tl.from('.gated', { opacity: 0, y: 6, duration: 0.4 }, '>-0.3')
  tl.from('.punch', { opacity: 0, y: 8, duration: 0.6 }, '<0.2')
  tl.addLabel('s2')
}, () => {
  // investigations churn while the storm is on
  gsap.to('.node:not(.keep) .n-spin', { rotation: 360, svgOrigin: '0 0', duration: 2.4, ease: 'none', repeat: -1 })
})
</script>

<template>
  <div ref="root" class="storm" :style="{ width: W + 'px', height: H + 'px' }">
    <svg class="wires" :viewBox="`0 0 ${W} ${H}`" :width="W" :height="H" aria-hidden="true">
      <line class="wire w-one" :x1="OUT.x" :y1="OUT.y" :x2="ONE.x" :y2="OUT.y" />
      <line v-for="n in NODES" :key="'f' + n.i" class="wire fan" :x1="OUT.x" :y1="OUT.y" :x2="n.x" :y2="n.cy" />
      <line class="wire w-gate" :x1="OUT.x" :y1="OUT.y" :x2="GATE.x" :y2="OUT.y" />
      <line v-for="k in KEEP" :key="'k' + k" class="wire w-keep" :x1="GATE.x + GATE.w" :y1="OUT.y" :x2="NODES[k].x" :y2="NODES[k].cy" />
      <circle class="wire-dot" :cx="OUT.x" :cy="OUT.y" r="3.5" />

      <g v-for="n in NODES" :key="'n' + n.i" class="node" :class="{ keep: KEEP.includes(n.i) }"
        :transform="`translate(${n.x} ${n.y})`">
        <rect :width="NODE" :height="NODE" rx="7" class="n-box" />
        <rect v-if="KEEP.includes(n.i)" :width="NODE" :height="NODE" rx="7" class="n-hi" />
        <g :transform="`translate(${NODE / 2} ${NODE / 2})`">
          <path class="n-spin" d="M0 -6 A6 6 0 0 1 6 0" />
        </g>
      </g>
    </svg>

    <!-- source -->
    <div class="src-stack" v-for="k in 3" :key="'st' + k"
      :style="{ left: (SRC.x + k * 6) + 'px', top: (SRC.y - k * 6) + 'px', width: SRC.w + 'px', height: SRC.h + 'px' }" />
    <div class="card amber src" :style="{ left: SRC.x + 'px', top: SRC.y + 'px', width: SRC.w + 'px', height: SRC.h + 'px' }">
      <div class="src-label">
        <span class="src-one"><div class="card-title">Alert</div><div class="card-sub">checkout p99</div></span>
        <span class="src-many"><div class="card-title">Alert storm</div><div class="card-sub">× 240</div></span>
        <span class="src-clear"><div class="card-title">Clear signal</div><div class="card-sub">× 3</div></span>
      </div>
    </div>

    <!-- step 0: a single investigation -->
    <div class="card one" :style="{ left: ONE.x + 'px', top: ONE.y + 'px', width: ONE.w + 'px', height: ONE.h + 'px' }">
      <div class="card-title">Agent investigation</div>
      <div class="card-sub">hypotheses + fixes</div>
    </div>

    <!-- gate -->
    <div class="gate" :style="{ left: GATE.x + 'px', top: GATE.y + 'px', width: GATE.w + 'px', height: GATE.h + 'px' }">
      <span class="gate-chip">suppression</span>
      <span class="gate-chip">triage agent</span>
    </div>

    <!-- token budget -->
    <div class="m-label mono" :style="{ left: (METER.x - 30) + 'px', top: (METER.y - 30) + 'px', width: (METER.w + 60) + 'px' }">token budget</div>
    <div class="meter" :style="{ left: METER.x + 'px', top: METER.y + 'px', width: METER.w + 'px', height: METER.h + 'px' }">
      <div class="m-fill" />
    </div>
    <div class="m-label mono bill" :style="{ left: (METER.x - 40) + 'px', top: (METER.y + METER.h + 12) + 'px', width: (METER.w + 80) + 'px' }">
      $<span ref="spent">0</span>
    </div>
    <div class="drained" :style="{ left: (METER.x - 70) + 'px', top: (METER.y + METER.h + 44) + 'px', width: (METER.w + 140) + 'px' }">
      drained in an afternoon
    </div>
    <div class="gated" :style="{ left: (METER.x - 70) + 'px', top: (METER.y + METER.h + 44) + 'px', width: (METER.w + 140) + 'px' }">
      3 investigations
    </div>

    <p class="punch">Alert on a clear signal.</p>
  </div>
</template>

<style scoped>
.storm { position: relative; margin: 0 auto; }
.wires { position: absolute; inset: 0; overflow: visible; }
.fan { opacity: 0.45; }

.src, .one { position: absolute; display: flex; flex-direction: column; justify-content: center; z-index: 2; }
.src-label { position: relative; height: 2.6rem; }
.src-label > span { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; }
.src-many, .src-clear { opacity: 0; }
.src-stack {
  position: absolute; border-radius: 12px; z-index: 1;
  background: var(--card-amber); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--card-amber-ink) 25%, transparent);
}

.n-box { fill: var(--card-neutral); stroke: color-mix(in srgb, var(--b-ink) 18%, transparent); stroke-width: 1; }
.n-spin { fill: none; stroke: var(--b-brown); stroke-width: 2; stroke-linecap: round; }
.n-hi { fill: var(--card-lime); stroke: var(--card-lime-ink); stroke-width: 1.2; opacity: 0; }

.gate {
  position: absolute; z-index: 2;
  display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 0.5rem;
  border-radius: 12px; background: var(--b-ink);
}
.gate-chip {
  font-family: var(--mono); font-size: 0.66rem; color: var(--b-bg);
  padding: 0.25em 0.6em; border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--b-bg) 35%, transparent);
}

.meter {
  position: absolute; border-radius: 10px; overflow: hidden;
  background: color-mix(in srgb, var(--b-ink) 8%, transparent);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--b-ink) 18%, transparent);
}
.m-fill { position: absolute; inset: 0; background: var(--b-amber); }
.m-label { position: absolute; text-align: center; font-size: 0.72rem; color: var(--b-dim); }
.bill { font-size: 1.15rem; color: var(--b-ink); font-weight: 500; }
.drained, .gated { position: absolute; text-align: center; font-family: var(--mono); font-size: 0.72rem; color: var(--b-brown); }

.slidev-layout .punch {
  position: absolute; left: 0; top: 268px; width: 380px; margin: 0;
  font-family: var(--serif); font-size: 2rem; line-height: 1.1;
  letter-spacing: -0.02em; color: var(--b-ink);
}
</style>
