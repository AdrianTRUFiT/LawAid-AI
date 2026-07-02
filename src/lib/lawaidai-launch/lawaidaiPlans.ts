import type { LawAidAIPlan, LawAidAIPlanId } from "./billingContracts";

export const LAWAIDAI_PLANS: LawAidAIPlan[] = [
  {
    id: "monthly_flex",
    name: "Monthly Flex",
    priceCents: 2900,
    interval: "month",
    trialDays: 0,
    mainOffer: false,
    description: "Best if you want flexibility and prefer to start without a longer commitment.",
    ctaLabel: "Choose Monthly",
    features: [
      "Case record workspace",
      "AI-guided case clarity",
      "Cancel anytime",
    ],
  },
  {
    id: "annual_pro",
    name: "Annual Pro",
    priceCents: 19900,
    interval: "year",
    trialDays: 7,
    mainOffer: true,
    description: "Best for serious or slower-moving legal matters. One year of support for less than one hour of attorney time.",
    ctaLabel: "Start 7-Day Free Trial",
    features: [
      "7-day free trial included",
      "Full LawAidAI workspace",
      "Priority continuity and guidance",
      "Best overall value",
    ],
  },
  {
    id: "quarterly_plan",
    name: "Quarterly Plan",
    priceCents: 6900,
    interval: "quarter",
    trialDays: 0,
    mainOffer: false,
    description: "Best if you expect a longer matter but prefer smaller payments along the way.",
    ctaLabel: "Choose Quarterly",
    features: [
      "All core LawAidAI features",
      "Lower upfront commitment",
      "Flexible budgeting",
    ],
  },
];

export function getLawAidAIPlan(planId: LawAidAIPlanId): LawAidAIPlan {
  const plan = LAWAIDAI_PLANS.find((item) => item.id === planId);
  if (!plan) {
    throw new Error(`Unknown LawAidAI plan: ${planId}`);
  }
  return plan;
}

export function formatPlanPrice(priceCents: number, interval: LawAidAIPlan["interval"]): string {
  const dollars = (priceCents / 100).toFixed(0);
  const suffix = interval === "year" ? "/year" : interval === "quarter" ? "/quarter" : "/month";
  return `$${dollars}${suffix}`;
}
