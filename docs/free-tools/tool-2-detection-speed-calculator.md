# Tool 2: Downtime Detection Speed Calculator

**Priority:** 2 (build second, same session as Tool 1 or standalone)
**Slug:** `/tools/downtime-detection-calculator`
**Effort:** 1 day
**Backend required:** No (pure client-side calculator)

## What it does

Answers the question: "How long would it take you to find out your store is down right now?"

Every downtime cost calculator in the market (getuptime.co, PerkyDash, UptimeRobot, IsItWP) asks "how much does downtime cost per hour?" That question is fully saturated. This calculator asks a completely different and more alarming question: *how long would it take you to even know?* The output is your estimated mean time to detect (MTTD) in minutes, and the revenue lost during that invisible window.

No competing tool takes this angle. It maps directly to Beaconmon's core value prop: instant alerts vs. finding out from a customer complaint.

## Target keywords

- `how long to detect website downtime`
- `how fast will I know if my store is down`
- `mean time to detect ecommerce downtime`
- `website downtime detection time calculator`
- `shopify store down how to know`

## Competitive gap

All existing downtime calculators focus on cost-per-hour. None ask "how fast would you know?" This framing is uniquely Beaconmon's -- the product's core value is instant detection. This calculator makes the pain concrete before a sale starts.

## Files to create

```
apps/web/app/(marketing)/tools/downtime-detection-calculator/page.tsx
apps/web/components/tools/DetectionCalculator.tsx
```

Also update `TOOLS` array in:
```
apps/web/app/(marketing)/tools/page.tsx
```

No API route needed. All math happens client-side.

## Calculator logic

### Inputs

| Input | Type | Options |
|---|---|---|
| `monitoringSetup` | select | `none`, `manual`, `generic_tool`, `beaconmon` |
| `checkInterval` | select (shown only when `generic_tool`) | `1`, `5`, `15`, `60` (minutes) |
| `hourlyRevenue` | number input | monthly revenue field that auto-converts: `monthlyRevenue / 730` |
| `teamCoverage` | select | `247` (24/7 on-call), `business_hours` (9-5 weekdays), `solo` (check email occasionally) |

### MTTD calculation

```ts
// Base detection time in minutes by monitoring setup
const BASE_MTTD: Record<string, number> = {
  none:         240,  // 4h average -- customer complaint or noticing manually
  manual:        90,  // 1.5h -- someone checks periodically or gets a customer report
  generic_tool:   0,  // computed from check interval below
  beaconmon:      1,  // 1-min checks, alert fires within ~2 min
};

function computeMttd(inputs: CalcInputs): number {
  let mttd = BASE_MTTD[inputs.monitoringSetup];

  if (inputs.monitoringSetup === 'generic_tool') {
    // Worst case is the full interval, average is half
    mttd = inputs.checkInterval / 2;
  }

  // Team coverage multiplier: if nobody is watching alerts at 2am, detection is delayed
  if (inputs.teamCoverage === 'business_hours') {
    // On average, 50% of outages happen outside business hours -> add 4h weighted avg
    mttd = mttd + 240 * 0.5;
  }
  if (inputs.teamCoverage === 'solo') {
    // Checks email a few times a day
    mttd = mttd + 360 * 0.6;
  }

  return Math.round(mttd);
}
```

### Output values

```ts
const mttdMinutes = computeMttd(inputs);
const revenueLostInWindow = (inputs.hourlyRevenue / 60) * mttdMinutes;
const beaconmonMttd = 2; // minutes
const revenueSavedVsBeaconmon = (inputs.hourlyRevenue / 60) * (mttdMinutes - beaconmonMttd);
```

### Output display

Show 3 headline numbers:
1. **Your estimated detection time:** `{mttdMinutes} minutes`
2. **Revenue lost before you know:** `${revenueLostInWindow.toFixed(0)}` (formatted with commas)
3. **With Beaconmon (1-min checks):** `2 minutes` (static, always shown for comparison)

Below the numbers, a simple horizontal bar comparison:
- Your current setup: `[====================] {mttdMinutes} min`
- Beaconmon: `[=] 2 min`

Then a callout box: "On a Black Friday weekend, your store earns roughly 5-8x your normal hourly revenue. At that rate, your current setup means ${(revenueLostInWindow * 6).toFixed(0)} lost before you even get an alert."

## UI state machine

Pure controlled form -- no loading state needed.

States: `idle` (form not filled) and `result` (all required fields have values). The result section appears below the form as soon as all required inputs are set (no submit button needed -- reactive calculation).

**Form layout:**
- Single-column on mobile, two-column on desktop
- `monitoringSetup` dropdown first (most impactful input, sets the framing)
- `checkInterval` shown/hidden based on `monitoringSetup === 'generic_tool'`
- `monthlyRevenue` number input with currency prefix ($)
- `teamCoverage` dropdown last

**Result section** slides in (use `snap-in` animation class from globals, or a simple opacity transition) when all required fields have values.

## Page structure

**Hero h1:** "How fast would you know if your Shopify store went down?"

**Subhead:** "Most store owners find out from a customer complaint. Calculate your real detection time and the revenue you lose in that window."

**Meta description:** "Free calculator: how long would it take you to detect a Shopify store outage? Enter your revenue and current monitoring setup to see your real mean time to detect."

**Canonical:** `https://beaconmon.com/tools/downtime-detection-calculator`

**After the calculator, a "How monitoring changes the math" section:**
Three stat cards:
- Without monitoring: "4 hours average detection time" (source: industry benchmark)
- Generic 5-min monitoring: "2.5 minutes to detect, but only if someone reads the alert at 2am"
- Beaconmon: "1-minute checks. Alert fires in under 2 minutes, any hour, any day."

**FAQ (5 questions, use FAQPage schema):**
- "What is mean time to detect (MTTD) for website downtime?" -- MTTD is how long it takes from when your store goes offline to when your team actually knows about it. For stores with no monitoring, the average is 4+ hours.
- "How long does it take to detect Shopify downtime without monitoring?" -- Without active monitoring, most store owners find out when a customer reports an error or when they personally try to visit the site. That typically means 2 to 6 hours of undetected downtime.
- "How often do Shopify stores go down?" -- Shopify itself is extremely reliable, but individual stores can go down due to theme conflicts, app errors, DNS problems, or third-party service outages. These are not reflected in Shopify's platform status.
- "What is a good uptime monitoring check interval?" -- For ecommerce, 1-minute checks are the standard. A 5-minute interval means you could lose 2.5 minutes of revenue on average before detection, and up to 5 minutes in the worst case.
- "Does Beaconmon monitor Shopify stores?" -- Yes. Beaconmon checks your store every minute from multiple locations and alerts you within 2 minutes of any outage, via email or Slack.

**Internal links:**
- `/ecommerce-uptime-monitoring-guide`
- `/tools/shopify-uptime-test`
- `/tools/shopify-competitor-changes`
- `/pricing`

**Bottom CTA:** "Know in 2 minutes, not 4 hours. Beaconmon monitors your store every minute and alerts you instantly."

## Add to hub page

```ts
{
  href: '/tools/downtime-detection-calculator',
  name: 'Downtime Detection Speed Calculator',
  blurb: 'How long would it take you to find out your store went down? Calculate your real detection time and what it costs.',
  tag: 'Calculator',
},
```

## Notes on copy style

- Never use em dashes or en dashes. Use commas or restructure.
- Benchmarks used in the calculator copy (4h average MTTD, 5-8x BFCM revenue multiplier) are industry estimates. Present them as estimates, not citations.
- The BFCM callout should only appear if `monthlyRevenue > 0`.
