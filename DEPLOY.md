# Deploying beaconmon

Production stack: **Hetzner Cloud + Coolify + Neon Postgres + self-hosted Redis**, fronted by Cloudflare. All seven services (web + 6 workers) plus Redis run as Docker containers managed by Coolify on a single Hetzner VPS.

| Component | Where it runs | Notes |
|---|---|---|
| Next.js web app | Hetzner VPS, Docker | Port 3000, fronted by Coolify's Traefik on 443 |
| 6 worker processes | Hetzner VPS, Docker | check / content / alert / escalation / report / scheduler |
| Redis | Hetzner VPS, Docker | AOF on, `noeviction` for BullMQ |
| Postgres | Neon (us-east-2 / Ohio) | Closest Neon region to Ashburn |
| DNS / TLS termination at edge | Cloudflare | Proxied A record to the Hetzner public IP |
| Region probes | Cloudflare Workers | Deployed via `wrangler` separately, not in the stack |

Cost target: ~$8/mo (Hetzner CX22 + backups). Neon, Cloudflare, Sentry, Resend, Healthchecks all have free tiers that cover the MVP.

---

## 1. Provision Hetzner

1. Sign up at <https://www.hetzner.com/cloud>. Add the prepaid card. Hetzner accepts most prepaid cards directly; if rejected, use SEPA or PayPal.
2. Create a project called `beaconmon`.
3. Create a server:
   - **Location:** Ashburn, VA (US-East)
   - **Image:** Ubuntu 24.04
   - **Type:** CX22 (2 vCPU, 4 GB RAM, 40 GB SSD) — €5.83/mo. Upgrade to CCX13 if memory pressure shows up later.
   - **Networking:** Public IPv4 + IPv6
   - **SSH key:** add yours
   - **Backups:** enable (+20% cost, weekly snapshots — worth it)
4. Note the public IPv4 — you'll need it for Cloudflare DNS.

## 2. Install Coolify

SSH to the new server and run the official installer:

