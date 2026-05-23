# Interface Design

When the user wants to explore alternative interfaces for a chosen deepening candidate, use this parallel sub-agent pattern. Based on "Design It Twice" (Ousterhout) — your first idea is unlikely to be the best.

## Process

### 1. Frame the problem space

Before spawning sub-agents, explain to the user:

- The constraints the new interface must satisfy (especially any from CLAUDE.md)
- The dependency category (in-process, local-substitutable, owned-service, external)
- A rough illustrative code sketch to make the constraints concrete — not a proposal, just grounding

Show this, then immediately proceed to step 2. The user reads while sub-agents work.

### 2. Spawn sub-agents in parallel

Spawn 3 sub-agents using the Agent tool, each with a radically different design constraint:

- Agent 1: "Minimize the interface — aim for 1-3 entry points. Maximize leverage per entry point."
- Agent 2: "Maximize flexibility — support many use cases and extension points."
- Agent 3: "Optimize for the most common caller — make the default case trivial."

Include in each brief: specific file paths, coupling details, dependency category, and the vocabulary from SKILL.md (module, interface, seam, adapter, leverage, locality). Also include the beaconmon constraints list so sub-agents don't propose banned patterns (no direct HTTP between services, no raw Prisma in workers, etc.).

Each sub-agent outputs:

1. Interface (types, methods, params, invariants, error modes)
2. Usage example from the perspective of the most common caller
3. What the implementation hides behind the seam
4. How it would be tested (which dependency category determines the adapter strategy)
5. Trade-offs — where leverage is high, where it is thin

### 3. Present and compare

Present designs in sequence so the user can absorb each, then compare in prose: depth (leverage at the interface), locality (where change concentrates), seam placement.

Give your own recommendation. Be opinionated. If elements from different designs combine well, propose the hybrid. The user wants a strong read, not a menu.
