<script setup lang="ts">
import { ref } from 'vue'
import gsap from 'gsap'
import { useStepTimeline } from '../composables/useStepTimeline'

/**
 * What auto-instrumentation hands you: a well-formed span with every generic
 * attribute, and none of the business context.
 *
 * s0  the span and its generic attributes
 * s1  "an HTTP call happened" — that part works
 * s2  the business slots that stay empty, and the span multiplied: volume
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const root = ref<HTMLElement>()

const GENERIC = [
  ['http.request.method', 'POST'],
  ['url.path', '/checkout'],
  ['http.response.status_code', '200'],
  ['server.address', 'shop.internal'],
]
const BUSINESS = ['customer.id', 'plan', 'feature_flag']

useStepTimeline(root, () => props.step, (tl) => {
  tl.from('.as-card', { opacity: 0, y: 16 })
  tl.from('.as-bar', { scaleX: 0, transformOrigin: '0% 50%', duration: 0.7, ease: 'power3.out' }, '<0.2')
  tl.from('.as-gen', { opacity: 0, x: -10, stagger: 0.08, duration: 0.35 }, '<0.2')
  tl.from('.as-tag', { opacity: 0, y: -6, stagger: 0.08, duration: 0.3 }, '<')
  tl.addLabel('s0')
  tl.to('.as-gen', { backgroundColor: 'rgba(14, 173, 71, 0.14)', duration: 0.3, stagger: 0.05 })
  tl.from('.as-ok', { opacity: 0, x: -12, duration: 0.45 }, '<0.1')
  tl.addLabel('s1')
  tl.to('.as-gen', { backgroundColor: 'rgba(14, 173, 71, 0)', duration: 0.3 })
  tl.from('.as-ghost', { opacity: 0, y: 0, x: 0, stagger: 0.05, duration: 0.4 }, '<')
  tl.from('.as-biz', { opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0, marginTop: 0, stagger: 0.12, duration: 0.4 }, '<0.1')
  tl.from('.as-miss', { opacity: 0, x: -12, duration: 0.45 }, '<0.2')
  tl.addLabel('s2')
}, () => {
  gsap.to('.as-q', { opacity: 0.25, duration: 0.7, repeat: -1, yoyo: true, ease: 'sine.inOut', stagger: 0.2 })
})
</script>

<template>
  <div ref="root" class="as">
    <div class="as-stack">
      <div v-for="k in 5" :key="k" class="as-ghost" :style="{ transform: `translate(${k * 8}px, ${k * -7}px)`, zIndex: 10 - k }" />
      <div class="as-card">
        <div class="as-head">
          <span class="as-name">POST /checkout</span>
          <span class="as-meta">200 · 182 ms</span>
        </div>
        <div class="as-track"><div class="as-bar" /></div>
        <div class="as-attrs">
          <div v-for="[k, v] in GENERIC" :key="k" class="as-row as-gen">
            <span class="k">{{ k }}</span><span class="v">{{ v }}</span>
          </div>
          <div v-for="k in BUSINESS" :key="k" class="as-row as-biz">
            <span class="k">{{ k }}</span><span class="v as-q">?</span>
          </div>
        </div>
      </div>
    </div>

    <div class="as-notes">
      <div class="as-tags">
        <span class="as-tag">eBPF · OBI</span>
        <span class="as-tag">monkey patching</span>
        <span class="as-tag">bytecode</span>
      </div>
      <div class="as-ok"><lucide-check class="ic ok" /> an HTTP call happened</div>
      <div class="as-miss">
        <div><lucide-circle-help class="ic miss" /> which customer, which plan,<br>which flag?</div>
        <div class="as-label">high volume · low signal</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.as { position: relative; width: 880px; margin: 2.4rem auto 0; display: grid; grid-template-columns: 520px 1fr; column-gap: 3rem; align-items: center; }
.as-tags { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: -0.6rem; }
.as-tag {
  font-family: var(--mono); font-size: 0.65rem; color: var(--o-dim);
  padding: 0.15rem 0.6rem; border-radius: 6px; border: 1px solid var(--o-muted);
}
.as-stack { position: relative; }
.as-ghost {
  position: absolute; inset: 0; border-radius: 12px;
  background: var(--o-card); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--o-mist) 10%, transparent);
  opacity: 0.55;
}
.as-card {
  position: relative; z-index: 20;
  background: var(--o-card); border-radius: 12px; padding: 1rem 1.2rem 1.1rem;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--o-mist) 14%, transparent), 0 18px 40px rgba(0, 0, 0, 0.35);
}
.as-head { display: flex; justify-content: space-between; align-items: baseline; }
.as-name { font-family: var(--mono); font-size: 1.05rem; color: var(--o-mist); }
.as-meta { font-family: var(--mono); font-size: 0.8rem; color: var(--o-dim); }
.as-track { height: 10px; margin: 0.6rem 0 0.7rem; border-radius: 3px; background: var(--o-muted); }
.as-bar { height: 100%; width: 72%; border-radius: 3px; background: var(--o-sun); }
.as-attrs { display: flex; flex-direction: column; gap: 2px; }
.as-row {
  display: flex; justify-content: space-between; gap: 1rem;
  font-family: var(--mono); font-size: 0.76rem; padding: 0.22rem 0.5rem; border-radius: 5px;
}
.as-row .k { color: var(--o-dim); }
.as-row .v { color: var(--o-mist); }
.as-biz { border: 1px dashed color-mix(in srgb, var(--o-sun) 55%, transparent); margin-top: 4px; overflow: hidden; }
.as-biz .k { color: var(--o-sun); }
.as-biz .v { color: var(--o-sun); font-weight: 700; }
.as-notes { display: flex; flex-direction: column; gap: 2.6rem; font-size: 1.15rem; line-height: 1.35; }
.as-ok, .as-miss > div:first-child { display: flex; gap: 0.6rem; align-items: flex-start; }
.ic { flex-shrink: 0; margin-top: 0.2rem; }
.ic.ok { color: var(--o-sprout); }
.ic.miss { color: var(--o-sun); }
.as-label {
  margin-top: 1rem; display: inline-block;
  font-family: var(--mono); font-size: 0.75rem; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--o-forest); background: var(--o-sun); padding: 0.3rem 0.7rem; border-radius: 6px;
}
</style>
