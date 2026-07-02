import { buildBillingTimeline } from "../lib/lawaidai-billing";

const now = Date.now();

const timeline = buildBillingTimeline("cust_005", [
  {
    signalType: "customer.subscription.created",
    customerRef: "cust_005",
    subscriptionRef: "sub_005",
    planId: "monthly_flex",
    timestampIso: new Date(now).toISOString(),
    currentPeriodEndsAt: new Date(now + 30 * 86400000).toISOString(),
  },
  {
    signalType: "invoice.payment_failed",
    customerRef: "cust_005",
    subscriptionRef: "sub_005",
    planId: "monthly_flex",
    timestampIso: new Date(now + 31 * 86400000).toISOString(),
  },
  {
    signalType: "customer.subscription.deleted",
    customerRef: "cust_005",
    subscriptionRef: "sub_005",
    planId: "monthly_flex",
    timestampIso: new Date(now + 35 * 86400000).toISOString(),
  },
]);

if (timeline.subscriptionState !== "expired_read_only") {
  console.error("BILLING_TIMELINE_EXPIRED_FAILED");
  console.error(timeline.subscriptionState);
  process.exit(1);
}

if (timeline.eventCount !== 3) {
  console.error("BILLING_TIMELINE_EXPIRED_EVENTCOUNT_FAILED");
  console.error(timeline.eventCount);
  process.exit(1);
}

console.log("LAW_AID_AI_BILLING_TIMELINE_EXPIRED=PASS");
