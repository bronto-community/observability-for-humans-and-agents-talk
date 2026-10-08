<script setup lang="ts">
import { computed, ref } from 'vue'
import gsap from 'gsap'
import { useStepTimeline } from '../composables/useStepTimeline'

/**
 * The OllyGarden "bitmap garden": a mosaic of square green tiles that thickens
 * toward one or more edges, with the odd tulip / flower / chevron tile, as on
 * ollygarden.com and the joint cover art.
 *
 * Deterministic (seeded) so the layout is identical on every render and export.
 * Tiles grow in from the edge on slide entry; a few shimmer afterwards.
 *
 *   edges     which sides the garden grows from: any of 'l' 'r' 't' 'b'
 *   depth     how far (0–1 of the shorter axis) it reaches in
 *   tone      'dark' for the forest canvas, 'light' for beige/cream canvases
 */
const props = withDefaults(defineProps<{
  cols?: number
  rows?: number
  edges?: string
  depth?: number
  seed?: number
  tone?: 'dark' | 'light'
  glyphs?: number
  shimmer?: boolean
}>(), {
  cols: 25, rows: 14, edges: 'lr', depth: 0.3, seed: 7, tone: 'dark', glyphs: 0.06, shimmer: true,
})

const root = ref<SVGSVGElement>()

function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6D2B79F5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const PAL = {
  dark:  ['#2A4A12', '#3B5A16', '#4F6B19', '#5E7A1E', '#697D07', '#566B3C', '#7A8C3A', '#34520B', '#1E3A10', '#6B7F5A'],
  light: ['#D3E000', '#C6D400', '#B8C24C', '#E1E25E', '#9DA704', '#829A12', '#697D07', '#4F6B19', '#34520B', '#22410F'],
}
const GLYPHS = ['tulip', 'flower', 'chev', 'leaf'] as const

interface Tile { x: number; y: number; c: string; g?: typeof GLYPHS[number]; gc?: string; d: number }

const tiles = computed<Tile[]>(() => {
  const r = rng(props.seed)
  const out: Tile[] = []
  const { cols, rows } = props
  const reach = props.depth * Math.min(cols, rows) * 1.6
  const pal = PAL[props.tone]
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      // distance to the nearest growing edge, in cells
      const ds: number[] = []
      if (props.edges.includes('l')) ds.push(x)
      if (props.edges.includes('r')) ds.push(cols - 1 - x)
      if (props.edges.includes('t')) ds.push(y)
      if (props.edges.includes('b')) ds.push(rows - 1 - y)
      const d = Math.min(...ds)
      // probability falls off with distance, with a ragged edge
      const p = 1 - d / reach + (r() - 0.5) * 0.7
      if (p < 0.5) continue
      // deeper in the garden → darker / richer
      const ci = Math.min(pal.length - 1, Math.floor(r() * pal.length))
      const t: Tile = { x, y, c: pal[ci], d }
      if (r() < props.glyphs) {
        t.g = GLYPHS[Math.floor(r() * GLYPHS.length)]
        t.gc = props.tone === 'dark' ? '#1A3A0E' : '#34520B'
      }
      out.push(t)
    }
  }
  return out
})

useStepTimeline(root, () => 0, (tl) => {
  tl.from('.px', {
    opacity: 0, scale: 0.4, transformOrigin: '50% 50%',
    duration: 0.45, ease: 'back.out(2)',
    stagger: { each: 0.006, from: 'random' },
  })
  tl.addLabel('s0')
}, () => {
  if (!props.shimmer) return
  const els = gsap.utils.toArray<SVGGElement>('.px')
  if (!els.length) return
  // a handful of tiles breathe, like hw-tile-glow on the site
  const pick = gsap.utils.shuffle(els.slice()).slice(0, Math.max(3, Math.round(els.length * 0.06)))
  gsap.to(pick, {
    opacity: 0.55, duration: 1.6, ease: 'sine.inOut',
    yoyo: true, repeat: -1, stagger: { each: 0.35, repeat: -1, yoyo: true },
    delay: 1,
  })
})
</script>

<template>
  <svg ref="root" class="pixel-field" :viewBox="`0 0 ${cols} ${rows}`" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <g v-for="(t, i) in tiles" :key="i" class="px" :transform="`translate(${t.x} ${t.y})`">
      <rect width="1.002" height="1.002" :fill="t.c" />
      <template v-if="t.g === 'tulip'">
        <path d="M0.12 0.12 H0.88 A0.38 0.38 0 0 1 0.12 0.12 Z" :fill="t.gc" />
        <path d="M0.5 0.98 Q0.08 0.96 0.06 0.58 Q0.46 0.6 0.5 0.98 Z M0.5 0.98 Q0.92 0.96 0.94 0.58 Q0.54 0.6 0.5 0.98 Z" :fill="t.gc" />
      </template>
      <template v-else-if="t.g === 'flower'">
        <g :fill="t.gc">
          <circle cx="0.5" cy="0.5" r="0.22" />
          <circle v-for="k in 8" :key="k" :cx="0.5 + 0.24 * Math.cos(k * Math.PI / 4)" :cy="0.5 + 0.24 * Math.sin(k * Math.PI / 4)" r="0.14" />
        </g>
      </template>
      <template v-else-if="t.g === 'chev'">
        <path d="M0.1 0.2 L0.34 0.5 L0.1 0.8 Z M0.38 0.2 L0.62 0.5 L0.38 0.8 Z M0.66 0.2 L0.9 0.5 L0.66 0.8 Z" :fill="t.gc" />
      </template>
      <template v-else-if="t.g === 'leaf'">
        <path d="M0.5 0.85 Q0.12 0.78 0.14 0.3 Q0.5 0.4 0.5 0.85 Z M0.5 0.85 Q0.88 0.78 0.86 0.3 Q0.5 0.4 0.5 0.85 Z" :fill="t.gc" />
      </template>
    </g>
  </svg>
</template>

<style scoped>
.pixel-field { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; shape-rendering: crispEdges; }
</style>
