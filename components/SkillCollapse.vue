<script setup lang="ts">
import { ref } from 'vue'
import gsap from 'gsap'
import { useStepTimeline } from '../composables/useStepTimeline'

/**
 * Level 2: the setup you retype every session becomes a skill.
 * The chats are the Level 1 window again; the last one is its question.
 *
 * stage 0  three sessions, each opening with the same four lines of setup
 *       1  the common part is marked in all three
 *       2  it lifts out of the sessions and lands in one markdown file
 *       3  every session is now one command, but someone still types it
 *
 * Everything is placed in px on an 860 × 380 board so the extracted blocks
 * can fly from each card into the file.
 */
const props = withDefaults(defineProps<{ step?: number }>(), { step: 0 })
const root = ref<HTMLElement>()

const SESSIONS = [
  { n: 12, q: 'Payments 5xx are up. What changed?' },
  { n: 14, q: 'Is fraud-check timing out again?' },
  { n: 18, q: 'Why did checkout start failing at 3pm?' },
]
const COMMON = [
  'Investigate prod-eu via the bronto MCP.',
  'Datasets: checkout, payments, fraud-check.',
  'Never restart services.',
  'Start from the last 30 minutes.',
]

// board geometry (px)
const CARD_W = 270
const CARD_GAP = 25
const cardX = (i: number) => i * (CARD_W + CARD_GAP)
const PAD_X = 26 // card border + padding + prompt column
const BLOCK_TOP = 32 // card border + padding + header
const BLOCK_W = CARD_W - PAD_X - 12
const FILE_X = 250
const FILE_W = 360
const FILE_Y = 172
const LAND_X = FILE_X + 15 // where the common lines sit inside the file
const LAND_Y = FILE_Y + 121
const CARD_BOTTOM = 73 // after step 3
const wire = (i: number) => {
  const cx = cardX(i) + CARD_W / 2
  const fx = FILE_X + FILE_W / 2 + (i - 1) * 110
  return `M${cx} ${CARD_BOTTOM} V${(CARD_BOTTOM + FILE_Y) / 2} H${fx} V${FILE_Y}`
}

useStepTimeline(root, () => props.step, (tl) => {
  tl.from('.sk-card', { autoAlpha: 0, y: 14, stagger: 0.12, duration: 0.4 })
  tl.addLabel('s0')

  // 1: the same four lines, in every session
  tl.from('.sk-mark', { autoAlpha: 0, scale: 1.04, stagger: 0.1, duration: 0.35 })
  tl.from('.sk-label', { autoAlpha: 0, y: 6, duration: 0.35 }, '<0.2')
  tl.addLabel('s1')

  // 2: lift them out, land them in the file
  tl.to(['.sk-mark', '.sk-label'], { autoAlpha: 0, duration: 0.25 })
  tl.set('.sk-ghost', { autoAlpha: 1 })
  tl.to('.sk-block', { autoAlpha: 0, duration: 0.01 })
  tl.from('.sk-file', { autoAlpha: 0, y: 12, duration: 0.45 })
  tl.to('.sk-ghost', { left: LAND_X, top: LAND_Y, duration: 0.7, stagger: 0.08, ease: 'power2.inOut' }, '<')
  // on the way down they turn into file lines, so the hand-off is invisible
  const css = getComputedStyle(root.value!)
  tl.to('.sk-ghost', { backgroundColor: '#fff', boxShadow: '0 0 0 rgba(40, 30, 10, 0)', duration: 0.45, stagger: 0.08 }, '<0.3')
  tl.to('.sk-ghost .sk-line', { color: css.getPropertyValue('--b-text').trim(), duration: 0.45 }, '<')
  tl.to('.sk-block', { height: 0, marginBottom: 0, duration: 0.5, ease: 'power2.inOut' }, '<0.2')
  tl.from('.sk-land', { autoAlpha: 0, duration: 0.2 }, '>-0.1')
  tl.to('.sk-ghost', { autoAlpha: 0, duration: 0.2 }, '<')
  tl.addLabel('s2')

  // 3: one command per session, wired to the file
  tl.from('.sk-cmd', { height: 0, autoAlpha: 0, duration: 0.4, stagger: 0.08 })
  tl.from('.sk-wire', { autoAlpha: 0, duration: 0.4, stagger: 0.08 }, '<0.2')
  tl.from('.sk-cap', { autoAlpha: 0, y: 6, duration: 0.4 }, '>0.1')
  tl.addLabel('s3')
})
</script>

