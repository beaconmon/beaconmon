# Chrome Extension MVP — "Competitor X-ray"

Status: spec locked 2026-06-21 (grill-me design session). Not yet built.

## One-liner

A Chrome extension that, on any Shopify storefront, instantly shows the live
promo/pricing picture a merchant can't see by eyeballing the site, then lets
them start monitoring that competitor in Beaconmon in one click.

Positioning split with the Shopify App: the **App watches *your* store** (uptime),
the **extension watches *their* stores** (competitor intelligence). They share one
`team` and one engine; they never overlap in features.

## Why this lane (market)

Saturated incumbents (Koala Inspector, PPSPY, Commerce Inspector) target
**dropshippers** with **estimated** revenue/"winning product" data. Open lane for
Beaconmon:
1. Audience reframe: real brands, competitive *defense*, not "copy products."
2. Factual, not estimated: actual on-sale %, actual discount depth from
   `compare_at_price`. No revenue guesses.
3. One-time lookup -> continuous alerts: incumbents are research tools; none
   *watch* a store for you. The extension is the bridge to ongoing monitoring.

## Locked decisions

1. **Core job:** capture/track tool, led by consumption value.
2. **Lead insight:** live promo X-ray (% on sale, discount depth) + out-of-stock
   rate. Borrowed history is a bonus, not the lead.
3. **Identity:** "watches their stores" — distinct from the Shopify App.
4. **Auth:** anonymous lead value; account required only at "Track."
5. **Architecture:** snapshot computed **client-side** in the extension, reusing
   `@beaconmon/checker` `storefront.ts` (`fetchShopifyCatalog` /
   `fetchStoreCurrency`) with a browser-fetch transport. Server is hit only for
   authenticated actions (track, history lookup). Keep the parser free of
   `server-only` imports.
6. **Platform:** Shopify-only v1 (Woo has no reliable public feed).
7. **UX:** passive toolbar icon + badge by default; opt-in on-page overlay (off
   by default, available as a power/growth surface). Never auto-inject DOM.
8. **Track flow:** one-click, smart defaults derived from the X-ray (no config
   form at the high-intent moment). See #15 for the free-tier footprint.
9. **Privacy:** browsing data **never** phoned home. The passive X-ray is 100%
   client-side. Borrowed history is an explicit per-store button (single-domain,
   on-demand query). Marketing line: "We never receive the sites you browse."
10. **Distribution:** free web tool (`/tools/shopify-competitor-snapshot`) is the
    funnel spine -> install extension -> track -> paid. Cold outreach / Sales
    Compass as accelerant. Chrome Web Store organic as passive backstop.
13. **v1 cut:** ship the value->track loop only. Defer borrowed history, the
    injected overlay, and the local-diff snapshotter to v2.
14. **Team linking (auth mechanism):** email **magic-link** (Shopify-provisioned
    teams have no password). On magic-link, if the email owns a `shopify_install`
    shop, **adopt that existing team** instead of creating a duplicate — so an
    App merchant's competitor monitors land beside their uptime monitors in one
    team. In-admin "Connect extension" deep-link button is v1.1 polish, not v1.
15. **Track footprint + cap:** free-tier Track = **1 competitor monitor (catalog
    sync only)**, enforced by `PLAN_LIMITS.free.competitorMonitors = 1` (RESOLVED
    2026-06-21, see below). The products.json catalog sync already detects price
    changes, new products, and on-sale status, so one monitor delivers ~90% of
    ongoing value. Content presets (announcement-bar, sale-collection, etc.)
    become a Growth-tier upsell shown *after* track. At the cap, hard-stop with an
    upgrade prompt (reuse existing `PlanLimitError` + limit-hit email).

    **Free cap = 1 (decided).** An earlier draft floated "~8 competitor slots"
    (10 total monitors minus 2 uptime), but `competitorMonitors` is a *separate*
    cap from the total `monitors` budget, and 8 would exceed the paid Starter cap
    of 5, inverting the ladder. The deliberate stance: the free passive X-ray
    (badge + popup stats on every store, unlimited, no signup) already gives away
    the entire *lookup* value of the paid incumbents; **continuous tracking +
    alerts is the premium job**, so it gates hard at 1. The upgrade wall lands at
    the first competitor, which is the intent. It is a one-line constant
    (`packages/types/src/plan.ts`), so loosen on evidence of weak activation, not
    speculatively.
16. **Icon badge:** "% of catalog on sale" (e.g. `31%`). Shopify detected ->
    loading dot -> resolved number. On `FeedUnusableError`, fall back to a
    neutral "intel available" dot (never show `0%`, which would be a lie).

