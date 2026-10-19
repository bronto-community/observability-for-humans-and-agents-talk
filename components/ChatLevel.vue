<script setup lang="ts">
import { ref } from 'vue'
import gsap from 'gsap'
import { TextPlugin } from 'gsap/TextPlugin'
import { useStepTimeline } from '../composables/useStepTimeline'

gsap.registerPlugin(TextPlugin)

/**
 * A model connected to the observability backend over MCP / a CLI, asked the
 * questions you would otherwise click your way to.
 *
 * stage 0  incident questions
 *       1  bottlenecks and optimization: not only incidents
 *       2  "build me a dashboard" and a dashboard appears
 *
 * Each exchange: the question, the tool calls it turned into, and the answer.
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const root = ref<HTMLElement>()

interface Msg { q: string; a: string; r: string; group: number }
// one thread about one checkout incident: the cause, the slowness behind it,
// then a dashboard to keep an eye on exactly that
const MSGS: Msg[] = [
  {
    group: 0, q: 'Why did checkout start failing at 3pm?', a: 'search_logs · get_traces',
    r: 'Deploy 9c1e cut the payments-gateway timeout to 2 s. fraud-check answers in 2.4 s at p99, so 4% of checkouts time out.',
  },
  {
    group: 1, q: 'Is fraud-check always that slow?', a: 'query_metrics · get_traces',
    r: 'For six weeks now. It is 61% of the checkout critical path every day. The deploy only made it visible.',
  },
  {
    group: 2, q: 'Build me a dashboard so we can watch this.', a: 'create_dashboard',
    r: 'Done. Four panels: errors, checkout p99, fraud-check p99, timeouts by deploy.',
  },
]

useStepTimeline(root, () => props.step, (tl) => {
  const msgs = gsap.utils.toArray<HTMLElement>('.cl-msg')

  const type = (i: number) => {
    const m = msgs[i]
    const q = m.querySelector('.cl-q-text')!
    const a = m.querySelector('.cl-a')!
    const r = m.querySelector('.cl-r-text')!
    tl.set(m, { display: 'block' })
    tl.fromTo(q, { text: '' }, { text: MSGS[i].q, duration: MSGS[i].q.length * 0.018, ease: 'none' })
    tl.from(a, { autoAlpha: 0, x: -6, duration: 0.3 }, '>0.1')
    tl.fromTo(r, { text: '' }, { text: MSGS[i].r, duration: MSGS[i].r.length * 0.008, ease: 'none' }, '>0.25')
  }

  tl.set(msgs, { display: 'none' })
  tl.from('.cl-panel', { autoAlpha: 0, y: 10, duration: 0.4 })
  type(0)
  tl.addLabel('s0')

  tl.to('.g-0', { opacity: 0.38, duration: 0.3 })
  type(1)
  tl.addLabel('s1')

  tl.to('.g-1', { opacity: 0.38, duration: 0.3 })
  type(2)
  tl.from('.cl-dash', { autoAlpha: 0, y: 16, scale: 0.96, duration: 0.5 }, '>-0.1')
  tl.from('.cl-tile', { autoAlpha: 0, y: 8, stagger: 0.1, duration: 0.35 }, '<0.15')
  tl.from('.cl-bar', { scaleY: 0, transformOrigin: '50% 100%', stagger: 0.03, duration: 0.3 }, '<0.1')
  tl.addLabel('s2')
})

// errors: flat, then the 3pm deploy
const BARS = [6, 8, 5, 7, 6, 9, 5, 7, 6, 8, 64, 82]
</script>

<template>
  <div ref="root" class="cl">
    <div class="cl-panel">
      <div class="cl-bar-top">
        <span class="dot" /><span class="dot" /><span class="dot" />
        <span class="cl-tag">bronto · MCP</span>
      </div>
      <div class="cl-body">
        <div v-for="(m, i) in MSGS" :key="i" :class="['cl-msg', 'g-' + m.group, { first: i > 0 && MSGS[i - 1].group !== m.group }]">
          <div class="cl-q"><span class="cl-prompt">›</span><span class="cl-q-text">{{ m.q }}</span></div>
          <div class="cl-a">↳ {{ m.a }}</div>
          <div class="cl-r"><span class="cl-r-text">{{ m.r }}</span></div>
        </div>
      </div>
    </div>

    <div class="cl-dash">
      <div class="cl-dash-h">checkout</div>
      <div class="cl-grid">
        <div class="cl-tile wide">
          <div class="cl-t-l">errors</div>
          <div class="cl-bars">
            <span v-for="(b, i) in BARS" :key="i" class="cl-bar" :style="{ height: b + '%' }" />
          </div>
        </div>
        <div class="cl-tile">
          <div class="cl-t-l">checkout p99</div>
          <svg viewBox="0 0 100 40" class="cl-spark"><path d="M0 30 L14 28 L28 31 L42 22 L56 25 L70 12 L84 18 L100 8" /></svg>
        </div>
        <div class="cl-tile">
          <div class="cl-t-l">fraud-check p99</div>
          <svg viewBox="0 0 100 40" class="cl-spark err"><path d="M0 24 L14 22 L28 25 L42 20 L56 23 L70 14 L84 18 L100 12" /></svg>
        </div>
        <div class="cl-tile wide">
          <div class="cl-t-l">timeouts by deploy</div>
          <div class="cl-rows"><span /><span /><span /></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* the chat never moves: sized for all six messages and centred from the
   start; the dashboard pops out over its right edge instead of taking room */
