<script setup lang="ts">
import { ref } from 'vue'
import { useStepTimeline } from '../composables/useStepTimeline'

/**
 * Time from "the issue appeared" to "we know why", against system size.
 *
 * stage 0  axes, a small system, a short flat start of the line
 *       1  the system grows (right) and the line climbs with it
 *       2  the vertical distance at the end is bracketed: the gap
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const root = ref<HTMLElement>()

const O = { x: 56, y: 292 }          // chart origin
const LINE = 'M56 280 C 190 274, 320 252, 410 196 S 520 70, 556 34'

/* the system: first three nodes are there from the start */
const NODES: [number, number][] = [
  [120, 120], [92, 150], [150, 152],
  [60, 104], [178, 118], [122, 186], [70, 188], [176, 186],
  [34, 146], [206, 152], [96, 72], [150, 70], [40, 66], [204, 80],
  [122, 226], [62, 226], [184, 226], [212, 112],
]
const EDGES: [number, number][] = [
  [0, 1], [0, 2], [1, 2],
  [3, 0], [4, 0], [5, 1], [6, 1], [7, 2], [8, 1], [9, 4], [10, 3], [11, 0],
  [12, 3], [13, 11], [14, 5], [15, 6], [16, 7], [17, 4],
]
const edgeD = ([a, b]: [number, number]) => `M${NODES[a][0]} ${NODES[a][1]} L${NODES[b][0]} ${NODES[b][1]}`

useStepTimeline(root, () => props.step, (tl) => {
  const line = root.value!.querySelector<SVGPathElement>('.ttw-line')!
  const len = line.getTotalLength() || 700
  line.style.strokeDasharray = `${len}`

  tl.from('.ttw-axis', { opacity: 0, duration: 0.4 })
  tl.fromTo(line, { strokeDashoffset: len }, { strokeDashoffset: len * 0.74, duration: 0.8, ease: 'power1.out' }, '<0.1')
  tl.from('.n-0, .e-0', { opacity: 0, scale: 0.4, transformOrigin: '50% 50%', stagger: 0.06, duration: 0.4 }, '<')
  tl.addLabel('s0')

  tl.to(line, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.in' })
  tl.from('.n-1, .e-1', { opacity: 0, scale: 0.3, transformOrigin: '50% 50%', stagger: 0.05, duration: 0.35 }, '<')
  tl.from('.ttw-end', { opacity: 0, scale: 0, transformOrigin: '50% 50%', duration: 0.3 }, '>-0.1')
  tl.addLabel('s1')

  tl.from('.ttw-gap', { opacity: 0, scaleY: 0, transformOrigin: '50% 100%', duration: 0.7, ease: 'power3.out' })
  tl.from('.ttw-gap-label', { opacity: 0, x: -8, duration: 0.4 }, '>-0.2')
  tl.addLabel('s2')
})
</script>

<template>
  <div ref="root" class="ttw">
    <svg class="ttw-chart" viewBox="0 0 660 330">
      <g class="ttw-axis">
        <path :d="`M${O.x} 18 V${O.y} H600`" class="axis" />
        <path d="M596 288 L602 292 L596 296" class="axis" />
        <path :d="`M${O.x - 4} 22 L${O.x} 16 L${O.x + 4} 22`" class="axis" />
        <text :x="O.x" :y="O.y + 24" class="lbl">small system</text>
        <text x="600" :y="O.y + 24" class="lbl" text-anchor="end">large system</text>
        <text :transform="`translate(${O.x - 18} ${O.y}) rotate(-90)`" class="lbl">issue appeared → we know why</text>
      </g>
      <path class="ttw-line" :d="LINE" />
      <circle class="ttw-end" cx="556" cy="34" r="5" />
      <g class="ttw-gap">
        <path d="M576 292 h7 V34 h-7" class="gap" />
        <path d="M583 163 h6" class="gap" />
      </g>
      <text class="ttw-gap-label" x="596" y="168">the gap</text>
    </svg>

    <svg class="ttw-sys" viewBox="0 0 240 260">
      <path v-for="(e, i) in EDGES" :key="'e' + i" :d="edgeD(e)" :class="['wire', i < 3 ? 'e-0' : 'e-1']" />
      <rect
        v-for="(n, i) in NODES" :key="'n' + i"
        :x="n[0] - 8" :y="n[1] - 8" width="16" height="16" rx="4"
        :class="['node', i < 3 ? 'n-0' : 'n-1', { hot: i === 0 }]"
      />
    </svg>
  </div>
</template>

<style scoped>
.ttw { display: flex; align-items: center; gap: 2rem; width: 100%; max-width: 54rem; margin: 1.2rem auto 0; }
.ttw-chart { width: 600px; height: auto; overflow: visible; }
.ttw-sys { width: 220px; height: auto; overflow: visible; }
.axis { fill: none; stroke: var(--b-ink); stroke-width: 1.3; stroke-linecap: round; stroke-linejoin: round; }
.lbl { font-family: var(--mono); font-size: 12px; fill: var(--b-dim); }
.ttw-line { fill: none; stroke: var(--b-amber); stroke-width: 4; stroke-linecap: round; }
.ttw-end { fill: var(--b-amber); stroke: var(--b-bg); stroke-width: 2; }
.gap { fill: none; stroke: var(--b-brown); stroke-width: 1.6; stroke-linecap: round; stroke-linejoin: round; }
.ttw-gap-label { font-family: var(--serif); font-size: 26px; font-weight: 500; fill: var(--b-brown); }
.node { fill: var(--b-bg); stroke: var(--b-brown); stroke-width: 1.4; }
.node.hot { fill: var(--b-amber); stroke: var(--b-ink); }
</style>
