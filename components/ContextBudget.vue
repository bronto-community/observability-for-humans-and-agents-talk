<script setup lang="ts">
import { ref } from 'vue'
import { useStepTimeline } from '../composables/useStepTimeline'

/**
 * The agent's context window as a strip of tiles.
 *
 * stage 0  no skill: the agent pulls the semantic-conventions registry in and
 *          the window floods
 *       1  otel-semantic-conventions skill: only the slice it needs is loaded;
 *          otel-go points at contrib libraries instead of hand-rolled spans
 *       2  your conventions on top — the part no model was trained on
 *
 * No token figures on purpose: the claim in the post is "a fraction of the
 * tokens", so the slide shows a fraction, not a number.
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const root = ref<HTMLElement>()

const COLS = 40
const ROWS = 4
const TOTAL = COLS * ROWS
/** tiles that stay after the skill is loaded (leftmost columns) */
const KEEP_COLS = 3
/** tiles your conventions add */
const OWN_COLS = 2
/** how far the registry floods, in columns */
const FLOOD_COLS = 34

/** column-major index so "keep the first N columns" is a prefix */
const tiles = Array.from({ length: TOTAL }, (_, i) => {
  const col = Math.floor(i / ROWS)
  const kind = col < KEEP_COLS ? 'keep' : col < FLOOD_COLS ? 'flood' : 'free'
  return { col, kind, shade: (i * 7 + col * 3) % 4 }
})
const own = Array.from({ length: OWN_COLS * ROWS }, (_, i) => i)

useStepTimeline(root, () => props.step, (tl) => {
  tl.from('.cb-frame', { opacity: 0, y: 10, duration: 0.4 })
  tl.from('.cb-t.keep, .cb-t.flood', {
    opacity: 0, scale: 0.3, duration: 0.25, ease: 'back.out(2)',
    stagger: { each: 0.004, from: 'start' },
  }, '-=0.1')
  tl.from('.cb-cap-0', { opacity: 0, duration: 0.3 })
  tl.addLabel('s0')

  // 1 — the skill: the flood drains, the slice stays and turns mist
  tl.to('.cb-t.flood', {
    opacity: 0, scale: 0.3, duration: 0.25, ease: 'power2.in',
    stagger: { each: 0.003, from: 'end' },
  })
  tl.to('.cb-t.keep i', { opacity: 1, duration: 0.3 }, '<')
  tl.to('.cb-cap-0', { opacity: 0, duration: 0.2 }, '<')
  tl.to('.cb-cap-1', { opacity: 1, duration: 0.3 })
  tl.to('.cb-go', { opacity: 1, y: 0, duration: 0.45 }, '<')
  tl.addLabel('s1')

  // 2 — your conventions
  tl.to('.cb-own', { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2.4)', stagger: 0.04 })
  tl.to('.cb-cap-2', { opacity: 1, duration: 0.3 }, '-=0.1')
  tl.addLabel('s2')
})
</script>

<template>
  <div ref="root" class="cb">
    <div class="cb-head mono">
      <span>context window</span>
    </div>

    <div class="cb-frame">
      <div class="cb-grid">
        <span
          v-for="(t, i) in tiles" :key="i"
          class="cb-t" :class="[t.kind, `sh${t.shade}`]"
        ><i v-if="t.kind === 'keep'" /></span>
      </div>
      <div class="cb-owngrid">
        <span v-for="i in own" :key="i" class="cb-own" />
      </div>
    </div>

    <div class="cb-caps">
      <div class="cb-cap cb-cap-0">
        <b>no skill</b> · the whole semantic-conventions registry
      </div>
      <div class="cb-cap cb-cap-1">
        <b>otel-semantic-conventions</b> · just the attribute names and span rules it needs
      </div>
      <div class="cb-cap cb-cap-2">
        <b class="sun">+ your conventions</b> · not in any training data
      </div>
    </div>

    <div class="cb-go">
      <span class="cb-chip">otel-go</span>
      <svg class="cb-arrow" viewBox="0 0 60 12"><path class="wire" d="M2 6 H52" /><circle class="wire-dot" cx="55" cy="6" r="3" /></svg>
      <span class="cb-chip lib">otelhttp</span>
      <span class="cb-chip lib">otelgrpc</span>
      <span class="cb-not mono">not hand-rolled spans</span>
    </div>
  </div>
</template>

<style scoped>
.cb { width: 860px; max-width: 100%; margin: 2rem auto 0; display: flex; flex-direction: column; gap: 0.9rem; }
.cb-head { font-size: 0.72rem; color: var(--fg-dim); letter-spacing: 0.04em; }

.cb-frame {
  position: relative; padding: 8px; border-radius: 10px;
  background: var(--o-card);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--o-mist) 14%, transparent);
}
.cb-grid {
  display: grid; grid-auto-flow: column;
  grid-template-rows: repeat(4, 16px); grid-template-columns: repeat(40, 1fr);
  gap: 3px;
}
.cb-t { display: block; position: relative; }
.cb-t i { position: absolute; inset: 0; background: var(--o-mist-tint); opacity: 0; }
.cb-t.free { visibility: hidden; }
.cb-t.flood.sh0 { background: var(--px-shadow); }
.cb-t.flood.sh1 { background: var(--px-olive); }
.cb-t.flood.sh2 { background: var(--px-sage); }
.cb-t.flood.sh3 { background: var(--px-deep); }
.cb-t.keep { background: var(--px-olive); }

/* your conventions sit right after the kept slice: columns 4–5 */
.cb-owngrid {
  position: absolute; top: 8px; left: 8px; right: 8px;
  display: grid; grid-auto-flow: column;
  grid-template-rows: repeat(4, 16px); grid-template-columns: repeat(40, 1fr);
  gap: 3px; pointer-events: none;
}
.cb-own { display: block; background: var(--o-sun); opacity: 0; transform: scale(0.3); }
.cb-owngrid .cb-own:nth-child(-n+4) { grid-column: 4; }
.cb-owngrid .cb-own:nth-child(n+5) { grid-column: 5; }

.cb-caps { position: relative; height: 3.6rem; }
.cb-cap {
  position: absolute; left: 0; white-space: nowrap; font-family: var(--mono); font-size: 0.82rem; color: var(--fg-dim);
}
.cb-cap b { font-weight: 500; color: var(--fg); }
.cb-cap b.sun { color: var(--o-sun); }
.cb-cap-0 { top: 0; }
.cb-cap-1 { top: 0; opacity: 0; }
.cb-cap-2 { top: 1.9rem; opacity: 0; }

.cb-go { display: flex; align-items: center; gap: 0.7rem; margin-top: 1rem; opacity: 0; transform: translateY(10px); }
.cb-chip {
  font-family: var(--mono); font-size: 0.85rem; padding: 0.35em 0.8em; border-radius: 8px;
  background: var(--o-muted); color: var(--fg);
}
.cb-chip.lib { background: var(--card-lime-bg); color: var(--o-sun); }
.cb-arrow { width: 60px; height: 12px; }
.cb-not { font-size: 0.72rem; color: var(--fg-dim); margin-left: 0.5rem; }
</style>
