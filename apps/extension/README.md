# @beaconmon/extension — Competitor X-ray (Chrome MV3)

The **extension watches _their_ stores** (competitor intelligence), the Shopify
App watches _your_ store (uptime). One team, one engine, no feature overlap.
See `docs/chrome-extension-mvp.md` for the locked product spec.

On any Shopify storefront it reads the live promo picture **on-device** (% of
catalog on sale, discount depth, out-of-stock), shows it as a toolbar badge +
popup, and turns it into continuous Beaconmon monitoring in one click.

## Privacy posture

The passive X-ray is 100% client-side. The content script only emits a Shopify
**yes/no verdict + the bare host** to the service worker; the worker reads the
store's public `products.json` directly from the user's machine (extension host
permissions bypass CORS). Browsing data is never phoned home. The only network
call to Beaconmon is an explicit **Track**.

## Architecture

```
content/detect.ts      DOM-signal Shopify detection (isolated world) -> worker
background/
  service-worker.ts    feed read + badge paint + popup routing + token intake
lib/
  snapshot.ts          client-side promo X-ray (reuses @beaconmon/checker/storefront)
  transport.ts         browser-fetch transport for the shared parser
  api.ts               POST /api/extension/track (Bearer)
  auth.ts              token store (chrome.storage.local)
  config.ts            API origin, connect URL, fetch budgets
  messages.ts          typed message union across all three contexts
popup/popup.ts         view-only X-ray + Track button
```

The snapshot logic mirrors `apps/web/lib/tools/snapshot.ts` so the extension and
the paid product report identical numbers, importing the node-free parser via the
`@beaconmon/checker/storefront` subpath export (added for this app).

## Build & load

```bash
pnpm --filter @beaconmon/extension build      # outputs dist/
pnpm --filter @beaconmon/extension dev        # rebuild on change
```

Then in Chrome: `chrome://extensions` -> enable Developer mode -> **Load
unpacked** -> select `apps/extension/dist`.

For local development against the web app, set `API_ORIGIN` in `src/lib/config.ts`
to `http://localhost:3000` (already allowlisted in `externally_connectable`).

## Auth: issued bearer token

1. Track while unauthenticated -> worker opens `${API_ORIGIN}/extension/connect?ext_id=<id>`.
2. User signs in via **magic-link** (Shopify-provisioned teams have no password).
3. The connect page mints a long-lived extension token and hands it back with
   `chrome.runtime.sendMessage(extId, { type: 'EXT_TOKEN', token, teamName })`.
4. The worker stores it; subsequent Track calls send `Authorization: Bearer`.

## Server work still required (not in this scaffold)

This package is the client. The web app needs three additive pieces (see
`docs/chrome-extension-mvp.md` "Server contract"):

1. **`/extension/connect` page** — magic-link sign-in + **team adoption by email
   match** (if the email owns a `shopify_install` shop, adopt that team instead of
   creating a duplicate). Mints the extension token and posts it back to the
   extension id.
2. **Extension token model + minting** — a long-lived, revocable token resolving
   to `{ userId, teamId }`. `withAuth` already supports an `X-Team-Id` header path;
   add a Bearer resolver alongside the session cookie.
3. **`POST /api/extension/track`** — Bearer-auth; create **one** Shopify competitor
   (`dataTier: full_catalog`, `source: 'extension'`) the way `POST /api/competitors`
   does; enforce the free competitor cap with the existing `PlanLimitError` +
   limit-hit email. Add `'extension'` to the bulk-create / monitor source enum.

## TODO before store submission

- Action + store icons (16/32/48/128 PNG). The manifest currently omits them, so
  Chrome shows a default placeholder icon (the extension still loads and the badge
  still paints).
- Narrow `host_permissions` if Chrome review pushes back on `https://*/*` (needed
  for passive cross-store feed reads).
