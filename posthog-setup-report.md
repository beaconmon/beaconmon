<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into Beaconmon. The project had substantial PostHog instrumentation in place — both `posthog-js` (client) and `posthog-node` (server) were installed, environment variables were configured, and a large set of business events were being captured across auth pages, billing flows, API routes, and Paddle webhook handlers. This session extended the integration with four targeted improvements:

1. **Fixed duplicate PostHog initialization** — `posthog-provider.tsx` was calling `posthog.init()` in addition to `instrumentation-client.ts`. The duplicate init was removed; the component now only provides the React context wrapper and page-view tracking without re-initializing PostHog.

2. **Added `defaults: '2026-01-30'` to `instrumentation-client.ts`** — Aligns with the current recommended PostHog SDK initialization pattern for Next.js 15.3+ apps.

3. **Added four new analytics methods to `analytics.ts`** and called them in the auth pages:
   - `sign_in_failed` — captured when email/password or magic link sign-in fails (with `method` and `error` properties)
   - `sign_in_social_attempted` — captured before OAuth redirect on sign-in (with `provider` property)
   - `sign_up_failed` — captured when email or magic link sign-up fails (with `method` and `error` properties)
   - `sign_up_social_attempted` — captured before OAuth redirect on sign-up (with `provider` property)

4. **Environment variables updated** — `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` written to `.env.local`.

## Event tracking

| Event | Description | File |
|---|---|---|
| `user_signed_up` | User creates an account (email, magic link) | `apps/web/app/(auth)/sign-up/page.tsx` |
| `user_signed_in` | User signs in (email/password or magic link) | `apps/web/app/(auth)/sign-in/page.tsx` |
| `sign_in_failed` | *(new)* Email/password or magic link sign-in failed | `apps/web/app/(auth)/sign-in/page.tsx` |
| `sign_in_social_attempted` | *(new)* User clicked Google/GitHub sign-in button | `apps/web/app/(auth)/sign-in/page.tsx` |
| `sign_up_failed` | *(new)* Email or magic link sign-up failed | `apps/web/app/(auth)/sign-up/page.tsx` |
| `sign_up_social_attempted` | *(new)* User clicked Google/GitHub sign-up button | `apps/web/app/(auth)/sign-up/page.tsx` |
| `monitor_created` | User creates a new monitor | `apps/web/lib/analytics.ts` (client) |
| `monitor_deleted` | User deletes a monitor | `apps/web/lib/analytics.ts` (client) |
| `alert_channel_created` | User creates an alert channel | `apps/web/lib/analytics.ts` (client) |
| `status_page_created` | User creates a status page | `apps/web/lib/analytics.ts` (client) |
| `upgrade_clicked` | User clicks an upgrade CTA | `apps/web/lib/analytics.ts` (client) |
| `checkout_opened` | User opens Paddle checkout for a plan upgrade | `apps/web/app/(dashboard)/settings/billing/page.tsx` |
| `billing_interval_switched` | User switches between monthly and annual billing | `apps/web/app/(dashboard)/settings/billing/page.tsx` |
| `subscription_created` | Paddle webhook: new paid subscription created (server) | `apps/web/lib/paddle-handlers.ts` |
| `subscription_updated` | Paddle webhook: plan or status changed (server) | `apps/web/lib/paddle-handlers.ts` |
| `subscription_canceled` | Paddle webhook: subscription canceled, team downgraded (server) | `apps/web/lib/paddle-handlers.ts` |
| `incident_resolved` | User manually resolves an active incident (server) | `apps/web/app/api/incidents/[id]/resolve/route.ts` |
| `team_invitation_sent` | Team owner/admin sends a member invitation (server) | `apps/web/app/api/team/invitations/route.ts` |
| `team_invitation_accepted` | Invited user accepts a team invitation (server) | `apps/web/app/api/team/invitations/[id]/accept/route.ts` |
| `slack_channel_connected` | Slack OAuth completed, alert channel created (server) | `apps/web/app/api/integrations/slack/callback/route.ts` |
| `deploy_event_started` | User starts a deploy event on a monitor (server) | `apps/web/app/api/monitors/[id]/deploy/route.ts` |
| `monitors_bulk_actioned` | User performs a bulk action on monitors (server) | `apps/web/app/api/monitors/bulk/route.ts` |

## Next steps

We've built a dashboard and five insights to keep an eye on user behavior:

- [Analytics basics dashboard](/dashboard/1569744)
- [Sign-ups over time](/insights/vZL1heK5) — daily sign-up trend (last 30 days)
- [Sign-in method breakdown](/insights/qFGKbX2U) — email vs. magic link vs. social, broken down by `method`
- [Failed auth attempts](/insights/xsgsjocb) — sign-in and sign-up failures; useful for spotting friction or attacks
- [Sign-up to subscription conversion funnel](/insights/4XjNFBjg) — 3-step funnel: signed up → opened checkout → subscription created
- [Monitor creation over time](/insights/zxq4Ywta) — monitors created vs. deleted; key activation metric

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
