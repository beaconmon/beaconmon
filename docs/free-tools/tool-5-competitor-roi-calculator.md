# Tool 5: Competitor Intelligence ROI Calculator

**Priority:** 5
**Slug:** `/tools/competitor-intelligence-roi`
**Effort:** 1 day
**Backend required:** No (pure client-side calculator)

## What it does

Calculates how much revenue a Shopify merchant could recover by reacting to competitor pricing moves faster. The framing is not "how much does monitoring cost vs. benefit?" (that angle exists elsewhere) but specifically: "how much money are you leaving on the table by being slow to react to competitor changes?"

The output makes the cost of *not* monitoring competitors feel concrete -- a dollar figure, not a vague claim about staying competitive.

## Target keywords

- `competitor intelligence ROI calculator`
- `cost of not monitoring competitors ecommerce`
- `competitor price monitoring worth it`
- `ecommerce competitive intelligence ROI`
- `how much revenue from competitor monitoring`

## Competitive gap

Multiple ROI calculators exist for general monitoring (Hyperping, Webalert). None exist for competitive intelligence specifically -- "how much does being slow to react to a competitor price change cost you?" That specific question is unanswered by any tool. A survey of competitive intelligence professionals found programs deliver an average 378% ROI, but no tool helps a Shopify merchant calculate their own number.

## Files to create

```
apps/web/app/(marketing)/tools/competitor-intelligence-roi/page.tsx
apps/web/components/tools/CompetitorRoiCalculator.tsx
```

Also update `TOOLS` array in:
```
apps/web/app/(marketing)/tools/page.tsx
```

No API route needed.

## Calculator logic

### Inputs

| Input | Label | Type | Notes |
|---|---|---|---|
| `monthlyRevenue` | Monthly store revenue | number | In USD |
| `competitorCount` | Number of competitors you track | select | 1, 2-3, 4-6, 7+ |
| `reactionTime` | How quickly you currently react to competitor price/promo changes | select | Same day, 1-3 days, 1 week, Rarely / never |
| `niche` | Product category sensitivity | select | Commodity (price-sensitive), Fashion/lifestyle, Specialty/unique products |

### Constants (benchmark-derived)

```ts
const COMPETITOR_MOVE_FREQ_PER_MONTH: Record<string, number> = {
  '1':    2,   // 2 meaningful moves/month per competitor
  '2-3':  5,
  '4-6':  10,
  '7+':   18,
};

// % of revenue at risk per meaningful competitor move you miss or react to slowly
const NICHE_EXPOSURE: Record<string, number> = {
  commodity:  0.04,  // 4% -- price sensitive, customers switch fast
  fashion:    0.02,  // 2% -- some sensitivity, brand loyalty buffers some loss
  specialty:  0.005, // 0.5% -- low price sensitivity, customers buy for the product
};

// Fraction of exposure recovered with fast reaction vs. slow
const REACTION_RECOVERY: Record<string, number> = {
  same_day:    0.80, // recover 80% of exposure with same-day reaction
  '1-3_days':  0.55,
  '1_week':    0.25,
  rarely:      0.05,
};

const BEACONMON_REACTION_TIME = 'same_day'; // with monitoring + instant alerts
```

### Calculation

```ts
const movesPerMonth = COMPETITOR_MOVE_FREQ_PER_MONTH[inputs.competitorCount];
const exposurePerMove = inputs.monthlyRevenue * NICHE_EXPOSURE[inputs.niche];
const totalMonthlyExposure = movesPerMonth * exposurePerMove;

const currentRecovery = REACTION_RECOVERY[inputs.reactionTime];
const beaconmonRecovery = REACTION_RECOVERY[BEACONMON_REACTION_TIME];

const currentMonthlyLoss = totalMonthlyExposure * (1 - currentRecovery);
const beaconmonMonthlyLoss = totalMonthlyExposure * (1 - beaconmonRecovery);

const monthlyOpportunity = currentMonthlyLoss - beaconmonMonthlyLoss;
const annualOpportunity = monthlyOpportunity * 12;
```

### Output display

3 headline metrics:
1. **Competitor moves you're exposed to:** `{movesPerMonth} pricing or promo moves per month`
2. **Revenue at risk from slow reactions:** `$${currentMonthlyLoss.toFixed(0)}/month`
3. **Recoverable with instant alerts:** `$${monthlyOpportunity.toFixed(0)}/month`

