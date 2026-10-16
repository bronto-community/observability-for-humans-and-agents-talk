<script setup lang="ts">
import { ref } from 'vue'
import { useStepTimeline } from '../composables/useStepTimeline'

/**
 * Where the agent's instrumentation knowledge comes from, as three strata.
 * Each layer is narrower and sharper than the one below: steering, and (left
 * unsaid) a fraction of the context.
 *
 * s0  what the model learned: a wide, patchy pixel bed (public, generic, dated)
 * s1  the OpenTelemetry agent skills settle on top: the shared baseline
 * s2  your conventions on top of that: the part no model was trained on
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const root = ref<HTMLElement>()

const COLS = 44
const ROWS = 5
// patchy and uneven: some tiles missing (gaps), the rest in muddy greens
const rnd = (i: number) => { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x) }
const BED = Array.from({ length: COLS * ROWS }, (_, i) =>
  rnd(i) < 0.14 ? -1 : Math.floor(rnd(i + 999) * 4))

useStepTimeline(root, () => props.step, (tl) => {
  tl.from('.sl-tile', { opacity: 0, duration: 0.2, stagger: { each: 0.002, from: 'random' } })
  tl.from('.sl-base .sl-label', { opacity: 0, y: 8, duration: 0.4 }, '-=0.2')
  tl.addLabel('s0')

  tl.from('.sl-otel', { opacity: 0, y: -60, duration: 0.6, ease: 'power3.out' })
  tl.to('.sl-bed', { opacity: 0.55, duration: 0.5 }, '<')
  tl.from('.sl-otel-tag', { opacity: 0, x: -8, duration: 0.35 }, '-=0.15')
  tl.addLabel('s1')

  tl.from('.sl-own', { opacity: 0, y: -60, duration: 0.6, ease: 'power3.out' })
  tl.to('.sl-otel', { opacity: 0.8, duration: 0.5 }, '<')
  tl.from('.sl-own-tag', { opacity: 0, x: -8, duration: 0.35 }, '-=0.15')
  tl.addLabel('s2')
})
</script>

<template>
  <div ref="root" class="sl">
    <div class="sl-row">
      <div class="sl-band sl-own">
        <div class="sl-title">your conventions</div>
        <div class="sl-sub">acme.tenant.id · no raw PII · span naming rules</div>
        <span class="sl-tag sl-own-tag">yours</span>
      </div>
    </div>

    <div class="sl-row">
      <div class="sl-band sl-otel">
        <div class="sl-title">OpenTelemetry agent skills</div>
        <div class="sl-sub">semantic conventions · otel-go · otelhttp, not hand-rolled spans</div>
        <span class="sl-tag sl-otel-tag">baseline</span>
      </div>
    </div>

    <div class="sl-row">
      <div class="sl-base">
        <div class="sl-bed">
          <span v-for="(s, i) in BED" :key="i" class="sl-tile" :class="s < 0 ? 'gap' : `sh${s}`" />
        </div>
        <div class="sl-label">
          <div class="sl-title">what the model learned</div>
          <div class="sl-sub">public · generic · sometimes outdated</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sl { width: 880px; margin: 1.6rem auto 0; display: flex; flex-direction: column; gap: 8px; }
.sl-row { display: flex; justify-content: center; }

.sl-band {
  position: relative; border-radius: 10px; text-align: center;
  display: flex; flex-direction: column; justify-content: center;
}
.sl-own  { width: 400px; height: 74px; background: var(--o-sun); color: var(--o-forest); }
.sl-otel { width: 640px; height: 88px; background: var(--px-mid); color: var(--o-forest); }
.sl-title { font-size: 1.4rem; font-weight: 500; letter-spacing: -0.02em; line-height: 1.15; }
.sl-sub { font-family: var(--mono); font-size: 0.7rem; margin-top: 0.3rem; opacity: 0.8; }

.sl-tag {
  position: absolute; left: calc(100% + 14px); top: 50%; transform: translateY(-50%);
  font-family: var(--mono); font-size: 0.72rem; letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--fg-dim); white-space: nowrap;
}
.sl-own-tag { color: var(--o-sun); }

.sl-base { position: relative; width: 880px; }
.sl-bed {
  display: grid; grid-template-columns: repeat(44, 1fr); grid-template-rows: repeat(5, 22px);
  gap: 3px;
}
.sl-tile.gap { visibility: hidden; }
.sl-tile.sh0 { background: var(--px-deep); }
.sl-tile.sh1 { background: var(--px-shadow); }
.sl-tile.sh2 { background: var(--o-muted); }
.sl-tile.sh3 { background: var(--px-sage); }
.sl-label {
  position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
  padding: 0.55rem 1.4rem; border-radius: 10px; text-align: center;
  background: var(--o-forest); color: var(--o-mist);
}
.sl-label .sl-sub { color: var(--o-dim); opacity: 1; }
</style>
