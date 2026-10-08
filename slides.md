---
theme: default
title: Observability for Humans and Agents in the AI Age
info: |
  ## Observability for Humans and Agents in the AI Age
  OllyGarden × Bronto. Where agents help with instrumentation and analysis,
  and why they only work when the telemetry underneath is intentional,
  trustworthy and easy to access. Theory part; two live demos sit in between.
colorSchema: light
transition: fade
mdc: true
class: text-left
favicon: /img/bronto-dino.png
fonts:
  sans: Radio Canada Big, Space Grotesk
  serif: Source Serif 4
  mono: Geist Mono
  weights: '300,400,500,600,700'
---

<PixelField edges="r" :depth="0.4" :cols="16" :rows="9" tone="light" :seed="11" :glyphs="0.1" />

<div class="title-wrap">
  <div class="chip">OllyGarden × Bronto</div>

# Observability for humans<br>and agents in the AI age

  <div class="byline">
    <div><b>Nicolas Wörner</b><span>Founding Software Engineer, OllyGarden</span></div>
    <div><b>Severin Neumann</b><span>Head of Community, Bronto</span></div>
  </div>
</div>

<div class="logos">
  <img src="/img/ollygarden-logo-dark.svg" alt="OllyGarden" class="lg-olly" />
  <span class="x">×</span>
  <img src="/img/bronto-logo.webp" alt="Bronto" class="lg-bronto" />
</div>

<style>
.title-wrap { position: relative; z-index: 2; margin-top: 2.2rem; }
.title-wrap h1 { font-size: 3rem; line-height: 1.04; margin: 1.1rem 0 1.8rem; max-width: 36rem; }
.title-wrap .chip { --accent: var(--b-brown); background: var(--b-bg); }
.byline { display: flex; gap: 2.6rem; }
.byline div { display: flex; flex-direction: column; gap: 0.15rem; }
.byline b { font-weight: 600; font-size: 1.05rem; }
.byline span { font-family: var(--mono); font-size: 0.7rem; color: var(--b-dim); }
.logos { position: absolute; left: 3.5rem; bottom: 2.4rem; z-index: 2; display: flex; align-items: center; gap: 0.9rem; }
.lg-olly { height: 22px; }
.lg-bronto { height: 30px; }
.x { font-family: var(--mono); color: var(--b-dim); }
</style>

<!--
Nico and Severin introduce themselves. One line each on what the company does:
OllyGarden works on the instrumentation side, Bronto on the analysis side.

Frame the talk: this is the blog post we wrote together, as a talk, plus two demos.
Theory first, then Nico shows instrumentation, then Severin shows analysis.
-->

---
layout: center
clicks: 3
---

# Agents across the whole lifecycle

<AgentsEverywhere :step="$clicks" />

<!--
Look around and it can feel like everyone is using LLMs for everything. In
software, that impression is close to true.

1  Teams build applications with agents.
2  They instrument them with agents.
3  And when the application goes live, another set of agents handles the incidents.
-->

---
layout: center
clicks: 2
---

<Spectrum :step="$clicks" />

<!--
You might already live in that reality, with agents across your whole SDLC.

You might be at the other end: doing all of this without AI. Not by hand, you
already have a high degree of automation, just without a model in the loop.

1  Or you sit somewhere in between,
2  and ask the obvious question: what is the next thing worth handing to an agent,
   and which parts are a hype trap?
-->

---
layout: full
clicks: 1
---

<TwoHalves :step="$clicks" />

<!--
We want to answer that in the one area where we can claim to be subject-matter
experts: observability. Two pieces of it.

Instrumentation: the code you add so your software emits telemetry, so someone can
later ask questions about it. That's Nico, OllyGarden.

Analysis: using that telemetry to answer those questions. Fix issues, prevent
them, make the system better. That's Severin, Bronto.

1  We both sell products in these halves, and we think they are good. But
   everything in this talk works on plain OpenTelemetry, customer or not.
-->

---
layout: center
clicks: 3
---

