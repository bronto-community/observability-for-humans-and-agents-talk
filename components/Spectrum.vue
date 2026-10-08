<script setup lang="ts">
import { ref } from 'vue'
import { useStepTimeline } from '../composables/useStepTimeline'

/**
 * Where are you? A track of pixel tiles that thickens from "no model in the
 * loop" to "agents everywhere". Click 1: a marker slides in to the middle.
 * Click 2: the question the talk answers.
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const root = ref<HTMLElement>()

const N = 24
const SHADES = ['--px-hi', '--px-mid', '--px-olive', '--px-shadow', '--px-deep']
const tiles = Array.from({ length: N }, (_, i) => {
  const t = i / (N - 1)
  return {
    color: `var(${SHADES[Math.min(SHADES.length - 1, Math.floor(t * SHADES.length))]})`,
    // sparse on the left, solid on the right
    opacity: 0.18 + 0.82 * t,
    scale: 0.45 + 0.55 * t,
  }
})

useStepTimeline(root, () => props.step, (tl) => {
  tl.from('.sp-tile', { opacity: 0, scale: 0, stagger: 0.02, duration: 0.35, ease: 'back.out(2)' })
  tl.from('.sp-end', { opacity: 0, y: 10, stagger: 0.15 }, '<0.2')
  tl.addLabel('s0')
  tl.fromTo('.sp-marker', { left: '0%', opacity: 0 }, { left: '50%', opacity: 1, duration: 1.1, ease: 'power3.inOut' })
  tl.addLabel('s1')
  tl.from('.sp-q', { opacity: 0, y: 16, duration: 0.6 })
  tl.addLabel('s2')
})
</script>

<template>
  <div ref="root" class="sp">
    <div class="sp-track">
      <div class="sp-tiles">
        <span
          v-for="(t, i) in tiles" :key="i" class="sp-tile"
          :style="{ background: t.color, opacity: t.opacity, transform: `scale(${t.scale})` }"
        />
      </div>
      <div class="sp-marker">
        <div class="sp-pin">somewhere in between</div>
        <div class="sp-stem" />
        <div class="sp-dot" />
      </div>
    </div>
    <div class="sp-ends">
      <div class="sp-end">No model<br>in the loop</div>
      <div class="sp-end right">Agents across<br>the whole SDLC</div>
    </div>
    <p class="sp-q">What's next worth handing to an agent,<br>and what's a <em>hype trap</em>?</p>
  </div>
</template>

<style scoped>
.sp { width: 860px; margin: 0 auto; }
.sp-track { position: relative; padding-top: 70px; }
.sp-tiles { display: flex; justify-content: space-between; }
.sp-tile { width: 30px; height: 30px; display: block; }
.sp-marker {
  position: absolute; top: 0; left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center;
}
.sp-pin {
  white-space: nowrap; padding: 0.35rem 0.9rem; border-radius: 999px;
  background: var(--b-ink); color: var(--b-bg);
  font-family: var(--mono); font-size: 0.75rem;
}
.sp-stem { width: 0; height: 26px; border-left: 2px dotted var(--wire); }
.sp-dot { width: 14px; height: 14px; border-radius: 50%; background: var(--b-amber); box-shadow: 0 0 0 4px var(--j-bg); margin-top: -2px; }
.sp-ends { display: flex; justify-content: space-between; margin-top: 1.1rem; }
.sp-end { font-family: var(--serif); font-size: 1.45rem; line-height: 1.15; color: var(--b-ink); }
.sp-end.right { text-align: right; }
.slidev-layout .sp-q {
  font-family: var(--serif); font-size: 2.2rem; line-height: 1.15; letter-spacing: -0.02em;
  text-align: center; margin-top: 2.6rem; color: var(--b-ink);
}
.sp-q em { font-style: normal; color: var(--b-brown); }
</style>
