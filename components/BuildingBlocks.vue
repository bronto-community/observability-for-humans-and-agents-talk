<script setup lang="ts">
import { ref } from 'vue'
import { useStepTimeline } from '../composables/useStepTimeline'

/**
 * The SRE job changes shape: from doing the tasks to orchestrating the agents
 * that do them, and upgrading the blocks underneath, one at a time.
 *
 * stage 0  you, doing every task yourself
 *       1  you move up and orchestrate; agents pick up the tasks
 *       2  the building blocks underneath light up: that's where the work is
 *
 * The blocks are drawn as the cover art's white keycap tiles.
 * Box 868 × 345 in slide px.
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const root = ref<HTMLElement>()

const W = 868
const H = 345
const TILE_W = 150
const TILE_H = 92
const GAP = (W - 5 * TILE_W) / 4
const TILE_Y = 236
const CHIP_W = 132
const CHIP_H = 38
const CHIP_Y = 140

const BLOCKS = [
  { t: 'Instrumentation', s: 'OpenTelemetry', logo: '/img/ollygarden-mark.svg', task: 'instrument' },
  { t: 'Alerts', s: 'clear signal', task: 'triage' },
  { t: 'Data & backend', s: 'full fidelity', logo: '/img/bronto-dino.png', task: 'investigate' },
  { t: 'Skills', s: 'your context', task: 'write runbook' },
  { t: 'Agent', s: 'tools + MCP', task: 'review fix' },
].map((b, i) => ({ ...b, x: i * (TILE_W + GAP), cx: i * (TILE_W + GAP) + TILE_W / 2 }))

const ME_DOING = { x: BLOCKS[0].cx, y: 92 }
const ME_UP = { x: W / 2, y: 62 }
const BUS = 92

useStepTimeline(root, () => props.step, (tl) => {
  tl.from('.tile', { opacity: 0, y: 18, stagger: 0.06, duration: 0.45, ease: 'back.out(1.6)' })
  tl.from('.chip-t', { opacity: 0, y: 8, stagger: 0.05, duration: 0.3 }, '<0.2')
  tl.from('.stem', { opacity: 0, attr: { y2: CHIP_Y + CHIP_H }, stagger: 0.04, duration: 0.25 }, '<0.1')
  tl.from('.me', { opacity: 0, scale: 0.6, transformOrigin: '50% 100%', duration: 0.4 }, '>-0.1')
  // you, hopping from task to task
  tl.to('.me', { x: BLOCKS[4].cx - ME_DOING.x, duration: 1.2, ease: 'steps(4)' })
  tl.to('.me', { x: 0, duration: 0.5, ease: 'power2.inOut' })
  tl.addLabel('s0')

  // 1 — you orchestrate, agents do the tasks
  tl.to('.me', { x: ME_UP.x - ME_DOING.x, y: ME_UP.y - ME_DOING.y, duration: 0.6, ease: 'power2.inOut' })
  tl.to('.me-doing', { opacity: 0, duration: 0.2 }, '<')
  tl.to('.me-orch', { opacity: 1, duration: 0.3 }, '>-0.1')
  tl.from('.bus', { opacity: 0, attr: { x1: ME_UP.x, x2: ME_UP.x }, duration: 0.4 }, '<')
  tl.from('.drop', { opacity: 0, attr: { y2: BUS }, stagger: 0.04, duration: 0.25 }, '>-0.05')
  tl.from('.agent', { opacity: 0, scale: 0.2, transformOrigin: '50% 50%', stagger: 0.06, duration: 0.35, ease: 'back.out(2.5)' }, '<0.1')
  tl.addLabel('s1')

  // 2 — the blocks are where the work is
  tl.from('.glow', { opacity: 0, scale: 0.92, transformOrigin: '50% 50%', stagger: 0.06, duration: 0.3 })
  tl.addLabel('s2')
})
</script>

<template>
  <div ref="root" class="blocks" :style="{ width: W + 'px', height: H + 'px' }">
    <svg class="wires" :viewBox="`0 0 ${W} ${H}`" :width="W" :height="H" aria-hidden="true">
      <!-- the workflow stands on the blocks -->
      <line v-for="b in BLOCKS" :key="'s' + b.t" class="wire stem" :x1="b.cx" :y1="CHIP_Y + CHIP_H" :x2="b.cx" :y2="TILE_Y" />
      <!-- orchestration -->
      <line class="wire bus" :x1="BLOCKS[0].cx" :y1="BUS" :x2="BLOCKS[4].cx" :y2="BUS" />
      <line v-for="b in BLOCKS" :key="'d' + b.t" class="wire drop" :x1="b.cx" :y1="BUS" :x2="b.cx" :y2="CHIP_Y" />
    </svg>

    <!-- tasks -->
    <div v-for="(b, i) in BLOCKS" :key="'c' + i" class="chip-t"
      :style="{ left: (b.cx - CHIP_W / 2) + 'px', top: CHIP_Y + 'px', width: CHIP_W + 'px', height: CHIP_H + 'px' }">
      <span class="agent">✦</span>{{ b.task }}
    </div>

    <!-- you -->
    <div class="me" :style="{ left: (ME_DOING.x - 40) + 'px', top: (ME_DOING.y - 62) + 'px' }">
      <svg width="80" height="50" viewBox="0 0 80 50" aria-hidden="true">
        <circle cx="40" cy="14" r="10" />
        <path d="M22 48 C22 32 30 27 40 27 C50 27 58 32 58 48 Z" />
      </svg>
      <div class="me-label mono">
        <span class="me-doing">you, doing it all</span>
        <span class="me-orch">you, orchestrating</span>
      </div>
    </div>

    <!-- the building blocks -->
    <div v-for="(b, i) in BLOCKS" :key="'t' + i" class="tile"
      :style="{ left: b.x + 'px', top: TILE_Y + 'px', width: TILE_W + 'px', height: TILE_H + 'px' }">
      <div class="glow" />
      <div class="tile-face">
        <img v-if="b.logo" :src="b.logo" alt="" class="t-logo" />
        <div class="t-title">{{ b.t }}</div>
        <div class="t-sub mono">{{ b.s }}</div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.blocks { position: relative; margin: 0 auto; }
.wires { position: absolute; inset: 0; overflow: visible; }

.chip-t {
  position: absolute; display: flex; align-items: center; justify-content: center; gap: 0.4rem;
  border-radius: 999px; background: var(--card-neutral);
  font-family: var(--mono); font-size: 0.72rem; color: var(--b-ink);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--b-ink) 14%, transparent);
}
.agent {
  position: absolute; left: -8px; top: 50%; margin-top: -11px;
  box-shadow: 0 0 0 2px var(--j-bg);
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px; border-radius: 7px; font-size: 0.7rem;
  background: var(--b-amber); color: var(--b-ink);
}

.me { position: absolute; width: 80px; display: flex; flex-direction: column; align-items: center; z-index: 3; }
.me svg { fill: var(--b-ink); }
.me-label { position: relative; width: 180px; height: 1.1rem; font-size: 0.7rem; color: var(--b-ink); text-align: center; }
.me-label span { position: absolute; inset: 0; white-space: nowrap; }
.me-orch { opacity: 0; }

.tile { position: absolute; }
.tile-face {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.15rem;
  background: #fff; border: 2.5px solid var(--b-ink); border-radius: 16px;
  box-shadow: 0 6px 0 var(--b-ink);
}
.glow { position: absolute; inset: -5px -5px -11px; border-radius: 20px; background: var(--b-amber); opacity: 0.7; }
.t-logo { height: 22px; margin-bottom: 0.15rem; }
.t-title { font-weight: 600; font-size: 0.98rem; color: var(--b-ink); }
.t-sub { font-size: 0.64rem; color: var(--b-dim); }
</style>