.cl { position: relative; width: 54rem; height: 320px; margin: 0.6rem auto 0; }

.cl-panel {
  width: 34rem; height: 100%; margin: 0 auto;
  background: var(--b-ink); color: var(--b-bg);
  border-radius: 14px; overflow: hidden;
  box-shadow: 0 18px 40px rgba(40, 30, 10, 0.18);
}
.cl-bar-top { display: flex; align-items: center; gap: 6px; padding: 0.55rem 0.9rem; border-bottom: 1px solid rgba(255, 255, 255, 0.08); }
.dot { width: 9px; height: 9px; border-radius: 50%; background: rgba(255, 255, 255, 0.16); }
.cl-tag { margin-left: auto; font-family: var(--mono); font-size: 0.62rem; color: var(--b-amber); letter-spacing: 0.04em; }
.cl-body { padding: 0.8rem 1rem 0.9rem; font-family: var(--mono); display: flex; flex-direction: column; gap: 0.5rem; }
.cl-msg.first { margin-top: 0.2rem; padding-top: 0.5rem; border-top: 1px dashed rgba(255, 255, 255, 0.14); }
.cl-q { display: flex; gap: 0.55rem; font-size: 0.78rem; line-height: 1.35; color: var(--b-bg); }
.cl-prompt { color: var(--b-amber); font-weight: 600; }
.cl-a { margin: 0.12rem 0 0 1.05rem; font-size: 0.64rem; color: color-mix(in srgb, var(--b-bg) 55%, transparent); }
.cl-r {
  margin: 0.25rem 0 0 1.05rem; padding-left: 0.6rem; border-left: 2px solid var(--b-amber);
  font-family: 'Radio Canada Big', system-ui, sans-serif; font-weight: 400; font-size: 0.72rem; line-height: 1.35;
  color: color-mix(in srgb, var(--b-bg) 88%, transparent);
}

.cl-dash {
  position: absolute; right: 0; top: 3.5rem; width: 15.5rem;
  background: #fff; border: 1px solid var(--b-hair); border-radius: 14px;
  padding: 0.7rem; box-shadow: 0 18px 40px rgba(40, 30, 10, 0.22);
}
.cl-dash-h { font-family: var(--mono); font-size: 0.68rem; color: var(--b-ink); margin-bottom: 0.5rem; }
.cl-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.45rem; }
.cl-tile { background: var(--b-bg); border-radius: 8px; padding: 0.4rem 0.5rem; }
.cl-tile.wide { grid-column: span 2; }
.cl-t-l { font-family: var(--mono); font-size: 0.55rem; color: var(--b-dim); margin-bottom: 0.25rem; }
.cl-bars { display: flex; align-items: flex-end; gap: 3px; height: 40px; }
.cl-bar { flex: 1; background: var(--b-amber); border-radius: 2px 2px 0 0; }
.cl-spark { width: 100%; height: 26px; }
.cl-spark path { fill: none; stroke: var(--b-brown); stroke-width: 2.2; stroke-linejoin: round; }
.cl-spark.err path { stroke: var(--b-ink); stroke-dasharray: 3 3; }
.cl-rows { display: flex; flex-direction: column; gap: 4px; }
.cl-rows span { height: 6px; border-radius: 3px; background: var(--b-hair); }
.cl-rows span:nth-child(1) { width: 92%; }
.cl-rows span:nth-child(2) { width: 70%; }
.cl-rows span:nth-child(3) { width: 48%; }
</style>