<template>
  <div ref="root" class="sk">
    <svg class="sk-wires" viewBox="0 0 860 385">
      <g v-for="(s, i) in SESSIONS" :key="s.n" class="sk-wire">
        <path class="wire" :d="wire(i)" />
        <circle class="wire-dot" :cx="cardX(i) + CARD_W / 2" :cy="CARD_BOTTOM" r="3.5" />
        <circle class="wire-dot" :cx="FILE_X + FILE_W / 2 + (i - 1) * 110" :cy="FILE_Y" r="3.5" />
      </g>
    </svg>

    <div v-for="(s, i) in SESSIONS" :key="s.n" class="sk-card" :style="{ left: cardX(i) + 'px', width: CARD_W + 'px' }">
      <div class="sk-h"><span>session {{ s.n }}</span><span class="tag">bronto · MCP</span></div>
      <div class="sk-msg">
        <span class="p">›</span>
        <div>
          <div class="sk-block">
            <div v-for="l in COMMON" :key="l" class="sk-line">{{ l }}</div>
          </div>
          <div class="sk-cmd">/incident-response</div>
          <div class="sk-line">{{ s.q }}</div>
        </div>
      </div>
    </div>

    <div
      v-for="(s, i) in SESSIONS" :key="'m' + s.n" class="sk-mark"
      :style="{ left: cardX(i) + PAD_X - 6 + 'px', top: BLOCK_TOP - 5 + 'px', width: BLOCK_W + 10 + 'px' }"
    />
    <div class="sk-label">identical in every session</div>

    <div class="sk-file" :style="{ left: FILE_X + 'px', top: FILE_Y + 'px', width: FILE_W + 'px' }">
      <div class="sk-tabs">
        <span class="sk-tab on">incident-response.md</span>
        <span class="sk-tab">prevention.md</span>
        <span class="sk-tab">optimization.md</span>
      </div>
      <div class="sk-md">
        <div class="fm">---</div>
        <div><span class="k">name:</span> incident-response</div>
        <div><span class="k">description:</span> Investigate a failure in prod</div>
        <div class="fm">---</div>
        <div class="sk-land">
          <div v-for="l in COMMON" :key="l">{{ l }}</div>
        </div>
      </div>
    </div>

    <div
      v-for="(s, i) in SESSIONS" :key="'g' + s.n" class="sk-ghost"
      :style="{ left: cardX(i) + PAD_X + 'px', top: BLOCK_TOP + 'px', width: BLOCK_W + 16 + 'px' }"
    >
      <div v-for="l in COMMON" :key="l" class="sk-line">{{ l }}</div>
    </div>

    <div class="sk-cap" :style="{ left: FILE_X + 'px', width: FILE_W + 'px' }">someone still has to type it</div>
  </div>
</template>

<style scoped>
.sk { position: relative; width: 860px; height: 385px; margin: 0.6rem auto 0; }
.sk-wires { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }

.sk-card {
  position: absolute; top: 0;
  background: var(--b-ink); color: var(--b-bg);
  border-radius: 12px; padding: 9px 11px 10px; border: 1px solid var(--b-ink);
  box-shadow: 0 12px 28px rgba(40, 30, 10, 0.16);
  font-family: var(--mono);
}
.sk-h { display: flex; justify-content: space-between; height: 16px; margin-bottom: 6px; font-size: 0.54rem; color: color-mix(in srgb, var(--b-bg) 50%, transparent); }
.sk-h .tag { color: var(--b-amber); }

/* one message per session: a single prompt, every line in the same type.
   The flying copies use the same type so they read as the same lines. */
.sk-msg { display: flex; }
.sk-msg > .p { flex: 0 0 14px; color: var(--b-amber); font-weight: 600; font-size: 0.56rem; line-height: 15px; }
.sk-line { font-size: 0.56rem; line-height: 15px; white-space: nowrap; color: var(--b-bg); }
.sk-block { height: 60px; margin-bottom: 4px; overflow: hidden; }
.sk-ghost { box-sizing: border-box; height: 72px; overflow: hidden; }
.sk-cmd { height: 15px; overflow: hidden; font-size: 0.56rem; line-height: 15px; color: var(--b-amber); }

.sk-mark {
  position: absolute; box-sizing: border-box; height: 70px; z-index: 5;
  border: 1.5px dashed var(--b-amber); border-radius: 7px;
}
.sk-label { position: absolute; left: 0; right: 0; top: 150px; text-align: center; font-family: var(--mono); font-size: 0.66rem; color: var(--b-brown); }

.sk-ghost {
  position: absolute; z-index: 20; visibility: hidden; padding: 6px 8px; margin: -6px 0 0 -8px; font-family: var(--mono);
  background: var(--b-ink); border-radius: 7px; box-shadow: 0 10px 24px rgba(40, 30, 10, 0.25);
}

.sk-file {
  position: absolute; z-index: 2;
  background: #fff; border: 1px solid var(--b-hair); border-radius: 14px;
  box-shadow: 0 16px 36px rgba(40, 30, 10, 0.12);
  overflow: hidden;
}
.sk-tabs { display: flex; gap: 0.3rem; padding: 9px 11px 8px; border-bottom: 1px solid var(--b-hair); }
.sk-tab { font-family: var(--mono); font-size: 0.55rem; padding: 0.22rem 0.5rem; border-radius: 999px; background: var(--b-bg); color: var(--b-dim); }
.sk-tab.on { background: var(--card-amber); color: var(--card-amber-ink); font-weight: 600; }
.sk-md { padding: 8px 14px 10px; font-family: var(--mono); font-size: 0.56rem; line-height: 15px; color: var(--b-text); }
.sk-md .fm { color: var(--b-dim); }
.sk-md .k { color: var(--b-brown); }
.sk-land { padding: 6px 0 0; }

.sk-cap { position: absolute; top: 368px; text-align: center; font-family: var(--mono); font-size: 0.62rem; color: var(--b-dim); }
</style>