```bash
ssh root@<server-ip>
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

The installer sets up Docker, Traefik, and Coolify itself. When it finishes, open `http://<server-ip>:8000` and create the admin account immediately. Then in Coolify settings:
- Set the instance domain to `coolify.beaconmon.com` (we'll DNS this in step 5).
- Enable Let's Encrypt for automatic SSL.

## 3. Provision Neon Postgres

1. Sign up at <https://neon.tech>. The free tier (0.5 GB) is enough to start.
2. Create a project: `beaconmon`, region **AWS us-east-2 (Ohio)** — closest to Hetzner Ashburn.
3. Note both connection strings from the dashboard:
   - **Direct** → `DATABASE_URL` (used for migrations only)
   - **Pooled** (host has `-pooler`) → `DATABASE_URL_POOLED` (used by web + workers at runtime). Append `?sslmode=require&pgbouncer=true&connection_limit=1`.
4. From your laptop, run the initial migration against the direct URL:
   ```bash
   DATABASE_URL=<direct-url> pnpm --filter @beaconmon/db run migrate:deploy
   ```

## 4. Configure Cloudflare DNS

In the Cloudflare dashboard for `beaconmon.com`, add A records (proxied = orange cloud):

| Name | Target | Proxy |
|---|---|---|
| `@` | `<hetzner-ip>` | Proxied |
| `www` | `<hetzner-ip>` | Proxied |
| `coolify` | `<hetzner-ip>` | DNS only (grey cloud) — Coolify needs raw access for ACME |
| `*.status` | `<hetzner-ip>` | Proxied — for customer status pages on subdomains |

SSL/TLS mode: **Full (strict)**. Coolify provisions the origin cert via Let's Encrypt.

## 5. Create the Coolify project

In Coolify:

1. **+ New** → **Project** → name `beaconmon`.
2. **+ New Resource** → **Docker Compose**.
3. Source: connect your GitHub repo. Coolify will install a GitHub App for auto-deploy on push.
4. Branch: `main`.
5. Compose file: `docker-compose.production.yml`.
6. Domain: assign `beaconmon.com` (and `www.beaconmon.com`) to the `web` service. Coolify handles the Let's Encrypt cert.

## 6. Set environment variables

In the Coolify resource → **Environment Variables**, add these as **Build & Runtime** vars (they end up in the `.env` file Compose interpolates from):

```
# Database
DATABASE_URL=<neon pooled url>
DATABASE_URL_POOLED=<neon pooled url>

# Redis (in-stack hostname)
REDIS_URL=redis://redis:6379

# Auth
BETTER_AUTH_SECRET=<openssl rand -base64 32>
BETTER_AUTH_URL=https://beaconmon.com

# Paddle
PADDLE_API_KEY=...
PADDLE_WEBHOOK_SECRET=...
PADDLE_PRO_PRICE_ID=...
PADDLE_BUSINESS_PRICE_ID=...
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN=...
NEXT_PUBLIC_PADDLE_PRO_PRICE_ID=...

# Email
RESEND_API_KEY=re_...
EMAIL_FROM=alerts@beaconmon.com

# Error tracking
SENTRY_DSN=...
NEXT_PUBLIC_SENTRY_DSN=<same as SENTRY_DSN>
SENTRY_MONITOR_SLUG=beaconmon-scheduler

# Production switches
NODE_ENV=production
ALERT_DRY_RUN=false
FEATURE_SMS_ALERTS=false
FEATURE_MULTI_LOCATION=false
FEATURE_HEARTBEAT=false
FEATURE_AGENCY=false
```

For both the `DATABASE_URL` use the **pooled** Neon URL — the workers should never hit the direct endpoint at runtime. Keep the direct URL out of the deployed env entirely; only your laptop uses it for `migrate:deploy`.

## 7. Third-party setup

- **Paddle:** create products + prices, then register the webhook endpoint at `https://beaconmon.com/api/webhooks/paddle`. Copy the signing secret into `PADDLE_WEBHOOK_SECRET`.
- **Resend:** verify `beaconmon.com` as a sending domain (DKIM + SPF records in Cloudflare).
- **Sentry:** create a project. Then create a Cron Monitor with slug `beaconmon-scheduler` (must match `SENTRY_MONITOR_SLUG`), schedule = every 1 minute, grace = 60s.

## 8. Deploy

In Coolify, hit **Deploy**. The first build will take 5–10 minutes (subsequent builds are cached). Tail logs from the Coolify UI for each service.

Once green:

```bash
# From your laptop, point at production
BETTER_AUTH_URL=https://beaconmon.com pnpm smoke-test
```

Then check `https://beaconmon.com/api/health` — every worker should report `alive: true`.

## 9. Post-deploy

- **Self-monitor:** add `https://beaconmon.com` as your first monitor inside the app.
- **External dead-man's switch:** sign up at <https://healthchecks.io> (free) and create a check for the scheduler. Add `HEALTHCHECKS_URL` to the env, then wire the scheduler to ping it after each tick (small follow-up code change — not in this PR).
- **Region probes:** deploy the Cloudflare Workers from `apps/region-probe/` once you have a Cloudflare Workers paid plan ($5/mo) and `FEATURE_MULTI_LOCATION=true`.

---

## Operational tasks

**Migrations.** Always run from your laptop against the direct Neon URL, never inside the deployed image:
```bash
DATABASE_URL=<direct-url> pnpm --filter @beaconmon/db run migrate:deploy
```

**Redeploy.** Push to `main`. GitHub Actions runs typecheck + tests + Docker build as a quality gate; Coolify pulls and rebuilds the stack on its own.

**Restoring Redis after a host outage.** AOF is enabled, so Redis recovers in-flight queue state on container restart. If the host itself dies, restore from the latest Hetzner snapshot — Redis state will be at most one week stale (worst case BullMQ retries the lost jobs).

**Scaling beyond one VPS.** When the CX22 saturates: upgrade in-place to a CCX13 (no rebuild needed, ~30s downtime). Beyond that, split workers onto a second Hetzner box with its own Coolify and point both stacks at the same Neon and a managed Redis.

## Known follow-ups

- Source-map upload to Sentry is wired in env (`SENTRY_AUTH_TOKEN`) but not yet in CI. Add to the `verify` job when you want symbolicated stack traces.
- Healthchecks.io ping from the scheduler — env slot reserved, code TODO.
- Multi-region probes via Cloudflare Workers — gated behind `FEATURE_MULTI_LOCATION`, post-launch.
