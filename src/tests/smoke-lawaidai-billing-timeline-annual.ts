import { buildBillingTimeline } from "../lib/lawaidai-billing";

const now = Date.now();

const timeline = buildBillingTimeline("cust_004", [
  {
    signalType: "checkout.session.completed",
    customerRef: "cust_004",
    subscriptionRef: "sub_004",
    planId: "annual_pro",
    timestampIso: new Date(now).toISOString(),
  },
  {
    signalType: "customer.subscription.created",
    customerRef: "cust_004",
    subscriptionRef: "sub_004",
    planId: "annual_pro",
    timestampIso: new Date(now + 1000).toISOString(),
    trialEndsAt: new Date(now + 7 * 86400000).toISOString(),
  },
  {
    signalType: "customer.subscription.updated",
    customerRef: "cust_004",
    subscriptionRef: "sub_004",
    planId: "annual_pro",
    timestampIso: new Date(now + 8 * 86400000).toISOString(),
    currentPeriodEndsAt: new Date(now + 373 * 86400000).toISOString(),
  },
]);

if (timeline.subscriptionState !== "active_annual") {
  console.error("BILLING_TIMELINE_ANNUAL_FAILED");
  console.error(timeline.subscriptionState);
  process.exit(1);
}

if (timeline.eventCount !== 3) {
  console.error("BILLING_TIMELINE_ANNUAL_EVENTCOUNT_FAILED");
  console.error(timeline.eventCount);
  process.exit(1);
}

console.log("LAW_AID_AI_BILLING_TIMELINE_ANNUAL=PASS");
