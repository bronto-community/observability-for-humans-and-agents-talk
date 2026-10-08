<script setup lang="ts">
import { ref } from 'vue'
import gsap from 'gsap'
import { useStepTimeline } from '../composables/useStepTimeline'

/**
 * What the study found agents have learned to instrument, as three pixel meters.
 *
 * stage 0  three empty meters
 *       1  exceptions: fills, ✓
 *       2  network calls: fills, ✓
 *       3  business context: a few tiles, flickering, "?" — and the line that
 *          says whose job it still is
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const root = ref<HTMLElement>()

const N = 14
const ROWS = [
  { name: 'exceptions', sub: 'recorded errors · span status', fill: N },
  { name: 'network calls', sub: 'http · rpc · db clients', fill: N },
  { name: 'business context', sub: 'which customer · plan · flag', fill: 5 },
]

useStepTimeline(root, () => props.step, (tl) => {
  tl.from('.wk-row', { opacity: 0, y: 14, stagger: 0.08, duration: 0.5 })
  tl.addLabel('s0')

  ROWS.forEach((r, i) => {
    const tiles = `.wk-row-${i} .wk-tile:nth-child(-n+${r.fill}) i`
    tl.to(tiles, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2.4)', stagger: 0.035 })
    tl.to(`.wk-row-${i} .wk-name`, { opacity: 1, duration: 0.3 }, '<')
    tl.to(`.wk-row-${i} .wk-mark`, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(3)' }, '-=0.1')
    if (i === 2) tl.to('.wk-owner', { opacity: 1, y: 0, duration: 0.5 }, '+=0.1')
    tl.addLabel(`s${i + 1}`)
  })
}, () => {
  // the business-context tiles never settle
  gsap.utils.toArray<HTMLElement>('.wk-row-2 .wk-tile b').forEach((el, k) => {
    gsap.to(el, {
      opacity: 0.25, duration: 0.18 + (k % 3) * 0.11, ease: 'steps(1)',
      repeat: -1, yoyo: true, repeatDelay: 0.4 + ((k * 7) % 5) * 0.23,
    })
  })
})
</script>

<template>
  <div ref="root" class="wk">
    <div v-for="(r, i) in ROWS" :key="i" class="wk-row" :class="`wk-row-${i}`">
      <div class="wk-label">
        <div class="wk-name">{{ r.name }}</div>
        <div class="wk-sub">{{ r.sub }}</div>
      </div>
      <div class="wk-meter">
        <span v-for="k in N" :key="k" class="wk-tile" :class="{ unsure: i === 2 }"><i><b /></i></span>
      </div>
      <div class="wk-mark" :class="{ q: i === 2 }">{{ i === 2 ? '?' : '✓' }}</div>
    </div>
    <div class="wk-owner">Deciding what matters is still (mostly) <em>on you</em>.</div>
  </div>
</template>

<style scoped>
.wk { display: flex; flex-direction: column; gap: 1.5rem; margin-top: 1.6rem; }
.wk-row { display: grid; grid-template-columns: 14rem 1fr 3rem; align-items: center; gap: 1.4rem; }
.wk-name { font-size: 1.45rem; font-weight: 500; letter-spacing: -0.02em; opacity: 0.55; }
.wk-sub { font-family: var(--mono); font-size: 0.68rem; color: var(--fg-dim); margin-top: 0.15rem; }

.wk-meter { display: flex; gap: 5px; }
.wk-tile {
  position: relative; width: 30px; height: 30px; flex: none;
  outline: 1px dashed color-mix(in srgb, var(--o-mist) 22%, transparent); outline-offset: -1px;
}
.wk-tile i {
  position: absolute; inset: 0;
  opacity: 0; transform: scale(0.4);
}
/* <i> is the timeline's (reveal), <b> is the ambient flicker's */
.wk-tile b { position: absolute; inset: 0; background: var(--px-mid); }
.wk-tile:nth-child(odd) b { background: var(--px-olive); }
.wk-tile.unsure b { background: var(--o-sun); }
.wk-tile.unsure:nth-child(odd) b { background: var(--px-hi); }

.wk-mark {
  width: 2.4rem; height: 2.4rem; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.3rem; font-weight: 600;
  background: var(--o-muted); color: var(--px-hi);
  opacity: 0; transform: scale(0.5);
}
.wk-mark.q { background: var(--o-sun); color: var(--o-forest); }

.wk-owner { font-size: 1.5rem; letter-spacing: -0.02em; margin-top: 0.6rem; opacity: 0; transform: translateY(10px); }
</style>
