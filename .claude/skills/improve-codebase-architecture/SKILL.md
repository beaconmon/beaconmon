---
name: improve-codebase-architecture
description: Find deepening opportunities in the beaconmon codebase. Use when the user wants to improve architecture, find refactoring opportunities, consolidate tightly-coupled modules, or make the codebase more testable and easier to extend.
---

# Improve Codebase Architecture

Surface architectural friction in the beaconmon monorepo and propose **deepening opportunities** — refactors that turn shallow modules into deep ones. The aim is testability and maintainability within the constraints of a single-VPS, single-developer stack.

## Vocabulary

Use these terms consistently in every suggestion.

- **Module** — anything with an interface and an implementation (function, file, package, worker process).
- **Interface** — everything a caller must know to use the module: types, invariants, error modes, ordering. Not just the function signature.
- **Depth** — leverage at the interface: a lot of behaviour behind a small surface. **Deep** = high leverage. **Shallow** = interface nearly as complex as the implementation.
- **Seam** — where an interface lives; a place behaviour can be swapped without editing in place.
- **Adapter** — a concrete thing satisfying an interface at a seam (e.g., the email sender vs. the Slack sender in `apps/workers/lib/channels/`).
- **Locality** — change, bugs, and knowledge concentrated in one place rather than scattered across callers.
- **Leverage** — what callers get from depth: more capability per unit of surface they have to learn.

Key tests:

- **Deletion test**: imagine deleting the module. If complexity vanishes, it was a pass-through. If complexity reappears across N callers, it was earning its keep.
- **One adapter = hypothetical seam. Two adapters = real seam.**
- **The interface is the test surface.** If you have to test past the interface, the module is the wrong shape.

## Constraints that must not be re-litigated

These are load-bearing decisions from CLAUDE.md. Any candidate that contradicts them needs to explicitly justify reopening the decision.

- Workers and the web app communicate only through the BullMQ queue or shared DB. No direct HTTP calls between services.
- All DB access goes through repositories. No raw Prisma in route handlers or worker process files.
- No Playwright or headless browsers in the worker fleet. Single VPS, memory is the constraint.
- No microservices. Workers are processes in the same monorepo, not separate repos.
- The scheduler must be a singleton process. Never suggest parallelizing it.
- `check_results` queries must always carry a time-range filter. No full-table scans.

## Known friction points to start from

These are the highest-leverage areas identified in the codebase. Use them as starting candidates, then explore for others.

### 1. Scheduler monolith (`apps/workers/scheduler.ts`, ~955 lines)

The scheduler contains 13 embedded concerns — check scheduling, partition purge, retention cleanup, SLO burn evaluation, trial reminders, deploy expiry, digest enqueuing, and more. Each concern is 40-180 lines of async logic inline in the same file. There is no interface between concerns. Adding or changing one concern requires reading and reasoning about the whole file.

Deepening candidate: extract each concern behind a common scheduler-task interface, so the scheduler's top-level loop becomes a registry of tasks it runs, not an implementation of all of them.

### 2. Anomaly detection embedded in `process-check-job.ts` (lines ~127-223)

~130 lines of Z-score calculation, threshold constants (`ANOMALY_Z_THRESHOLD = 3.0`, `ANOMALY_MIN_SAMPLES = 30`), and alert-enqueue logic live inline inside the check orchestration function. This logic has no interface and cannot be tested independently. It is also plan-gated, but the gate is inline rather than centralized.

Deepening candidate: extract to a module in `packages/checker/` or a dedicated `apps/workers/lib/anomaly.ts` with a typed interface. The interface should hide the Z-score implementation; callers just ask "should this result trigger an anomaly alert?"

### 3. Repository layer split (9 files duplicated across two locations)

Web-facing repositories live in `apps/web/lib/repositories/`. Worker repositories live in `packages/db/src/repositories/`. Nine tables have a file in both locations (`monitors`, `incidents`, `check-results`, `alert-channels`, `content-snapshots`, `deploy-events`, `performance-alerts`, `slo`, `status-pages`). The split is intentional (web repos scope by `teamId`; worker repos trust the queue payload) but the convention is not visible from file names or comments. Developers risk calling the wrong repository for the context.