<div class="thesis">
  <p class="statement-text">Agents help with both, but only when the telemetry is</p>
  <div class="words">
    <span v-click="1">intentional</span>
    <span v-click="2">trustworthy</span>
    <span v-click="3">easy to access</span>
  </div>
</div>

<style>
.slidev-layout .thesis .statement-text { font-size: 2.6rem; max-width: 40rem; }
.words { display: flex; gap: 1.4rem; margin-top: 1.6rem; }
.words span {
  font-family: var(--mono); font-size: 1.15rem; padding: 0.45em 1em; border-radius: 12px;
  background: var(--card-lime); color: var(--card-lime-ink);
  box-shadow: 0 1px 0 rgba(0,0,0,0.06);
}
.words span:nth-child(2) { background: var(--card-amber); color: var(--card-amber-ink); }
.words span:nth-child(3) { background: var(--b-bg); color: var(--b-ink); }
</style>

<!--
The thesis of the whole talk, so say it slowly.

1  Intentional: someone decided this telemetry is worth emitting. (Instrumentation.)
2  Trustworthy: it's complete, it's not sampled away, it means what it says.
3  Easy to access: the agent can reach it, fast, as a tool call. (Analysis.)

So: at which levels can you put LLMs to work on instrumentation and analysis?
Nico starts.
-->

---
layout: center
class: olly
---

<PixelField edges="lrtb" :depth="0.22" :cols="32" :rows="18" :seed="3" />

<div class="section">
  <div class="chip">How we use agents at OllyGarden</div>
  <h1>Instrumentation</h1>
</div>

<style>
.section { position: relative; z-index: 2; text-align: center; }
.section h1 { font-size: 4.2rem; margin-top: 1rem; }
</style>

<!--
NICO

The short version of what works for us (and probably for you):

- Use coding agents during local development for manual instrumentation
- Be careful with business context: deciding what matters is still mostly on you
- Use agent skills, enriched with your own conventions
- Make instrumentation part of the SDLC: agentic PR reviews, a background agent,
  and if you want the next level, let it create fixes autonomously
-->

---
layout: center
class: olly
clicks: 2
---

# Auto-instrumentation

<AutoSpan :step="$clicks" />

<!--
Most codebases that use OpenTelemetry get it through auto-instrumentation: eBPF
(OBI), monkey patching (the Python agent), bytecode manipulation (the Java agent).

It works, and it's a quick way to get baseline telemetry.

1  You can see that an HTTP call happened...
2  ...but not which customer, which plan, or which feature flag it ran under.
   Auto-instrumentation captures generic data and cannot capture business context.
   High volume, low signal.
-->

---
layout: center
class: olly
clicks: 2
---

# Manual instrumentation

<ManualCost :step="$clicks" />

<!--
Manual instrumentation is the opposite: engineers decide which telemetry is useful.

Two questions drive it:
- Could this be relevant during a 3 a.m. outage? Then instrument it proactively.
- Could this attribute expose sensitive data? If in doubt, redact at the source.

1  The theory sounds great. The reality: it's not trivial.
2  Done right it needs consistency across application boundaries, correct context
   propagation, OpenTelemetry domain knowledge, and engineers with the time and
   knowledge to maintain it.
-->

---
layout: center
class: olly
clicks: 1
---

<div class="cheap">
  <p class="statement-text">Code is cheap now. To an agent, instrumentation is <em>&ldquo;just code.&rdquo;</em></p>
  <p v-click="1" class="solved">Solved? <span>Not yet.</span></p>
</div>

<style>
.slidev-layout .cheap .statement-text { max-width: 44rem; }
.solved { font-family: var(--grotesk); font-size: 2rem; margin-top: 2rem; color: var(--o-dim); }
.solved span { color: var(--o-sun); }
</style>

<!--
For an AI agent there's little difference between adding a feature and
instrumenting an application with OpenTelemetry. At the end of the day it's
just code.

1  So if code, and therefore manual instrumentation, has become cheap, is
   instrumentation solved? Unfortunately no. At least not yet.
-->

---
layout: center
class: olly
clicks: 3
---

# What agents get right, and what they don't

<WhatAgentsKnow :step="$clicks" />

