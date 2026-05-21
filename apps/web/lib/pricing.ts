export const PRICING = {
  free: { monthly: 0, annual: 0, annualTotal: 0 },
  starter: { monthly: 29, annual: 23, annualTotal: 276 },
  growth: { monthly: 79, annual: 63, annualTotal: 756 },
  scale: { monthly: 199, annual: 159, annualTotal: 1908 },
} as const;

export const PLAN_CTAS = {
  free: '/sign-up',
  starter: '/sign-up?plan=starter',
  growth: '/sign-up?plan=growth',
  scale: '/sign-up?plan=scale',
} as const;
