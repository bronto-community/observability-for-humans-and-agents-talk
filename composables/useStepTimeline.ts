import { onBeforeUnmount, onMounted, watch, type Ref } from 'vue'
import { onSlideEnter, useNav, useSlideContext } from '@slidev/client'
import gsap from 'gsap'

/**
 * One GSAP timeline per diagram, scrubbed by Slidev clicks.
 *
 * The builder lays the animation out once and drops a label `s0`, `s1`, … at
 * the end of each step. A click tweens the timeline to that step's label;
 * going back tweens in reverse, so every step is reversible for free.
 *
 *   s0  is the state the slide lands on (its entrance plays on slide enter)
 *   sN  is the state after click N
 *
 * Print/export and overview thumbnails seek straight to the label, so a PNG
 * export never catches a tween halfway.
 *
 * Ambient loops (packets, pulses) don't belong on the timeline: start them in
 * `ambient`, inside the same gsap.context so they are cleaned up with it.
 */
export function useStepTimeline(
  root: Ref<HTMLElement | SVGElement | undefined>,
  step: () => number,
  build: (tl: gsap.core.Timeline) => void,
  ambient?: () => void,
) {
  const { isPrintMode } = useNav()
  const { $renderContext } = useSlideContext()
  // thumbnails and exports always show the settled state
  const still = () => isPrintMode.value || ['overview', 'previewNext', 'none'].includes($renderContext.value)
  let ctx: gsap.Context | undefined
  let tl: gsap.core.Timeline | undefined

  function labelFor(n: number) {
    if (!tl) return 0
    // clamp to the last label the builder defined
    for (let i = n; i >= 0; i--) {
      const t = tl.labels[`s${i}`]
      if (t !== undefined) return t
    }
    return 0
  }

  function go(instant = false) {
    if (!tl) return
    const t = labelFor(step())
    if (instant || still()) tl.pause().seek(t, false)
    else tl.tweenTo(t, { overwrite: true })
  }

  onMounted(() => {
    ctx = gsap.context(() => {
      tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.out', duration: 0.6 } })
      build(tl)
      ambient?.()
    }, root.value as Element)
    go(true)
  })

  // Slidev keeps slides mounted, so replay the entrance every time we arrive
  // at the start of the slide. Arriving backwards (at the last click) snaps.
  onSlideEnter(() => {
    if (!tl || still()) return
    if (step() === 0) { tl.pause().seek(0, false); go() }
    else go(true)
  })

  watch(step, () => go())
  onBeforeUnmount(() => ctx?.revert())
}
