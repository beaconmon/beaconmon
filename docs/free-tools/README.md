# Free Tools: Agent Implementation Guide

Each file in this directory is a self-contained spec for one free marketing tool built inside Beaconmon. Hand the relevant file to a Claude Code agent session and it can implement the tool end-to-end without needing context from this README.

## Purpose

Free tools are SEO and lead-gen assets. Each one:
- Targets a specific keyword cluster with no strong existing competitor
- Solves a real problem for Shopify/WooCommerce store owners
- Has a natural conversion path into a paid Beaconmon plan
- Lives under `beaconmon.com/tools/[slug]`

## Build priority

| # | File | Slug | Backend? | Effort |
|---|------|------|----------|--------|
| 1 | `tool-1-competitor-change-checker.md` | `/tools/shopify-competitor-changes` | Yes | 1-2 days |
| 2 | `tool-2-detection-speed-calculator.md` | `/tools/downtime-detection-calculator` | No | 1 day |
| 3 | `tool-3-shopify-uptime-tester.md` | `/tools/shopify-uptime-test` | Yes | 2-3 days |
| 4 | `tool-4-bfcm-readiness-scorer.md` | `/tools/bfcm-readiness` | Yes | 2-3 days |
| 5 | `tool-5-competitor-roi-calculator.md` | `/tools/competitor-intelligence-roi` | No | 1 day |
| 6 | `tool-6-monitoring-coverage-auditor.md` | `/tools/monitoring-coverage` | Yes | 2-3 days |
| 7 | `tool-7-competitor-intelligence-report.md` | `/tools/competitor-intelligence-report` | Yes | 4-5 days |

## Codebase conventions every agent must follow

### Routing
- Tool pages: `apps/web/app/(marketing)/tools/[slug]/page.tsx`
- Interactive client component: `apps/web/components/tools/[ToolName].tsx` with `'use client'` at top
- API routes (when needed): `apps/web/app/api/tools/[slug]/route.ts`
- Helper lib (when needed): `apps/web/lib/tools/[slug].ts` with `import 'server-only'` at top
- After adding a tool, add it to the `TOOLS` array in `apps/web/app/(marketing)/tools/page.tsx`

### Public API routes (unauthenticated tools)
Every public tool API must:
1. Import and call `isHostnameSafe()` from `@/lib/discovery/ssrf-guard` for any URL the user submits
2. Import and call `rateLimit()` from `@/lib/api/rate-limit` with burst + hourly buckets
3. Use `rateLimit()` and `rateLimitResponse()` from `@/lib/api/rate-limit`
4. Cache results in Redis via `getRedis()` from `@/lib/redis`
5. Use `AppError` / `ValidationError` from `@/lib/api/errors` for structured error responses
6. Set `export const runtime = 'nodejs'` (not edge)
7. Use `z` from `zod` to validate the request body

Reference implementation: `apps/web/app/api/tools/snapshot/route.ts`

### Styling
- Use existing Tailwind brand tokens only: `brand-bg`, `brand-bg1`, `brand-bg2`, `brand-bg-section`, `brand-line`, `brand-line-soft`, `brand-text`, `brand-dim`, `brand-muted`, `brand-green`, `brand-green-fg`, `brand-green-ink`, `brand-green-border-25`, `brand-green-glow-10`, `brand-red`, `brand-amber`
- Follow the visual pattern from `apps/web/app/(marketing)/tools/shopify-competitor-snapshot/page.tsx` for page structure (hero section, content sections, FAQ, CTA)
- For the interactive component, follow `apps/web/components/tools/SnapshotTool.tsx` for input/loading/result state machine pattern
- No em dashes or en dashes in any copy. Use commas, periods, or restructure

### Schema / SEO
- Every tool page exports `metadata` with `title`, `description`, and `alternates.canonical`
- Include `<JsonLd>` with `WebApplication` schema and `FAQPage` schema
- Include `<JsonLd>` with `breadcrumbSchema` (import from `@/lib/breadcrumb`)
- Import `RevealObserver` and wrap reveal sections with `className="reveal"`

### Conversion
- Primary CTA: link to `/sign-up` (optionally with a `?ref=[tool-slug]` query param for attribution)
- Never require signup to use the tool itself
- The "Watch this store" pattern from SnapshotTool (prefill onboarding via localStorage + query param) is good to replicate where relevant