<!--
A recent study found that LLMs still struggle to decide what to instrument and
how to instrument it effectively. (arxiv.org/pdf/2607.05785)

1  They have learned that exceptions matter.
2  They have learned that network calls matter.
3  They are not reliable at deciding which business context matters. That part is
   still (mostly) on you.
-->

---
layout: center
class: olly
clicks: 2
---

# Agent skills

<ContextBudget :step="$clicks" />

<!--
An obvious yet impactful improvement: give agents dedicated agent skills. One
example is the OllyGarden OpenTelemetry agent skills
(github.com/ollygarden/opentelemetry-agent-skills).

They steer the agent and make sessions cheaper and faster.

1  otel-semantic-conventions helps the agent navigate the large semconv registry
   without pulling the whole thing into context: it finds the released attribute
   names and span naming rules at a fraction of the tokens. Language skills like
   otel-go point it at contrib libraries (otelhttp, otelgrpc) instead of
   hand-rolled spans.
2  Then extend them with your organization's conventions and instrumentation
   guidelines. That knowledge isn't in the training data, so the model can't know
   it unless you provide it. In our experience, one of the highest-leverage
   things you can do.
-->

---
layout: center
class: olly
clicks: 5
---

# Instrumentation belongs in the SDLC

<SdlcPipeline :step="$clicks" />

<!--
Manual instrumentation is business-relevant code; treat it accordingly.

1  Local development: skills add your conventions.
2  PR review: just as an agent reviews code changes, it takes a focused look at
   existing or missing instrumentation. Flying blind after merge? Catch it before.
   Same for over-instrumentation. Most AI code review tools catch basics; custom
   instructions push them further.
3  Background agent: watches the whole codebase continuously.
4  Autonomous PRs: closing the loop, the same process raises PRs on its own.
5  Human review: always. Agents love to over-instrument or apply inconsistent
   conventions.
-->

---
layout: center
class: olly
clicks: 3
---

<CodebaseScan :step="$clicks" />

<!--
Why the PR review isn't enough on its own.

1  A PR only shows a small part of the picture.
2  The instrumentation surface of a change sometimes spans (pun intended) the whole
   codebase, and a diff alone isn't enough context to judge it.
3  So an agent runs continuously in the background, watches how instrumentation
   evolves alongside the code, and surfaces gaps and over-instrumentation before
   they hurt you.
-->

---
layout: center
class: olly
---

<PixelField edges="b" :depth="0.18" :cols="32" :rows="18" :seed="21" :glyphs="0.12" />

<p class="statement-text take">Adding instrumentation got <em>easy</em>.<br>Making it purposeful and consistent still takes oversight, guidance and time.</p>

<style>
.slidev-layout .take { position: relative; z-index: 2; font-size: 2.6rem; max-width: 46rem; margin-top: -3rem; }
</style>

<!--
Overall: introducing manual instrumentation has gotten a lot easier thanks to
agents. Applying purposeful and consistent manual instrumentation still requires
oversight, guidance and time.

Hand over to the demo.
-->

---
layout: center
class: olly
---

<PixelField edges="lr" :depth="0.2" :cols="32" :rows="18" :seed="5" />

<div class="demo">
  <div class="demo-kicker">Demo · Nico</div>
  <h1>Instrumenting with Rose<br>and the OpenTelemetry agent skills</h1>
  <p class="mono dim">github.com/ollygarden/opentelemetry-agent-skills</p>
</div>

<style>
.demo { position: relative; z-index: 2; text-align: center; }
.demo h1 { font-size: 2.8rem; margin: 0.9rem 0 1.2rem; }
.demo p { font-size: 0.85rem; }
</style>

<!--
DEMO 1 — Nico. Placeholder; Nico owns this slide.
-->

---
layout: center
class: bronto
---

<div class="b-section">
  <img src="/img/bronto-sitting.webp" class="b-dino" alt="" />
  <div class="chip">How we use agents at Bronto</div>
  <h1>Analysis</h1>
</div>

<style>
.b-section { position: relative; text-align: center; }
.b-section .chip { --accent: var(--b-brown); }
.b-section h1 { font-size: 4.2rem; margin-top: 1rem; }
.b-dino { width: 9rem; margin: 0 auto 1.2rem; mix-blend-mode: multiply; }
</style>

