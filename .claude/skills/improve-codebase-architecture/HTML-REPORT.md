# HTML Report Format

A single self-contained HTML file in the OS temp directory. Tailwind and Mermaid from CDN. No app code, no interactivity beyond Mermaid rendering.

## Scaffold

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Architecture review — beaconmon</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script type="module">
      import mermaid from "https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs";
      mermaid.initialize({ startOnLoad: true, theme: "neutral", securityLevel: "loose" });
    </script>
    <style>
      .seam { stroke-dasharray: 4 4; }
      .leak { stroke: #dc2626; }
      .deep { background: linear-gradient(135deg, #0f172a, #1e293b); }
    </style>
  </head>
  <body class="bg-stone-50 text-slate-900 font-sans">
    <main class="max-w-5xl mx-auto px-6 py-12 space-y-12">
      <header>...</header>
      <section id="candidates" class="space-y-10">...</section>
      <section id="top-recommendation">...</section>
    </main>
  </body>
</html>
```

## Header

Repo name, date, compact legend: solid box = module, dashed line = seam, red arrow = leakage, thick dark box = deep module. No introduction paragraph.

## Candidate card

Each candidate is one `<article>`:

- **Title** — short, names the deepening (e.g. "Extract scheduler tasks behind a common interface")
- **Badge row** — recommendation strength (`Strong` = emerald, `Worth exploring` = amber, `Speculative` = slate), dependency category tag
- **Files** — `font-mono text-sm` list
- **Before / After diagram** — the centrepiece, two columns side by side
- **Problem** — one sentence
- **Solution** — one sentence
- **Wins** — bullets, max 6 words each. Use locality, leverage, interface, seam.
- **Constraint callout** (amber box) if applicable

No paragraphs. If the diagram needs a paragraph to be understood, redraw the diagram.

## Diagram patterns

### Mermaid (dependency or call-flow graphs)

```html
<div class="rounded-lg border border-slate-200 bg-white p-4">
  <pre class="mermaid">
    flowchart LR
      Scheduler --> CheckScheduling
      Scheduler --> PartitionPurge
      Scheduler --> SLOBurn
      Scheduler --> TrialReminders
      classDef leak stroke:#dc2626,stroke-width:2px;
  </pre>
</div>
```

Use for: call graphs, dependency chains, sequence diagrams ("before: 6 round-trips; after: 1").

### Hand-built boxes-and-arrows

Modules as `<div>`s, arrows as inline SVG. Use when you want one thick-bordered deep module with greyed-out internals — Mermaid won't render that with the right weight.

### Mass diagram (interface vs. implementation size)

Two rectangles per module. Before: interface rectangle nearly as tall as implementation (shallow). After: interface rectangle short, implementation tall (deep). Good for showing the anomaly detection candidate.

### Cross-section (layered shallowness)

Horizontal bands showing layers a call passes through. Good for scheduler: before is 13 thin bands; after is the scheduler loop + extracted task modules.

## Style

- Generous whitespace. Editorial, not corporate dashboard.
- Colour: emerald or indigo accent, red for leakage, amber for constraint warnings.
- Diagrams ~320px tall so before/after fits side by side without scrolling.
- Module labels: `text-xs uppercase tracking-wider` inside diagrams.

## Tone

Plain English. Architectural terms come from SKILL.md glossary: module, interface, depth, seam, adapter, leverage, locality.

Never write: "easier to maintain", "cleaner code", "better separation of concerns". Name the gain in glossary terms instead: "locality: bugs concentrate in one module", "leverage: one interface, N call sites".

No hedging. If a sentence could be a bullet, make it a bullet. If a bullet could be cut, cut it.
