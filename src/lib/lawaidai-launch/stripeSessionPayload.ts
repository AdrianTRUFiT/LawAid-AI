import { getLawAidAIPlan } from "./lawaidaiPlans";
import type { LawAidAIPlanId } from "./billingContracts";

export interface StripeCheckoutPayload {
  mode: "subscription";
  lineItems: Array<{
    priceEnvKey: string;
    quantity: number;
  }>;
  trialPeriodDays?: number;
  metadata: Record<string, string>;
  successUrl: string;
  cancelUrl: string;
  customerEmail: string;
}

export function buildLawAidAIStripeCheckoutPayload(args: {
  planId: LawAidAIPlanId;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}): StripeCheckoutPayload {
  const plan = getLawAidAIPlan(args.planId);

  const priceEnvKey =
    plan.id === "monthly_flex"
      ? "LAW_AID_AI_STRIPE_PRICE_MONTHLY"
      : plan.id === "quarterly_plan"
      ? "LAW_AID_AI_STRIPE_PRICE_QUARTERLY"
      : "LAW_AID_AI_STRIPE_PRICE_ANNUAL";

  return {
    mode: "subscription",
    lineItems: [
      {
        priceEnvKey,
        quantity: 1,
      },
    ],
    trialPeriodDays: plan.trialDays > 0 ? plan.trialDays : undefined,
    metadata: {
      product: "LawAidAI",
      planId: plan.id,
      billingInterval: plan.interval,
      annualTrialEligible: String(plan.trialDays > 0),
    },
    successUrl: args.successUrl,
    cancelUrl: args.cancelUrl,
    customerEmail: args.customerEmail,
  };
}