<!--
SEVERIN

The primary use case for observability data has always been incident response.
-->

---
layout: center
class: bronto
clicks: 2
---

# The gap grows with your system

<TimeToWhy :step="$clicks" />

<!--
Something behaves in a way you didn't want. Someone gets notified, and starts
digging: suspicious logs, slow traces, a metric bending the wrong way.

1  It's tedious work and it gets slower as the environment grows.
2  The gap between "the issue appeared" and "we know why" grows with the size of
   your system.
-->

---
layout: center
class: bronto
clicks: 2
---

# Level 1 · Ask

<ChatLevel :step="$clicks" />

<!--
When LLMs arrived the obvious first move was a chat box in the observability
product. Explain what you're looking at, find the evidence, produce hypotheses.

If you've never tried it, start there. No built-in chat? Connect a general-purpose
model over MCP or a CLI and ask the questions you'd have clicked your way to.

1  Don't stop at incidents: bottlenecks and optimization. Which service takes the
   most time on the critical path of a payment? If retention is long enough: which
   services were used less over the last three months?
2  Have it build dashboards, or vibe-code a whole custom UI on your data. All by
   asking, all faster than by hand.
-->

---
layout: center
class: bronto
clicks: 2
---

# Level 2 · Skills

<SkillCollapse :step="$clicks" />

<!--
Run that way for a while and you notice the repetition: same questions, same
context, same instructions and restrictions, typed again every session.

1  That's what skills are for: markdown files you write once and hand to the model
   whenever it does that task. Write your own or start from community examples.
   Analysis starts to feel like programming: you tell it up front whether this is
   incident response, prevention or optimization, and it comes with the right
   assumptions.
2  Still reactive, though. A human has to walk over to the machine and ask.
-->

---
layout: center
class: bronto
clicks: 4
---

# Level 3 · Agentic workflow

<AgentWorkflow :step="$clicks" />

<!--
Once you know where the model helps and where it doesn't, drop the reactive part.

1  For a defined set of well-understood alerts, add a trigger that hands the alert
   to an agent with instructions to investigate. LLM-powered runbooks.
2  Give it skills, a few CLI tools and the MCP servers it needs.
3  It comes back with hypotheses and candidate fixes on its own.
4  Your job: review the output, accept what holds up, tune the agent for next time.

That's the first generation of "AI SRE" products at its core: a domain-specific
agent with defined inputs, tools and outputs. Some platforms ship it; you can build
your own with n8n or an agent framework like AWS Strands Agents.
-->

---
layout: center
class: bronto
clicks: 4
---

<MaturityLadder :step="$clicks" />

<!--
Recap the path: manual, chat, skills, agentic workflow.

4  From here the remaining gains are almost entirely about inputs, tools, and the
   quality of what you feed it. Those choices matter far more than which model or
   harness you picked.
-->

---
layout: center
class: bronto
clicks: 2
---

# Inputs: alerts get expensive

<AlertStorm :step="$clicks" />

<!--
Alerts were a hard problem when humans were the only consumers. They don't get
easier with agents, they get more expensive.

1  An alert storm that fans out into hundreds of agent investigations drains a
   token budget in an afternoon.
2  You can gate it with suppression or a triage agent in front. The real fix is the
   same as it always was: alert on a clear signal.
-->

---
layout: center
class: bronto
clicks: 3
---

# Tools and data: where the halves meet

<Fidelity :step="$clicks" />

<!--
Your agent can only find what's in your data, and this is where the two halves of
the talk meet.

1  Instrumentation decides whether the answer exists.
2  Your backend decides whether the agent can reach it, how fast, at what fidelity.
3  An agent waiting on a rehydration job, or handed a one-percent sample and asked
   to explain one customer's failed request, does what agents do when evidence is
   thin: a confident, well-written hypothesis that happens to be wrong.
-->

---
layout: center
class: bronto
---

