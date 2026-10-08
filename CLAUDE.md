# Working on this deck

Theory part of the OllyGarden × Bronto talk "Observability for Humans and Agents in
the AI Age", built from the joint blog post
(bronto.io/blog/observability-for-humans-and-agents-in-the-ai-age). Two live demos
sit in between and are not part of this deck: Nico (OllyGarden Rose / OTel agent
skills) after the instrumentation half, Severin (aisre-lab.vercel.app) after the
analysis half.

## Slides carry one thing. Everything else is speaker notes.

A slide is read while somebody talks over it. Anything supporting rather than *the
point* goes into the `<!-- -->` notes block. No footers, no source lines, no
caveats, no secondary explanation line. Sources live in the notes.

## Vary the visual form

Two consecutive slides should not share a layout. Pick the form the idea wants: a
drawn diagram, a bare statement, a pixel-garden canvas, a chat, a chart.

## Three canvases, one deck

- **Joint** (default): beige dot grid, the cover-art look. Framing slides.
- **`class: olly`**: OllyGarden forest canvas, Space Grotesk, sunflower accent.
  The instrumentation half (Nico).
- **`class: bronto`**: Bronto off-white canvas, Source Serif display, amber/brown
  accents. The analysis half (Severin).

Every slide sets `--fg`, `--fg-dim`, `--accent` through its canvas class, so
components should use those (plus the brand tokens in `style.css`) and work on the
canvas they are placed on. Never hardcode hex outside `style.css` and
`PixelField.vue`'s palette.

The diagram idiom comes from the blog figures: soft rounded cards with a bold title
and a mono subtitle, brown dotted connectors (`--wire`) ending in filled dots, lime
cards for human checkpoints, amber cards for inputs, neutral cards for agent steps.

## Animation: GSAP, driven by clicks

Diagrams are SVG/HTML animated with GSAP (3.13+ is free incl. DrawSVG, MotionPath,
MorphSVG, SplitText). Each component takes `step` (`:step="$clicks"`; set
`clicks: N` in the slide frontmatter) and builds one paused timeline through
`composables/useStepTimeline.ts`:

```ts
const root = ref<HTMLElement>()
useStepTimeline(root, () => props.step ?? 0, (tl) => {
  tl.from('.a', { opacity: 0, y: 12 })   // entrance
  tl.addLabel('s0')
  tl.to('.b', { ... })                   // click 1
  tl.addLabel('s1')
}, () => { /* ambient loops: packets, pulses */ })
```

Selectors are scoped to `root` by `gsap.context`. Clicks tween to the label, going
back reverses, exports and overview thumbnails seek to the settled state.
Ambient loops are fine as long as the slide reads identically without them
(exports catch a random frame). For simple reveals use Slidev's `v-click`.

## Verify by looking at the render

`slidev build` passing says nothing about fit. Export PNGs and look:

```
npx slidev export --format png --range 7,8 --with-clicks --output <scratch>/x
```

The canvas is 980 × 552 logical px.

## Markdown / Vue traps (inherited from the other Bronto decks)

- A blank line before a 4-space-indented line inside an HTML block ends the block.
- Inline `style="--var: x"` inside an HTML block in `slides.md` can hang the build.
  Put that markup in a component.
- Slidev keeps slides mounted; `useStepTimeline` already replays on slide enter.
- Slide-level `<style>` competes with the default theme's `.slidev-layout p`
  rules. Prefix with `.slidev-layout` when a rule doesn't take.
- Interactive controls: `@keydown.stop` / `@click.stop` so they don't fight
  navigation. `global-top.vue` releases focus after clicks.

## Commits

Use an `Assisted-By:` trailer for AI attribution, never `Co-Authored-By:` (EasyCLA).