Below the numbers:
- A simple two-row comparison table:
  - Current setup: `{inputs.reactionTime}` reaction time, `${currentMonthlyLoss.toFixed(0)}/month` unrecovered exposure
  - With Beaconmon: same-day reaction (via instant alert), `${beaconmonMonthlyLoss.toFixed(0)}/month` unrecovered exposure
- Annual headline: "By reacting faster, you could recover `$${annualOpportunity.toFixed(0)}` per year."

**Payback period calculation:**
```ts
const beaconmonMonthlyCost = 19; // Growth plan price in dollars -- update if pricing changes
const paybackDays = Math.ceil((beaconmonMonthlyCost / monthlyOpportunity) * 30);
```
Show: "At $19/month, Beaconmon pays for itself in `{paybackDays}` days."
If `paybackDays <= 0` or monthly opportunity is tiny, do not show the payback line (avoid absurd outputs).

**Disclaimer (small text below results):** "Estimates are based on industry benchmarks for ecommerce competitor reaction rates and revenue sensitivity by category. Your results will vary."

## UI state machine

Same reactive pattern as Tool 2 (Detection Calculator): no submit button, results appear as soon as all inputs are filled. Inputs are all selects except `monthlyRevenue`.

Form order:
1. `monthlyRevenue` (number input, required)
2. `niche` (select, 3 options)
3. `competitorCount` (select, 4 options)
4. `reactionTime` (select, 4 options)

Result section fades in when all 4 inputs have values.

## Page structure

**Hero h1:** "How much revenue are you losing by reacting slowly to competitor moves?"

**Subhead:** "Calculate how much faster competitor intelligence could recover for your store. Based on your revenue, niche, and how many competitors you track."

**Meta description:** "Free ROI calculator for ecommerce competitor intelligence. See how much revenue you recover by reacting faster to competitor price drops and promotions."

**Canonical:** `https://beaconmon.com/tools/competitor-intelligence-roi`

**"What counts as a competitor move" explainer (below calculator):**
Three examples in card format:
- Competitor drops prices 20% for a flash sale -- you find out 3 days later. Customers already converted to their offer.
- Competitor launches free shipping for the weekend -- you find out Monday. Your conversion rate dipped and you didn't know why.
- Competitor adds a new product in your category -- you find out when a customer mentions it. You missed 2 weeks of comparison shopping traffic.

**"How Beaconmon changes the math" section:**
- Instant alert when a competitor price drops or a promo launches
- Daily intelligence digest summarizing competitor moves
- React the same day instead of the same week

**FAQ (5 questions):**
- "How does competitor monitoring increase revenue?" -- When a competitor drops prices or launches a promo, customers comparison shop. If you know about it the same day, you can match, counter, or simply make sure your ads and messaging stay competitive. Slow reaction means those customers convert to your competitor's offer before you even knew there was one.
- "What is a good reaction time for competitor pricing changes?" -- Same-day reaction is the standard for stores actively managing competitive pricing. Reacting within 24 hours to a competitor price drop means you can adjust before the competitor's promotion peaks.
- "How many competitor pricing moves happen per month?" -- For most ecommerce niches, meaningful pricing or promotion changes happen 2-5 times per month per competitor. Commodity and fashion niches see more frequent moves; specialty products with strong brand differentiation see fewer.
- "Is this calculator accurate for my store?" -- The calculator uses industry benchmarks as inputs. Your results depend on your specific niche competitiveness and customer price sensitivity, which vary by product category and market. Use the result as a directional estimate.
- "What does Beaconmon track for competitor intelligence?" -- Beaconmon monitors competitor websites for price changes, promotional markdowns, new product launches, and content updates. You get an alert within minutes of any change, plus a weekly digest summarizing competitor activity.

**Internal links:**
- `/ecommerce-competitor-intelligence`
- `/competitor-price-tracking`
- `/tools/shopify-competitor-changes`
- `/pricing`

**Bottom CTA:** "Stop reacting a week late. Beaconmon alerts you the moment a competitor drops prices or launches a sale."

## Add to hub page

```ts
{
  href: '/tools/competitor-intelligence-roi',
  name: 'Competitor Intelligence ROI Calculator',
  blurb: 'Calculate how much revenue you recover by reacting faster to competitor price drops and promotions.',
  tag: 'Calculator',
},
```

## Notes

- All monetary outputs should use `Intl.NumberFormat` with `style: 'currency'` for correct formatting across locales
- If the calculator produces negative or zero opportunity (e.g. the user already reacts same-day), show a positive message: "You're already reacting fast. The next step is making sure you never miss a move, even at 2am." and CTA to sign up
- Keep the benchmark constants in a clearly commented block so they can be updated if pricing or industry data changes
