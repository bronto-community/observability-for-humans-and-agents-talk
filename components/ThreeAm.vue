<script setup lang="ts">
import { ref } from 'vue'
import gsap from 'gsap'
import { useStepTimeline } from '../composables/useStepTimeline'

/**
 * Back to the failed checkout from the auto-instrumentation slide, at 3 a.m.
 * One query for the affected customer, across three services.
 *
 * s0  auto-instrumentation only: the customer slot is "?" everywhere, 0 of 3
 * s1  agents without skills: one name per service, or none at all: 1 of 3
 * s2  skills + your conventions: one internal name everywhere, 3 of 3
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const root = ref<HTMLElement>()

const SPANS = [
  { svc: 'frontend', name: 'POST /checkout', x: 0, w: 100 },
  { svc: 'cart', name: 'reserve items', x: 6, w: 34 },
  { svc: 'payment', name: 'charge card', x: 44, w: 52, err: true },
]
// what each span carries for "the customer", per stage
const ATTR = [
  [['customer', '?'], ['customer', '?'], ['customer', '?']],
  [['acme.customer.id', 'c_8812'], ['userId', '8812'], ['', '']],
  [['acme.customer.id', 'c_8812'], ['acme.customer.id', 'c_8812'], ['acme.customer.id', 'c_8812']],
]
const HIT = [[], [0], [0, 1, 2]]
const STAGE = ['auto-instrumentation only', 'agent-instrumented, no skills', 'agent skills + your conventions']

useStepTimeline(root, () => props.step, (tl) => {
  tl.from('.ta-q', { opacity: 0, y: -10, duration: 0.45 })
  tl.from('.ta-row', { opacity: 0, x: -12, stagger: 0.1, duration: 0.4 }, '<0.15')
  tl.from('.ta-bar', { scaleX: 0, transformOrigin: '0% 50%', stagger: 0.1, duration: 0.5 }, '<0.1')
  tl.from('.ta-v0', { opacity: 0, duration: 0.3, stagger: 0.08 })
  tl.addLabel('s0')

  for (const s of [1, 2]) {
    tl.to(`.ta-v${s - 1}, .ta-n${s - 1}, .ta-st${s - 1}`, { opacity: 0, duration: 0.25 })
    tl.to(`.ta-v${s}, .ta-n${s}, .ta-st${s}`, { opacity: 1, duration: 0.35, stagger: 0.06 })
    tl.to('.ta-row', { backgroundColor: 'transparent', duration: 0.2 }, '<')
    HIT[s].forEach((r) => {
      tl.to(`.ta-row-${r}`, { backgroundColor: 'var(--card-lime-bg)', duration: 0.3 }, '<0.08')
    })
    tl.addLabel(`s${s}`)
  }
}, () => {
  gsap.to('.ta-pulse', { scale: 2.2, opacity: 0, duration: 1.4, repeat: -1, ease: 'power1.out' })
})
</script>

<template>
  <div ref="root" class="ta">
    <div class="ta-q">
      <span class="ta-alert"><i class="ta-pulse" /><i /></span>
      <span class="ta-time">03:12</span>
      <span class="ta-query"><span class="dim">where</span> acme.customer.id = <span class="ta-str">"c_8812"</span></span>
      <span class="ta-count">
        <span v-for="(h, s) in HIT" :key="s" :class="[`ta-n ta-n${s}`, { all: h.length === 3 }]">{{ h.length }} of 3 services</span>
      </span>
    </div>
    <div class="ta-who mono">you, or your agent</div>

    <div class="ta-trace">
      <div v-for="(sp, r) in SPANS" :key="r" :class="`ta-row ta-row-${r}`">
        <span class="ta-svc">{{ sp.svc }}</span>
        <span class="ta-name">{{ sp.name }}</span>
        <span class="ta-track">
          <i class="ta-bar" :class="{ err: sp.err }" :style="{ left: `${sp.x}%`, width: `${sp.w}%` }" />
        </span>
        <span class="ta-attr">
          <span v-for="(a, s) in ATTR" :key="s" :class="[`ta-v ta-v${s}`, { q: s === 0, none: !a[r][0] }]">
            <template v-if="a[r][0]"><span class="k">{{ a[r][0] }}</span><span class="v">{{ a[r][1] }}</span></template>
            <span v-else class="k">no customer attribute</span>
          </span>
        </span>
      </div>
    </div>

    <div class="ta-stage mono">
      <span v-for="(t, s) in STAGE" :key="s" :class="`ta-st ta-st${s}`">{{ t }}</span>
    </div>
  </div>
</template>

<style scoped>
.ta { width: 880px; margin: 1.4rem auto 0; display: flex; flex-direction: column; }

.ta-q {
  display: flex; align-items: center; gap: 0.9rem;
  padding: 0.75rem 1.1rem; border-radius: 12px;
  background: var(--o-card);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--o-mist) 14%, transparent);
  font-family: var(--mono); font-size: 0.95rem;
}
.ta-alert { position: relative; width: 10px; height: 10px; flex: none; }
.ta-alert i { position: absolute; inset: 0; border-radius: 50%; background: var(--wrong); }
.ta-time { color: var(--wrong); }
.ta-query { flex: 1; color: var(--o-mist); }
.ta-str { color: var(--px-hi); }
.ta-count { position: relative; width: 150px; height: 1.4em; text-align: right; }
.ta-n { position: absolute; right: 0; top: 0; white-space: nowrap; color: var(--fg-dim); opacity: 0; }
.ta-n0 { opacity: 1; }
.ta-n.all { color: var(--o-sun); }
.ta-who { font-size: 0.62rem; color: var(--fg-dim); margin: 0.35rem 0 1.1rem 1.1rem; letter-spacing: 0.04em; }

.ta-trace { display: flex; flex-direction: column; gap: 6px; }
.ta-row {
  display: grid; grid-template-columns: 90px 150px 1fr 250px; align-items: center; gap: 1rem;
  padding: 0.7rem 1rem; border-radius: 10px;
  font-family: var(--mono); font-size: 0.8rem;
}
.ta-svc { color: var(--fg-dim); font-size: 0.7rem; }
.ta-name { color: var(--o-mist); }
.ta-track { position: relative; height: 12px; border-radius: 3px; background: var(--o-muted); }
.ta-bar { position: absolute; top: 0; bottom: 0; border-radius: 3px; background: var(--px-mid); }
.ta-bar.err { background: var(--wrong); }

.ta-attr { position: relative; height: 1.9rem; }
.ta-v {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: space-between; gap: 0.6rem;
  padding: 0 0.6rem; border-radius: 6px; font-size: 0.74rem;
  background: color-mix(in srgb, var(--o-forest) 60%, transparent);
  opacity: 0;
}
.ta-v .k { color: var(--fg-dim); }
.ta-v .v { color: var(--o-mist); }
.ta-v0 { opacity: 1; }
.ta-v.q { border: 1px dashed color-mix(in srgb, var(--o-sun) 55%, transparent); }
.ta-v.q .k, .ta-v.q .v { color: var(--o-sun); }
.ta-v.q .v { font-weight: 700; }
.ta-v.none { background: transparent; border: 1px dashed color-mix(in srgb, var(--o-mist) 22%, transparent); }
.ta-v.none .k { font-style: italic; opacity: 0.7; }

.ta-stage { position: relative; height: 1.2em; margin-top: 1.3rem; font-size: 0.78rem; letter-spacing: 0.06em; text-transform: uppercase; }
.ta-st { position: absolute; left: 1rem; top: 0; color: var(--fg-dim); opacity: 0; }
.ta-st0 { opacity: 1; }
.ta-st2 { color: var(--o-sun); }
</style>
