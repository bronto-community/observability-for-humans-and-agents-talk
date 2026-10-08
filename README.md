# Observability for Humans and Agents in the AI Age

Slides for the OllyGarden × Bronto talk, built from the joint blog post:

- https://bronto.io/blog/observability-for-humans-and-agents-in-the-ai-age
- https://ollygarden.com/resources/blog/observability-for-humans-and-agents-in-the-ai-age

The deck covers the theory. Two live demos sit between its halves:

1. **Instrumentation** (Nicolas Wörner, OllyGarden): instrumenting with Rose and the
   [OpenTelemetry agent skills](https://github.com/ollygarden/opentelemetry-agent-skills)
2. **Analysis** (Severin Neumann, Bronto): the [AI SRE lab](https://aisre-lab.vercel.app/)

## Run

```sh
npm install
npm run dev      # http://localhost:3030, presenter view at /presenter
npm run build    # static SPA in dist/
npm run export   # PDF
```

Built with [Slidev](https://sli.dev). Diagrams are Vue components animated with
[GSAP](https://gsap.com), stepped by slide clicks
(`composables/useStepTimeline.ts`). See `CLAUDE.md` for the deck's conventions.
