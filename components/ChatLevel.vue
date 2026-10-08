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
 * Answers are tool calls plus the shape of the result, not invented numbers.
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const root = ref<HTMLElement>()

interface Msg { q: string; a: string; group: number }
const MSGS: Msg[] = [
  { group: 0, q: 'What caused the spike at 3pm?', a: 'search_logs · get_metrics → 3 hypotheses' },
  { group: 0, q: 'Why is the auth service slow?', a: 'get_traces → slowest span on the hot path' },
  { group: 0, q: 'Summarize every log from the last 30 minutes.', a: 'search_logs → summary by pattern' },
  { group: 1, q: 'Which service takes the most time on the critical path of a payment?', a: 'get_traces → services ranked by self time' },
  { group: 1, q: 'Which services were used less over the last three months?', a: 'query_metrics → 90-day usage by service' },
  { group: 2, q: 'Build me a dashboard for checkout.', a: 'create_dashboard → 4 panels' },
]

useStepTimeline(root, () => props.step, (tl) => {
  const msgs = gsap.utils.toArray<HTMLElement>('.cl-msg')

  const type = (i: number) => {
    const m = msgs[i]
    const q = m.querySelector('.cl-q-text')!
    const a = m.querySelector('.cl-a')!
    tl.set(m, { display: 'block' })
    tl.fromTo(q, { text: '' }, { text: MSGS[i].q, duration: MSGS[i].q.length * 0.018, ease: 'none' })
    tl.from(a, { autoAlpha: 0, x: -6, duration: 0.3 }, '>0.1')
  }

  tl.set(msgs, { display: 'none' })
  tl.from('.cl-panel', { autoAlpha: 0, y: 10, duration: 0.4 })
  ;[0, 1, 2].forEach(type)
  tl.addLabel('s0')

  tl.to('.g-0', { opacity: 0.38, duration: 0.3 })
  ;[3, 4].forEach(type)
  tl.addLabel('s1')

  tl.to('.g-1', { opacity: 0.38, duration: 0.3 })
  type(5)
  tl.from('.cl-dash', { autoAlpha: 0, x: 24, duration: 0.5 }, '>-0.1')
  tl.from('.cl-tile', { autoAlpha: 0, y: 8, stagger: 0.1, duration: 0.35 }, '<0.15')
  tl.from('.cl-bar', { scaleY: 0, transformOrigin: '50% 100%', stagger: 0.03, duration: 0.3 }, '<0.1')
  tl.addLabel('s2')
}, () => {
  gsap.to('.cl-caret', { opacity: 0, duration: 0.5, repeat: -1, yoyo: true, ease: 'steps(1)' })
})

const BARS = [38, 52, 44, 61, 47, 72, 58, 40, 66, 50, 45, 80]
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
        </div>
        <div class="cl-q cl-next"><span class="cl-prompt">›</span><span class="cl-caret" /></div>
      </div>
    </div>

    <div class="cl-dash">
      <div class="cl-dash-h">checkout</div>
      <div class="cl-grid">
        <div class="cl-tile wide">
          <div class="cl-t-l">requests</div>
          <div class="cl-bars">
            <span v-for="(b, i) in BARS" :key="i" class="cl-bar" :style="{ height: b + '%' }" />
          </div>
        </div>
        <div class="cl-tile">
          <div class="cl-t-l">p99</div>
          <svg viewBox="0 0 100 40" class="cl-spark"><path d="M0 30 L14 28 L28 31 L42 22 L56 25 L70 12 L84 18 L100 8" /></svg>
        </div>
        <div class="cl-tile">
          <div class="cl-t-l">errors</div>
          <svg viewBox="0 0 100 40" class="cl-spark err"><path d="M0 34 L14 33 L28 34 L42 30 L56 33 L70 20 L84 31 L100 32" /></svg>
        </div>
        <div class="cl-tile wide">
          <div class="cl-t-l">top endpoints</div>
          <div class="cl-rows"><span /><span /><span /></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cl { display: flex; gap: 1.2rem; align-items: flex-start; width: 100%; max-width: 54rem; height: 380px; margin: 0.6rem auto 0; }

.cl-panel {
  flex: 0 0 34rem; min-width: 0;
  background: var(--b-ink); color: var(--b-bg);
  border-radius: 14px; overflow: hidden;
  box-shadow: 0 18px 40px rgba(40, 30, 10, 0.18);
}
.cl-bar-top { display: flex; align-items: center; gap: 6px; padding: 0.55rem 0.9rem; border-bottom: 1px solid rgba(255, 255, 255, 0.08); }
.dot { width: 9px; height: 9px; border-radius: 50%; background: rgba(255, 255, 255, 0.16); }
.cl-tag { margin-left: auto; font-family: var(--mono); font-size: 0.62rem; color: var(--b-amber); letter-spacing: 0.04em; }
.cl-body { padding: 0.8rem 1rem 0.9rem; font-family: var(--mono); display: flex; flex-direction: column; gap: 0.55rem; }
.cl-msg.first { margin-top: 0.35rem; padding-top: 0.6rem; border-top: 1px dashed rgba(255, 255, 255, 0.14); }
.cl-q { display: flex; gap: 0.55rem; font-size: 0.78rem; line-height: 1.35; color: var(--b-bg); }
.cl-prompt { color: var(--b-amber); font-weight: 600; }
.cl-a { margin: 0.12rem 0 0 1.05rem; font-size: 0.64rem; color: color-mix(in srgb, var(--b-bg) 55%, transparent); }
.cl-next { margin-top: 0.15rem; }
.cl-caret { display: inline-block; width: 7px; height: 0.95em; background: var(--b-amber); transform: translateY(2px); }

.cl-dash {
  flex: 0 0 15.5rem;
  background: #fff; border: 1px solid var(--b-hair); border-radius: 14px;
  padding: 0.7rem; box-shadow: 0 12px 30px rgba(40, 30, 10, 0.1);
  margin-top: 2.6rem;
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
