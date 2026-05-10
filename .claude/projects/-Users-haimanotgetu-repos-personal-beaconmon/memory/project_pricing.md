---
name: Pricing decisions — May 2026
description: Finalized pricing strategy and all implementation decisions made in the grill-me session
type: project
---

Pricing structure locked in 2026-05-10:

- **Free:** $0 — 10 monitors, 5-min intervals, 1 status page, 7-day history, email only. "Powered by Beaconmon" badge on status pages.
- **Pro:** $19/mo monthly · $15/mo billed annually ($180/yr)
- **Business:** $59/mo monthly · $47/mo billed annually ($564/yr)
- **Annual discount:** 20%
- **Pricing page default:** annual shown by default

**Why:**
- ICP: indie founders (Pro), medium agencies (Business)
- Positioning: "Better Stack but more affordable" (Better Stack Solo = $25/mo, Team = $75/mo)
- $19 stays under the $20 psychological boundary; "$15/mo billed annually" = Better Stack's old price point

**Business plan:** SMS alerts and agency dashboard removed from pricing card (not built yet). Both marked "Soon" in feature matrix. Sell now — agencies become early feedback loop.

**Status page badge:** "Powered by Beaconmon" shows on Free status pages, hidden on Pro+. Implemented via `hideBranding` field in `StatusPageCacheData`. Old cached entries default to showing badge (correct fallback for free users).

**Business trial flow:** Business CTA links to `/sign-up?plan=business`. After email signup, client calls `POST /api/billing/set-trial-plan` with `{plan: 'business'}` to upgrade the auto-created Pro trial team to Business. Route is at `apps/web/app/api/billing/set-trial-plan/route.ts`.

**How to apply:** When creating Paddle prices, use exactly these amounts: Pro monthly $19, Pro annual $180/yr, Business monthly $59, Business annual $564/yr. Do not change prices without discussion.