## What we took from the finished Shopify App

- `shopify_installs.shop -> team_id` is the account-linking key; every installed
  merchant already has a `team`. Provisioning makes a free team + 2 uptime
  monitors (tag `shopify-core`) + a zero-config email channel.
- **No shared browser session** exists between the embedded admin app and a Chrome
  extension on competitor storefronts -> linking must be explicit (hence #14).
- `competitor_intent` JSONB exists but the App UI doesn't use it -> the extension
  owns its semantics, zero coordination cost.
- Division of labor is settled: App = uptime (`shopify-core`), extension =
  competitor monitors, both in the same team.

## v1 build surface (collision-minimal)

- New isolated workspace: `apps/extension` (MV3). Imports `@beaconmon/checker`
  read-only; isolates server touchpoints behind one adapter module.
- Server touchpoints (all authenticated except none): magic-link auth +
  team-adoption-by-email-match; `bulk-create` with new `source: 'extension'`.
- The only shared-code edit: add `'extension'` to the `bulk-create` source enum.

## Implementation status (2026-06-21)

**Extension scaffolded** in `apps/extension` (MV3, esbuild, no framework). Builds
and typechecks; `dist/` loads unpacked. Delivered:
- Client-side X-ray reusing the parser via a new `@beaconmon/checker/storefront`
  subpath export (node-free; root index pulls undici/whoiser/tls and must not be
  imported by the extension). `lib/snapshot.ts` mirrors `apps/web/lib/tools/snapshot.ts`.
- DOM-signal Shopify detection in an isolated-world content script that emits only
  a verdict + bare host. Privileged `products.json` read happens in the worker.
- Icon badge: `…` loading -> `NN%` on sale (green) -> neutral `•` on `FeedUnusableError`.
- Bearer-token auth: `externally_connectable` intake of a token from beaconmon.com,
  stored in `chrome.storage.local`, sent as `Authorization: Bearer` on Track.
- Popup X-ray + one-click Track; unauthenticated Track opens the connect flow.

### Server contract (BUILT — additive, in `apps/web` + `packages/db` + `apps/shopify`)

1. **`ExtensionToken` model + `owner_email` on `shopify_installs`** (migration
   `0015_extension_tokens`). Token stored as SHA-256 hash only; raw shown once.
   `lib/extension/token.ts` mints/resolves; revocable + `lastUsedAt`.
2. **`withExtensionAuth`** (`lib/api/with-extension-auth.ts`) — a Bearer resolver
   kept **separate** from the central `withAuth` (lower blast radius; the session
   path is untouched) that produces the same `AuthContext`. Verifies membership +
   effective plan fresh per request.
3. **`POST /api/extension/token`** (session-authed) — runs **team-adoption-by-email-match**
   (`lib/extension/adopt.ts`, decision #14: adopt an unclaimed Shopify-provisioned
   team when the verified email matches `owner_email`), revokes prior tokens, mints
   a new one, returns `{ token, teamName }`. Provisioning now persists `owner_email`.
4. **`/extension/connect` page** — magic-link sign-in, then mints + hands the token
   to the extension via `chrome.runtime.sendMessage(ext_id, { type: 'EXT_TOKEN', ... })`,
   with a retry path if the extension is unreachable.
5. **`POST /api/extension/track`** (Bearer) — idempotent; creates one Shopify
   competitor (`dataTier: full_catalog`) + enqueues catalog-sync like
   `POST /api/competitors`; free cap via existing `PlanLimitError` + limit-hit email.
   `'extension'` added to the bulk-create source enum (the #85 shared edit).

**Plan-limit (RESOLVED 2026-06-21):** free stays at `competitorMonitors = 1`. The
"~8 slots" idea was dropped — it would exceed Starter's 5 and invert the ladder,
and the free passive X-ray already gives away the lookup value, so continuous
tracking is the paid job and gates at 1. No code change; see decision #15.

### Still to do

- Action/store icons (16/32/48/128 PNG) before Web Store submission.
- Apply migration `0015` (`pnpm db:migrate`) against a live DB.
- Token-revocation UI (settings) — optional; tokens are already revocable in DB.

## Deferred to v2

- Borrowed history button (needs a public-history endpoint) — strongest delight,
  but not the core loop.
- Injected on-page overlay (organic growth surface).
- Local-diff snapshotter.
- WooCommerce support.
- In-admin "Connect extension" deep-link (v1.1).
