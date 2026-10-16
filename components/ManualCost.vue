<script setup lang="ts">
import { ref } from 'vue'
import { useStepTimeline } from '../composables/useStepTimeline'

/**
 * Manual instrumentation: the two questions an engineer gets to answer, shown
 * as the code that answers them, then the weight that comes with doing it well.
 *
 * s0  the span in code; each decision lights up its lines, question → action
 * s1  the turn: in reality it's not trivial (an empty engineer's shoulders)
 * s2  four costs drop onto the engineer, one after another
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const root = ref<HTMLElement>()

// fills the three slots the auto-instrumentation slide left as "?"
const CODE = [
  'ctx, span := tracer.Start(ctx, "checkout")',
  'defer span.End()',
  '',
  'span.SetAttributes(',
  '  attribute.String("customer.id", c.ID),',
  '  attribute.String("plan", c.Plan),',
  '  attribute.String("feature_flag", flag),',
  ')',
  '',
  'span.SetAttributes(attribute.String(',
  '  "customer.email", redact(c.Email)))',
]
const DECISIONS = [
  { q: 'Relevant at 3 a.m.?', a: 'instrument it', from: 3, n: 5 },
  { q: 'Sensitive?', a: 'redact at the source', from: 9, n: 2 },
]
const LH = 22      // px per code line
const HEAD = 30    // px, editor title bar
const PAD = 12     // px, code body top padding

const group = (i: number) => DECISIONS.findIndex(d => i >= d.from && i < d.from + d.n)
const paint = (line: string) => line
  .replace(/"[^"]*"/g, s => `<span class="tk-s">${s}</span>`)
  .replace(/\b(defer)\b/g, '<span class="tk-k">$1</span>')
  .replace(/(:=)/g, '<span class="tk-k">$1</span>')

const COSTS = [
  'time to maintain it',
  'OTel domain knowledge',
  'context propagation',
  'consistency across services',
]

useStepTimeline(root, () => props.step, (tl) => {
  tl.from('.mc-code', { opacity: 0, y: 14, duration: 0.5 })
  tl.from('.mc-ln-base', { opacity: 0, duration: 0.25, stagger: 0.06 }, '<0.2')
  DECISIONS.forEach((_, i) => {
    tl.from(`.mc-ln-${i}`, { opacity: 0, x: -6, duration: 0.25, stagger: 0.06 })
    tl.from(`.mc-hl-${i}`, { scaleY: 0, transformOrigin: '50% 0%', duration: 0.3 }, '>-0.05')
    tl.from(`.mc-w-${i}`, { scaleX: 0, transformOrigin: '0% 50%', duration: 0.3 })
    tl.from(`.mc-a-${i}`, { opacity: 0, x: -10, duration: 0.4 }, '<0.15')
  })
  tl.addLabel('s0')
  tl.to('.mc-left', { opacity: 0.45, duration: 0.4 })
  tl.from('.mc-turn', { opacity: 0, y: 10, duration: 0.45 }, '<')
  tl.from('.mc-base', { opacity: 0, y: 14, duration: 0.45 }, '<0.1')
  tl.addLabel('s1')
  // blocks are listed top → bottom; the bottom one lands first
  ;[...COSTS.keys()].reverse().forEach((i) => {
    tl.from(`.mc-c-${i}`, { y: -260, opacity: 0, duration: 0.6, ease: 'bounce.out' }, '>-0.25')
  })
  tl.to('.mc-base', { y: 4, duration: 0.15, yoyo: true, repeat: 1 }, '>-0.2')
  tl.addLabel('s2')
})
</script>

<template>
  <div ref="root" class="mc">
    <div class="mc-left">
      <div class="mc-code">
        <div class="mc-head" :style="{ height: `${HEAD}px` }">
          <i /><i /><i />
          <span>checkout.go</span>
        </div>
        <div class="mc-body" :style="{ paddingTop: `${PAD}px` }">
          <div
            v-for="(d, i) in DECISIONS" :key="i" :class="`mc-hl mc-hl-${i}`"
            :style="{ top: `${PAD + d.from * LH}px`, height: `${d.n * LH}px` }"
          />
          <div
            v-for="(line, i) in CODE" :key="i"
            :class="['mc-ln', group(i) < 0 ? 'mc-ln-base' : `mc-ln-${group(i)}`]"
            :style="{ height: `${LH}px` }"
            v-html="paint(line) || '&nbsp;'"
          />
        </div>
      </div>

      <div class="mc-notes">
        <div
          v-for="(d, i) in DECISIONS" :key="i" class="mc-note"
          :style="{ top: `${HEAD + PAD + d.from * LH}px`, height: `${d.n * LH}px` }"
        >
          <svg :class="`mc-w mc-w-${i}`" viewBox="0 0 40 12" width="40" height="12">
            <path class="wire" d="M2 6 H32" />
            <circle class="wire-dot" cx="34" cy="6" r="4" />
          </svg>
          <div :class="`card lime mc-a mc-a-${i}`">
            <div class="card-sub">{{ d.q }}</div>
            <div class="card-title">{{ d.a }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="mc-right">
      <div class="mc-turn">The reality: <em>not trivial</em></div>
      <div class="mc-stack">
        <div v-for="(c, i) in COSTS" :key="c" :class="`mc-block mc-c-${i}`">{{ c }}</div>
      </div>
      <div class="mc-base">
        <lucide-user-round class="mc-who" />
        <span>you, the engineer</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mc { width: 880px; margin: 1.4rem auto 0; display: grid; grid-template-columns: 1fr 260px; column-gap: 2rem; align-items: end; }
.mc-left { position: relative; display: flex; }

.mc-code {
  width: 385px; flex-shrink: 0; border-radius: 12px; overflow: hidden;
  background: var(--o-card);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--o-mist) 14%, transparent), 0 18px 40px rgba(0, 0, 0, 0.35);
}
.mc-head {
  display: flex; align-items: center; gap: 5px; padding: 0 0.8rem;
  border-bottom: 1px solid var(--o-muted);
}
.mc-head i { width: 8px; height: 8px; border-radius: 50%; background: var(--o-muted); }
.mc-head span { margin-left: 0.5rem; font-family: var(--mono); font-size: 0.65rem; color: var(--o-dim); }
.mc-body { position: relative; padding-bottom: 12px; }
.mc-hl {
  position: absolute; left: 0; right: 0;
  background: color-mix(in srgb, var(--o-sun) 9%, transparent);
  border-left: 2px solid var(--o-sun);
}
.mc-ln {
  position: relative; padding: 0 0.9rem;
  font-family: var(--mono); font-size: 0.8rem; line-height: 22px; white-space: pre;
  color: color-mix(in srgb, var(--o-mist) 82%, transparent);
}
.mc-ln :deep(.tk-s) { color: var(--px-hi); }
.mc-ln :deep(.tk-k) { color: var(--o-sun); }

.mc-notes { position: relative; flex: 1; }
.mc-note { position: absolute; left: 0; right: 0; display: flex; align-items: center; }
.mc-w { flex-shrink: 0; margin-right: 4px; overflow: visible; }
.mc-a { flex: 1; padding: 0.6rem 0.8rem; text-align: left; }
.mc-a .card-sub { margin: 0 0 0.15rem; }
.mc-a .card-title { font-size: 1rem; }

.mc-right { display: flex; flex-direction: column; align-items: stretch; }
.mc-turn { font-family: var(--grotesk); font-size: 1.5rem; letter-spacing: -0.02em; margin-bottom: 1.1rem; color: var(--o-mist); }
.mc-turn em { font-style: normal; color: var(--o-sun); }
.mc-stack { display: flex; flex-direction: column; gap: 4px; }
.mc-block {
  font-family: var(--mono); font-size: 0.78rem; color: var(--o-forest);
  padding: 0.7rem 0.9rem; border-radius: 4px;
  background: var(--px-mid);
}
.mc-c-0 { background: var(--px-hi); margin: 0 1.6rem; }
.mc-c-1 { background: var(--o-sun); margin: 0 1rem; }
.mc-c-2 { background: var(--px-mid); margin: 0 0.5rem; }
.mc-c-3 { background: var(--px-olive); color: var(--o-mist); }
.mc-base {
  margin-top: 6px; display: flex; align-items: center; justify-content: center; gap: 0.6rem;
  padding: 0.7rem; border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--o-mist) 22%, transparent);
  font-family: var(--mono); font-size: 0.78rem; color: var(--o-dim);
}
.mc-who { color: var(--o-mist); font-size: 1.1rem; }
</style>
