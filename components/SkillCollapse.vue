<script setup lang="ts">
import { ref } from 'vue'
import gsap from 'gsap'
import { useStepTimeline } from '../composables/useStepTimeline'

/**
 * Level 2: the boilerplate you retype every session becomes a skill.
 *
 * stage 0  six sessions, each opening with the same context and instructions
 *       1  they collapse into one markdown file, with modes up front
 *       2  still reactive: nothing happens until a human walks over and asks
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const root = ref<HTMLElement>()

const SESSIONS = [3, 7, 9, 12, 14, 18]
const BOILER = [
  'You are investigating prod-eu. Use the bronto MCP.',
  'Datasets: checkout, auth, payments.',
  'Never restart services. Ask before writing.',
  'Start from the last 30 minutes.',
]

useStepTimeline(root, () => props.step, (tl) => {
  const cards = gsap.utils.toArray<HTMLElement>('.sk-session')

  tl.from(cards, { autoAlpha: 0, y: 14, stagger: 0.12, duration: 0.4 })
  tl.addLabel('s0')

  // everything slides into where the file will be, then the file takes over
  tl.to(cards.slice().reverse(), { left: 150, top: 54, scale: 0.92, autoAlpha: 0, stagger: 0.05, duration: 0.45, ease: 'power2.in' })
  tl.from('.sk-file', { autoAlpha: 0, scale: 0.94, transformOrigin: '50% 40%', duration: 0.45, ease: 'back.out(1.6)' }, '>-0.1')
  tl.from('.sk-tab', { autoAlpha: 0, y: -6, stagger: 0.08, duration: 0.3 }, '>-0.15')
  tl.addLabel('s1')

  tl.from('.sk-human', { autoAlpha: 0, x: 20, duration: 0.5 })
  tl.from('.sk-wire', { autoAlpha: 0, duration: 0.4 }, '<0.2')
  tl.to('.sk-file', { opacity: 0.72, duration: 0.4 }, '<')
  tl.addLabel('s2')
}, () => {
  gsap.to('.sk-caret', { opacity: 0, duration: 0.5, repeat: -1, yoyo: true, ease: 'steps(1)' })
})
</script>

<template>
  <div ref="root" class="sk">
    <div
      v-for="(n, i) in SESSIONS" :key="n" class="sk-session"
      :style="{ left: 40 + i * 26 + 'px', top: 10 + i * 22 + 'px', zIndex: i }"
    >
      <div class="sk-s-h"><span>session {{ n }}</span><span>new chat</span></div>
      <div v-for="l in BOILER" :key="l" class="sk-line">{{ l }}</div>
    </div>

    <div class="sk-file">
      <div class="sk-tabs">
        <span class="sk-tab on">incident response</span>
        <span class="sk-tab">prevention</span>
        <span class="sk-tab">optimization</span>
      </div>
      <div class="sk-f-h">incident-response.md</div>
      <pre class="sk-md"><span class="fm">---</span>
<span class="k">name:</span> incident-response
<span class="k">description:</span> Investigate a firing alert in prod
<span class="fm">---</span>
<span class="h">## Context</span>
Datasets: checkout, auth, payments
<span class="h">## Rules</span>
- Never restart services
- Start from the last 30 minutes</pre>
    </div>

    <svg class="sk-wire" viewBox="0 0 160 20"><path class="wire" d="M2 10 H158" /><circle class="wire-dot" cx="2" cy="10" r="3.5" /><circle class="wire-dot" cx="158" cy="10" r="3.5" /></svg>

    <div class="sk-human">
      <svg viewBox="0 0 90 110" class="sk-person">
        <circle cx="45" cy="30" r="17" class="head" />
        <path d="M12 104 C 12 72, 26 60, 45 60 C 64 60, 78 72, 78 104" class="body" />
      </svg>
      <div class="sk-ask"><span class="p">›</span><span class="sk-caret" /></div>
      <div class="sk-cap">someone still has to ask</div>
    </div>
  </div>
</template>

<style scoped>
.sk { position: relative; width: 860px; height: 370px; margin: 0.8rem auto 0; }

.sk-session {
  position: absolute; width: 360px;
  background: #fff; border: 1px solid var(--b-hair); border-radius: 12px;
  padding: 0.6rem 0.85rem 0.7rem;
  box-shadow: 0 8px 20px rgba(40, 30, 10, 0.07);
}
.sk-s-h { display: flex; justify-content: space-between; font-family: var(--mono); font-size: 0.58rem; color: var(--b-dim); margin-bottom: 0.4rem; }
.sk-line { font-family: var(--mono); font-size: 0.64rem; line-height: 1.5; color: var(--b-text); }
.sk-line::before { content: '› '; color: var(--b-amber); }

.sk-file {
  position: absolute; left: 150px; top: 0; width: 400px;
  background: #fff; border: 1px solid var(--b-hair); border-radius: 14px;
  box-shadow: 0 16px 36px rgba(40, 30, 10, 0.12);
  overflow: hidden;
}
.sk-tabs { display: flex; gap: 0.35rem; padding: 0.6rem 0.75rem 0; }
.sk-tab {
  font-family: var(--mono); font-size: 0.6rem; padding: 0.25rem 0.6rem; border-radius: 999px;
  background: var(--b-bg); color: var(--b-dim);
}
.sk-tab.on { background: var(--card-amber); color: var(--card-amber-ink); }
.sk-f-h { font-family: var(--mono); font-size: 0.66rem; color: var(--b-ink); font-weight: 600; padding: 0.6rem 0.9rem 0.35rem; border-bottom: 1px solid var(--b-hair); }
.sk-md { margin: 0; padding: 0.6rem 0.9rem 0.8rem; font-family: var(--mono); font-size: 0.68rem; line-height: 1.6; color: var(--b-text); background: none; white-space: pre; }
.sk-md .fm { color: var(--b-dim); }
.sk-md .k { color: var(--b-brown); }
.sk-md .h { color: var(--b-ink); font-weight: 600; }

.sk-wire { position: absolute; left: 556px; top: 150px; width: 120px; height: 16px; overflow: visible; }
.sk-human { position: absolute; left: 690px; top: 82px; width: 150px; display: flex; flex-direction: column; align-items: center; }
.sk-person { width: 76px; height: auto; }
.sk-person .head { fill: var(--b-amber); stroke: var(--b-ink); stroke-width: 1.6; }
.sk-person .body { fill: var(--b-bg); stroke: var(--b-ink); stroke-width: 1.6; stroke-linecap: round; }
.sk-ask { margin-top: 0.6rem; font-family: var(--mono); font-size: 0.8rem; display: flex; gap: 0.4rem; align-items: center; background: var(--b-ink); color: var(--b-amber); padding: 0.3rem 0.7rem; border-radius: 8px; }
.sk-caret { display: inline-block; width: 7px; height: 0.95em; background: var(--b-amber); }
.sk-cap { margin-top: 0.55rem; font-family: var(--mono); font-size: 0.62rem; color: var(--b-dim); text-align: center; }
</style>
