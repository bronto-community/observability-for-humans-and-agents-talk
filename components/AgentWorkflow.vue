<script setup lang="ts">
import { ref, useId } from 'vue'
import gsap from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { useStepTimeline } from '../composables/useStepTimeline'

gsap.registerPlugin(MotionPathPlugin)

/**
 * Level 3: the alert hands itself to an agent. Same idiom as the blog figures:
 * amber = input, neutral = agent step, lime = human checkpoint.
 *
 * stage 0  a well-understood alert
 *       1  a trigger hands it to an agent with instructions to investigate
 *       2  the agent gets skills, a few CLI tools and MCP servers
 *       3  it comes back with hypotheses and candidate fixes
 *       4  a human reviews, accepts what holds up, and tunes the agent
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const root = ref<HTMLElement>()
// Slidev can render a slide more than once (exports, overview); mask ids must be per instance
const uid = `aw${useId()}`

const W = 760
const H = 380
const WIRES = {
  trigger: 'M170 186 H250',
  t1: 'M285 70 V140',
  t2: 'M355 70 V140',
  t3: 'M425 70 V140',
  out: 'M460 186 H540',
  review: 'M645 222 V288',
  loop: 'M540 324 H355 V232',
}
type WireKey = keyof typeof WIRES

useStepTimeline(root, () => props.step, (tl) => {
  const draw = (keys: WireKey[], at = '>') => {
    keys.forEach((k, i) => {
      const m = root.value!.querySelector<SVGPathElement>(`.mk-${k}`)!
      const len = m.getTotalLength() || 200
      m.style.strokeDasharray = `${len}`
      tl.fromTo(m, { strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.5, ease: 'power1.inOut' }, i === 0 ? at : '<0.08')
    })
  }

  tl.from('.aw-alert', { autoAlpha: 0, x: -14, duration: 0.45 })
  tl.addLabel('s0')

  draw(['trigger'])
  tl.from('.aw-l-trigger', { autoAlpha: 0, duration: 0.3 }, '<0.2')
  tl.from('.aw-agent', { autoAlpha: 0, scale: 0.94, duration: 0.45, ease: 'back.out(1.6)' }, '>-0.15')
  tl.addLabel('s1')

  tl.from('.aw-tool', { autoAlpha: 0, y: -10, stagger: 0.1, duration: 0.35 })
  draw(['t1', 't2', 't3'], '<0.15')
  tl.addLabel('s2')

  draw(['out'])
  tl.from('.aw-out', { autoAlpha: 0, x: -10, duration: 0.45 }, '>-0.1')
  tl.addLabel('s3')

  draw(['review'])
  tl.from('.aw-human', { autoAlpha: 0, y: -8, duration: 0.45 }, '>-0.1')
  draw(['loop'], '>')
  tl.from('.aw-l-loop', { autoAlpha: 0, duration: 0.3 }, '<0.3')
  tl.addLabel('s4')
}, () => {
  const run = (k: WireKey, dur: number, opts: gsap.TweenVars = {}) => {
    const path = root.value!.querySelector<SVGPathElement>(`.w-${k}`)!
    gsap.to(`.pk-${k}`, {
      motionPath: { path, align: path, alignOrigin: [0.5, 0.5] },
      duration: dur, ease: 'none', repeat: -1, ...opts,
    })
  }
  run('trigger', 1.4, { repeatDelay: 0.8 })
  run('t1', 1.1, { yoyo: true, repeatDelay: 0.4 })
  run('t2', 1.1, { yoyo: true, repeatDelay: 0.6, delay: 0.3 })
  run('t3', 1.1, { yoyo: true, repeatDelay: 0.5, delay: 0.6 })
  run('out', 1.4, { repeatDelay: 1, delay: 0.5 })
  run('review', 1.0, { repeatDelay: 1.2, delay: 0.9 })
  run('loop', 2.4, { repeatDelay: 0.8, delay: 1.2 })
  gsap.to('.aw-ring', { scale: 1.12, opacity: 0, duration: 1.4, repeat: -1, ease: 'power1.out', transformOrigin: '50% 50%' })
})
</script>

<template>
  <div ref="root" class="aw" :style="{ width: W + 'px', height: H + 'px' }">
    <svg class="aw-svg" :viewBox="`0 0 ${W} ${H}`">
      <defs>
        <mask v-for="(d, k) in WIRES" :id="`${uid}-${k}`" :key="k" maskUnits="userSpaceOnUse" x="0" y="0" :width="W" :height="H">
          <path :d="d" :class="`mk mk-${k}`" />
        </mask>
      </defs>
      <g v-for="(d, k) in WIRES" :key="k" :mask="`url(#${uid}-${k})`">
        <path :d="d" :class="`wire w-${k}`" />
        <circle :class="`pk pk-${k}`" r="4" />
      </g>
      <text class="aw-l aw-l-trigger" x="210" y="174" text-anchor="middle">trigger</text>
      <text class="aw-l aw-l-loop" x="447" y="342" text-anchor="middle">tune for next time</text>
    </svg>

    <div class="aw-node aw-alert" style="left: 0; top: 150px; width: 170px">
      <div class="aw-ring" />
      <div class="card amber">
        <div class="card-title">Alert</div>
        <div class="card-sub">well-understood</div>
      </div>
    </div>

    <div class="aw-node aw-agent" style="left: 250px; top: 140px; width: 210px">
      <div class="card agent">
        <div class="card-title">Agent</div>
        <div class="card-sub">investigate this alert</div>
      </div>
    </div>

    <div class="aw-node aw-tool" style="left: 253px; top: 36px; width: 64px"><div class="tool">skills</div></div>
    <div class="aw-node aw-tool" style="left: 323px; top: 36px; width: 64px"><div class="tool">CLI</div></div>
    <div class="aw-node aw-tool" style="left: 393px; top: 36px; width: 64px"><div class="tool">MCP</div></div>

    <div class="aw-node aw-out" style="left: 540px; top: 150px; width: 210px">
      <div class="card">
        <div class="card-title">Hypotheses</div>
        <div class="card-sub">+ candidate fixes</div>
      </div>
    </div>

    <div class="aw-node aw-human" style="left: 540px; top: 288px; width: 210px">
      <div class="card lime">
        <div class="card-title">Human review</div>
        <div class="card-sub">accept what holds up</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.aw { position: relative; margin: 0.6rem auto 0; }
.aw-svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.mk { fill: none; stroke: #fff; stroke-width: 10; }
.pk { fill: var(--b-amber); stroke: var(--b-ink); stroke-width: 1.2; }
.aw-l { font-family: var(--mono); font-size: 11px; fill: var(--b-dim); }

.aw-node { position: absolute; }
.aw-node .card { height: 72px; display: flex; flex-direction: column; justify-content: center; position: relative; }
.aw-agent .card { height: 92px; background: #fff; box-shadow: 0 10px 26px rgba(40, 30, 10, 0.1), inset 0 0 0 1px var(--b-hair); }
.aw-agent .card-title { font-size: 1.25rem; }
.aw-ring { position: absolute; inset: -6px; border-radius: 16px; border: 1.5px solid var(--b-amber); }

.tool {
  height: 34px; display: flex; align-items: center; justify-content: center;
  font-family: var(--mono); font-size: 0.68rem; color: var(--b-ink);
  background: var(--b-bg); border: 1px solid var(--b-brown); border-radius: 8px;
}
</style>