Deepening candidate: the repositories themselves may be the right shape, but the seam between "team-scoped" and "trusted-payload" operations is invisible. Making that seam explicit (naming, co-location, or a typed wrapper) reduces the risk of misuse without changing the underlying queries.

### 4. Scattered plan limit enforcement

`PLAN_LIMITS` is defined in one place (`packages/types/src/plan.ts`) but enforced at 20+ call sites: API route handlers, repository functions, scheduler logic, and worker process files. Snapshot limits are hardcoded separately instead of read from `PLAN_LIMITS`. There is no single function that answers "is this team allowed to do X?" — callers each re-implement the check.

Deepening candidate: a `PlanGate` module that takes a team's plan and exposes named checks (`canAddMonitor()`, `canUseRegions()`, `retentionCutoffFor()`, etc.). The implementation reads from `PLAN_LIMITS`; callers stop importing the raw constant.

### 5. Alert channel dispatch (`apps/workers/lib/channels/index.ts`)

The current switch statement is clean and the `ChannelSender` interface is well-shaped. This is low friction today (5 channel types). Flag it for re-evaluation if the number of channel types grows past 7, or if channel-level configuration validation (currently done inline) needs to move.

## Process

### 1. Explore

Start with the known candidates above. Then use the Explore agent to walk adjacent areas for fresh friction. Ask:

- Where does understanding one concept require bouncing across many files?
- Where are modules shallow — interface nearly as complex as the implementation?
- Where is business logic embedded in orchestration code rather than behind a named interface?
- Which parts are hard to test because the seam is in the wrong place?

Apply the deletion test to anything suspicious.

### 2. Present candidates as an HTML report

Write a self-contained HTML file to the OS temp directory. Resolve temp dir from `$TMPDIR`, fall back to `/tmp`. Write to `<tmpdir>/architecture-review-<timestamp>.html`. Open it with `open <path>` on macOS. Tell the user the absolute path.

Use **Tailwind via CDN** for layout and **Mermaid via CDN** for graph-shaped diagrams (call graphs, dependency chains). Use hand-built divs and inline SVG for editorial visuals (mass diagrams showing interface vs. implementation size, cross-section layers, collapse animations). Each candidate gets a before/after visualisation. Be visual.

Each candidate is a card with:

- **Files** — which files are involved (monospaced list)
- **Problem** — one sentence. What hurts.
- **Solution** — one sentence. What changes.
- **Wins** — bullets, 6 words max each. Use locality and leverage terms.
- **Before / After diagram** — side by side, drawn in the style that fits the structure
- **Recommendation strength** — `Strong`, `Worth exploring`, or `Speculative` (rendered as a badge)
- **Constraint conflict callout** (amber box) if the candidate touches a load-bearing decision from the list above

End with a **Top recommendation** section: one candidate, one sentence on why.

See [HTML-REPORT.md](HTML-REPORT.md) for the full HTML scaffold, diagram patterns, and tone guidance.

Do NOT propose interfaces yet. After writing the file, ask: "Which of these would you like to explore?"

### 3. Grilling loop

Once the user picks a candidate, walk the design tree with them — constraints, dependency category, the shape of the deepened module, what sits behind the seam, what tests would survive.

Inline side effects as decisions crystallize:

- **Constraint conflict**: if the deepening would violate a CLAUDE.md rule, name the rule explicitly and ask whether it's worth revisiting before going further.
- **New concept name**: if naming a deepened module after something not in CLAUDE.md's domain model, add it. Keep the vocabulary consistent.
- **User rejects with a load-bearing reason**: offer to document it so future explorations don't re-suggest the same thing.
- **Multiple interface shapes are plausible**: see [INTERFACE-DESIGN.md](INTERFACE-DESIGN.md) for the parallel sub-agent pattern.

When assessing how to test a deepened module, classify its dependencies:

- **In-process** (pure functions, in-memory): test directly through the new interface. No adapter needed.
- **Local-substitutable** (Postgres via PGLite, Redis): test with the stand-in running in the test suite. The seam is internal.
- **Owned services** (BullMQ queues, other workers): define a port at the seam. In-memory adapter for tests, real queue adapter in production.
- **External** (Resend, Twilio, Freemius): inject as a typed port. Mock adapter for tests.

Old unit tests on shallow modules become waste once tests at the deepened interface exist. Delete them.
