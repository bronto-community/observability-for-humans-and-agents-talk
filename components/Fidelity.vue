<script setup lang="ts">
import { ref } from 'vue'
import { useStepTimeline } from '../composables/useStepTimeline'

/**
 * Where the two halves meet: the OllyGarden half (instrumentation) feeds the
 * Bronto half (backend), and the agent can only read what reaches it.
 *
 * stage 0  instrumentation → backend → agent
 *       1  the answer exists: one event, the needle, is in the data
 *       2  the backend keeps a 1% sample and the rest needs rehydrating;
 *          the needle is gone
 *       3  the agent answers anyway: confident, well formatted, wrong
 *
 * Box 868 × 388 in slide px.
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const root = ref<HTMLElement>()

const W = 868
const H = 388
const PANEL = { w: 360, h: 196 }
const LEFT = { x: 0, y: 0 }
const RIGHT = { x: W - PANEL.w, y: 0 }

const COLS = 12
const ROWS = 5
const CELL = 24
const NEEDLE = 2 * COLS + 8
// the survivors of a 1% sample (rounded up, so a couple of dots stay)
const SAMPLED = [5, 40]
const EVENTS = Array.from({ length: COLS * ROWS }, (_, i) => ({ i, c: i % COLS, r: Math.floor(i / COLS) }))

const AGENT = { w: 150, h: 58, x: W / 2 - 75, y: 252 }

const CAPTIONS = [
  '',
  'Instrumentation decides whether the answer exists.',
  'Your backend decides whether the agent can reach it.',
  'Thin evidence, confident answer.',
]

useStepTimeline(root, () => props.step, (tl) => {
  tl.from('.p-olly', { opacity: 0, x: -14 })
  tl.from('.p-bronto', { opacity: 0, x: 14 }, '<')
  tl.from('.w-flow', { opacity: 0, attr: { x2: PANEL.w }, duration: 0.5 }, '>-0.2')
  tl.from('.w-ask', { opacity: 0, attr: { y2: PANEL.h }, duration: 0.3 })
  tl.from('.w-ask2', { opacity: 0, attr: { x2: RIGHT.x + PANEL.w / 2 }, duration: 0.3 })
  tl.from('.agent', { opacity: 0, y: 10 }, '>-0.1')
  tl.addLabel('s0')

  // 1 — the needle exists, on both sides
  tl.to('.ev-olly.needle', { fill: 'var(--o-sun)', scale: 1.5, transformOrigin: '50% 50%', duration: 0.4, ease: 'back.out(3)' })
  tl.to('.ev-bronto.needle', { fill: 'var(--b-amber)', scale: 1.5, transformOrigin: '50% 50%', duration: 0.4, ease: 'back.out(3)' }, '<0.15')
  tl.from('.ring', { opacity: 0, scale: 0.4, transformOrigin: '50% 50%', duration: 0.5 }, '<')
  tl.to('.cap-0', { opacity: 0, duration: 0.2 }, '<')
  tl.to('.cap-1', { opacity: 1, duration: 0.4 }, '<')
  tl.addLabel('s1')

  // 2 — the backend keeps 1%; the rest is cold
  tl.to('.ev-bronto:not(.kept)', { opacity: 0.08, scale: 0.6, transformOrigin: '50% 50%', duration: 0.5, stagger: { each: 0.008, from: 'random' } })
  tl.to('.ring-bronto', { opacity: 0, duration: 0.3 }, '<0.3')
  tl.from('.b-tag', { opacity: 0, y: 6, stagger: 0.12, duration: 0.35 }, '<0.2')
  tl.to('.w-ask, .w-ask2', { opacity: 0.3, duration: 0.4 }, '<')
  tl.to('.cap-1', { opacity: 0, duration: 0.2 }, '<')
  tl.to('.cap-2', { opacity: 1, duration: 0.4 }, '<')
  tl.addLabel('s2')

  // 3 — the agent answers anyway
  tl.from('.hyp', { opacity: 0, scale: 0.85, x: -40, transformOrigin: '0% 50%', duration: 0.5, ease: 'back.out(1.6)' })
  tl.from('.w-hyp', { opacity: 0, attr: { x2: AGENT.x }, duration: 0.3 }, '<')
  tl.from('.stamp', { opacity: 0, scale: 2.4, rotation: -20, transformOrigin: '50% 50%', duration: 0.35, ease: 'power4.in' }, '>0.35')
  tl.to('.hyp', { x: 3, duration: 0.05, yoyo: true, repeat: 3 }, '>')
  tl.to('.cap-2', { opacity: 0, duration: 0.2 }, '<')
  tl.to('.cap-3', { opacity: 1, duration: 0.4 }, '<')
  tl.addLabel('s3')
}, undefined)
</script>

<template>
  <div ref="root" class="fid" :style="{ width: W + 'px', height: H + 'px' }">
    <svg class="wires" :viewBox="`0 0 ${W} ${H}`" :width="W" :height="H" aria-hidden="true">
      <line class="wire w-flow" :x1="PANEL.w" :y1="PANEL.h / 2" :x2="RIGHT.x" :y2="PANEL.h / 2" />
      <circle class="wire-dot" :cx="RIGHT.x" :cy="PANEL.h / 2" r="3.5" />
      <!-- the agent reads from the backend -->
      <line class="wire w-ask" :x1="RIGHT.x + PANEL.w / 2" :y1="PANEL.h" :x2="RIGHT.x + PANEL.w / 2" :y2="AGENT.y + AGENT.h / 2" />
      <line class="wire w-ask2" :x1="RIGHT.x + PANEL.w / 2" :y1="AGENT.y + AGENT.h / 2" :x2="AGENT.x + AGENT.w" :y2="AGENT.y + AGENT.h / 2" />
      <!-- and answers to the left -->
      <line class="wire w-hyp" :x1="AGENT.x" :y1="AGENT.y + AGENT.h / 2" :x2="338" :y2="AGENT.y + AGENT.h / 2" />
    </svg>

    <!-- OllyGarden half -->
    <div class="panel p-olly" :style="{ left: LEFT.x + 'px', top: LEFT.y + 'px', width: PANEL.w + 'px', height: PANEL.h + 'px' }">
      <div class="p-head"><img src="/img/ollygarden-mark.svg" alt="" /><span>instrumentation</span></div>
      <svg :viewBox="`0 0 ${COLS * CELL} ${ROWS * CELL}`" :width="COLS * CELL" :height="ROWS * CELL" class="grid">
        <rect v-for="e in EVENTS" :key="e.i" class="ev ev-olly" :class="{ needle: e.i === NEEDLE }"
          :x="e.c * CELL + 4" :y="e.r * CELL + 4" :width="CELL - 8" :height="CELL - 8" />
        <circle class="ring" :cx="(NEEDLE % COLS) * CELL + CELL / 2" :cy="Math.floor(NEEDLE / COLS) * CELL + CELL / 2" r="15" />
      </svg>
    </div>

    <!-- Bronto half -->
    <div class="panel p-bronto" :style="{ left: RIGHT.x + 'px', top: RIGHT.y + 'px', width: PANEL.w + 'px', height: PANEL.h + 'px' }">
      <div class="p-head"><img src="/img/bronto-dino.png" alt="" /><span>backend</span>
        <span class="b-tag">1% sample</span><span class="b-tag">rest: rehydrating…</span>
      </div>
      <svg :viewBox="`0 0 ${COLS * CELL} ${ROWS * CELL}`" :width="COLS * CELL" :height="ROWS * CELL" class="grid">
        <circle v-for="e in EVENTS" :key="e.i" class="ev ev-bronto"
          :class="{ needle: e.i === NEEDLE, kept: SAMPLED.includes(e.i) }"
          :cx="e.c * CELL + CELL / 2" :cy="e.r * CELL + CELL / 2" r="7" />
        <circle class="ring ring-bronto" :cx="(NEEDLE % COLS) * CELL + CELL / 2" :cy="Math.floor(NEEDLE / COLS) * CELL + CELL / 2" r="15" />
      </svg>
    </div>

    <!-- the agent -->
    <div class="card agent" :style="{ left: AGENT.x + 'px', top: AGENT.y + 'px', width: AGENT.w + 'px', height: AGENT.h + 'px' }">
      <div class="card-title">Agent</div>
      <div class="card-sub">investigating</div>
    </div>

    <!-- its answer -->
    <div class="hyp">
      <div class="h-head mono"><span>Root cause</span><span>confidence 0.94</span></div>
      <div class="h-body">Connection pool exhaustion in <code>payments-db</code> after deploy <code>4f2a</code>.</div>
      <div class="stamp">wrong</div>
    </div>

    <div class="caps">
      <p v-for="(c, i) in CAPTIONS" :key="i" :class="['cap', `cap-${i}`]">{{ c }}</p>
    </div>
  </div>
</template>

<style scoped>
.fid { position: relative; margin: 0 auto; }
.wires { position: absolute; inset: 0; overflow: visible; }

.panel {
  position: absolute; border-radius: 16px; padding: 0.8rem 1rem;
  display: flex; flex-direction: column; justify-content: space-between; align-items: center;
}
.p-head { align-self: stretch; display: flex; align-items: center; gap: 0.5rem; font-size: 0.95rem; }
.p-head img { height: 18px; }
.grid { overflow: visible; }

/* OllyGarden half: forest canvas, pixels */
.p-olly { background: var(--o-forest); color: var(--o-mist); font-family: var(--grotesk); }
.ev-olly { fill: var(--px-olive); }
.ev-olly:nth-child(3n) { fill: var(--px-shadow); }
.ev-olly:nth-child(5n + 1) { fill: var(--px-mid); }
.p-olly .ring { stroke: var(--o-sun); }