<div class="demo b-demo">
  <img src="/img/dino-scientist.png" class="b-dino-sm" alt="" />
  <div class="demo-kicker">Demo · Severin</div>
  <h1>Build your own AI SRE</h1>
  <p class="mono dim">aisre-lab.vercel.app</p>
</div>

<style>
.b-demo { text-align: center; }
.b-demo .demo-kicker { color: var(--b-brown); }
.b-demo h1 { font-size: 3rem; margin: 0.9rem 0 1.1rem; }
.b-dino-sm { width: 7rem; margin: 0 auto 1rem; mix-blend-mode: multiply; }
</style>

<!--
DEMO 2 — Severin. Switch to aisre-lab.vercel.app.
-->

---
layout: center
clicks: 3
---

# From "human only" to "mostly agents"

<BuildingBlocks :step="$clicks" />

<!--
If you're an SRE or in ITOps, this isn't the part where your job disappears. It
changes shape.

1  Instead of working through the tasks yourself, you orchestrate the agents that do.
2  Your real work becomes improving that workflow, upgrading the building blocks
   underneath it,
3  one at a time, as you find the weak one.

You can build some blocks yourself, or get help: OllyGarden's Rose reviews your
OpenTelemetry, adds what's missing and fixes what's off, continuously, so the
telemetry your agents read was written on purpose. Bronto: full fidelity, no
sampling, 12 months hot retention by default, sub-second search across petabytes,
and MCP so logs, metrics and traces are a first-class tool call.
-->

---
layout: center
---

<PixelField edges="r" :depth="0.26" :cols="16" :rows="9" tone="light" :seed="17" :glyphs="0.1" />

<p class="statement-text sre">Site reliability engineering has always been about better automation.<br><em>Agents are what that looks like in 2026.</em></p>

<style>
.slidev-layout .sre { position: relative; z-index: 2; font-size: 2.4rem; max-width: 36rem; margin-left: -6rem; }
.sre em { color: var(--b-brown); }
</style>

<!--
SRE has always been about making systems reliable and scalable through better
automation. Using agents for it is just what that looks like in 2026.
-->

---
layout: center
---

<div class="thanks">
  <div class="th-q">
    <h1>What works for you?<br>What doesn't?</h1>
    <p class="dim">Tell us where we got it wrong.</p>
  </div>
  <div class="th-links">
    <div class="th-card">
      <QrCode url="https://bronto.io/blog/observability-for-humans-and-agents-in-the-ai-age" :size="118" />
      <span class="mono">the blog post</span>
    </div>
    <div class="th-card">
      <QrCode url="https://github.com/ollygarden/opentelemetry-agent-skills" :size="118" />
      <span class="mono">OTel agent skills</span>
    </div>
    <div class="th-card">
      <QrCode url="https://aisre-lab.vercel.app" :size="118" />
      <span class="mono">AI SRE lab</span>
    </div>
  </div>
</div>

<div class="logos">
  <img src="/img/ollygarden-logo-dark.svg" alt="OllyGarden" class="lg-olly" />
  <span class="x">×</span>
  <img src="/img/bronto-logo.webp" alt="Bronto" class="lg-bronto" />
</div>

<style>
.thanks { display: grid; grid-template-columns: 1fr auto; gap: 3rem; align-items: center; }
.th-q h1 { font-size: 2.8rem; }
.th-q p { margin-top: 1rem; font-size: 1.1rem; }
.th-links { display: flex; flex-direction: column; gap: 0.8rem; }
.th-card { display: flex; align-items: center; gap: 1rem; background: var(--b-bg); padding: 0.6rem 1rem 0.6rem 0.6rem; border-radius: 14px; }
.th-card span { font-size: 0.8rem; color: var(--b-ink); }
.logos { position: absolute; left: 3.5rem; bottom: 2.4rem; display: flex; align-items: center; gap: 0.9rem; }
.lg-olly { height: 22px; }
.lg-bronto { height: 30px; }
.x { font-family: var(--mono); color: var(--b-dim); }
</style>

<!--
We shared our perspectives as experts on instrumentation (OllyGarden) and analysis
(Bronto). We're curious about yours. What works, what doesn't? Did we miss
something important?
-->
