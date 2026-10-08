<script setup lang="ts">
import { ref } from 'vue'
import { useStepTimeline } from '../composables/useStepTimeline'
import PixelField from './PixelField.vue'

/**
 * The two halves of observability, each on its own company's canvas.
 * Click 1: the pill that bridges the seam.
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const root = ref<HTMLElement>()

useStepTimeline(root, () => props.step, (tl) => {
  tl.from('.th-half', { opacity: 0, duration: 0.5, stagger: 0.15 })
  tl.from('.th-body', { opacity: 0, y: 14, stagger: 0.15 }, '<0.2')
  tl.addLabel('s0')
  tl.from('.th-bridge', { opacity: 0, scale: 0.8, duration: 0.5, ease: 'back.out(2)' })
  tl.addLabel('s1')
})
</script>

<template>
  <div ref="root" class="th">
    <section class="th-half olly-half">
      <PixelField edges="lb" :depth="0.13" :cols="12" :rows="14" :seed="9" :glyphs="0.1" />
      <div class="th-body">
        <img src="/img/ollygarden-logo-light.svg" alt="OllyGarden" class="th-logo olly-logo" />
        <div class="th-title">Instrumentation</div>
        <div class="th-sub">the code that makes software<br>emit telemetry</div>
      </div>
    </section>
    <section class="th-half bronto-half">
      <div class="th-body">
        <img src="/img/bronto-logo.webp" alt="Bronto" class="th-logo bronto-logo" />
        <div class="th-title">Analysis</div>
        <div class="th-sub">using that telemetry<br>to answer questions</div>
      </div>
    </section>
    <div class="th-bridge-wrap"><div class="th-bridge">everything here works on plain OpenTelemetry</div></div>
  </div>
</template>

<style scoped>
.th { position: absolute; inset: 0; display: grid; grid-template-columns: 1fr 1fr; }
.th-half { position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; }
.olly-half { background: var(--o-forest); color: var(--o-mist); }
.bronto-half { background: var(--b-bg); color: var(--b-ink); }
.th-body { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: flex-start; gap: 0.9rem; width: 300px; margin-bottom: 2.5rem; }
.olly-half .th-body { margin-left: 4.2rem; }
.th-logo.olly-logo { height: 24px; }
.th-logo.bronto-logo { height: 34px; margin-top: -6px; margin-bottom: -4px; }
.th-title { font-size: 2.6rem; line-height: 1; letter-spacing: -0.03em; font-weight: 500; }
.olly-half .th-title { font-family: var(--grotesk); }
.bronto-half .th-title { font-family: var(--serif); letter-spacing: -0.02em; }
.th-sub { font-family: var(--mono); font-size: 0.8rem; line-height: 1.5; }
.olly-half .th-sub { color: var(--o-dim); }
.bronto-half .th-sub { color: var(--b-dim); }
.th-bridge-wrap { position: absolute; left: 50%; bottom: 4.2rem; transform: translateX(-50%); z-index: 3; }
.th-bridge {
  white-space: nowrap;
  padding: 0.7rem 1.4rem; border-radius: 999px;
  background: var(--o-sun); color: var(--o-forest);
  font-family: var(--mono); font-size: 0.9rem; font-weight: 500;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}
</style>