/* Bronto half: white surface, serif, amber */
.p-bronto {
  background: #fff; color: var(--b-ink);
  box-shadow: inset 0 0 0 1px var(--b-hair), 0 6px 18px rgba(40, 30, 10, 0.06);
}
.p-bronto .p-head span:first-of-type { font-family: var(--serif); font-size: 1.1rem; }
.ev-bronto { fill: color-mix(in srgb, var(--b-brown) 55%, var(--b-bg)); }
.p-bronto .ring { stroke: var(--b-amber); }
.b-tag {
  font-family: var(--mono); font-size: 0.62rem; color: var(--b-brown);
  padding: 0.15em 0.55em; border-radius: 999px; background: var(--card-amber);
}
.b-tag:first-of-type { margin-left: auto; }

.ring { fill: none; stroke-width: 2; }

.agent { position: absolute; display: flex; flex-direction: column; justify-content: center; }

.hyp {
  position: absolute; left: 0; top: 230px; width: 338px;
  background: #fff; border-radius: 12px; padding: 0.7rem 0.9rem;
  box-shadow: inset 0 0 0 1px var(--b-hair), 0 8px 22px rgba(40, 30, 10, 0.1);
}
.h-head { display: flex; justify-content: space-between; font-size: 0.66rem; color: var(--b-dim); text-transform: uppercase; letter-spacing: 0.06em; }
.h-body { margin-top: 0.35rem; font-size: 0.95rem; line-height: 1.35; color: var(--b-ink); }
.h-body code { font-size: 0.85em; background: var(--b-bg); padding: 0 0.3em; border-radius: 4px; }
.stamp {
  position: absolute; right: -18px; bottom: -12px; transform: rotate(-8deg);
  font-family: var(--mono); font-weight: 700; font-size: 1.05rem; letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--wrong); border: 2.5px solid var(--wrong); border-radius: 8px;
  padding: 0.05em 0.5em; background: color-mix(in srgb, #fff 85%, transparent);
}

.caps { position: absolute; left: 0; right: 0; top: 346px; height: 40px; }
.slidev-layout .cap {
  position: absolute; inset: 0; margin: 0; text-align: center; opacity: 0;
  font-family: var(--serif); font-size: 1.55rem; letter-spacing: -0.015em; color: var(--b-ink); line-height: 1.2;
}
.slidev-layout .cap-0 { opacity: 1; }
</style>
