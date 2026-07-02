import {
  processVerifiedOpportunity,
} from "../lib/fundtracker";
import {
  buildOversightState,
} from "../lib/fintechion";
import {
  appendActivatedTransactionStateJson,
  appendProcessorEventJson,
  appendTransactionIntentJson,
  appendVerificationDecisionJson,
  appendVerifiedOpportunityJson,
  resetFundTrackerJsonArtifacts,
} from "../lib/fundtracker/jsonStore";
import {
  appendOversightJson,
  resetFinTechionJsonArtifacts,
} from "../lib/fintechion/jsonStore";
import type { ProcessorEvent, VerifiedOpportunity } from "../lib/fundtracker/types";

function nowIso(): string {
  return new Date().toISOString();
}

function makeOpportunity(index: number): VerifiedOpportunity {
  return {
    verifiedOpportunityId: `vo_seed_${index}`,
    sourceSystem: "seed_script",
    merchantId: `m_${String((index % 3) + 1).padStart(3, "0")}`,
    customerId: `cust_${String(index).padStart(3, "0")}`,
    productId: `prod_${String((index % 2) + 1).padStart(3, "0")}`,
    productName: index % 2 === 0 ? "Premium Plan" : "Pro Services",
    offerId: `offer_${String(index).padStart(3, "0")}`,
    planId: index % 2 === 0 ? "monthly" : "one_time",
    amount: 49 + index * 10,
    currency: "USD",
    paymentMode: "card",
    destinationType: index % 2 === 0 ? "subscription_activation" : "service_unlock",
    successRoute: "/success",
    cancelRoute: "/cancel",
    metadata: {
      seed: true,
      batch: "financial_stack_seed",
    },
    createdAt: nowIso(),
  };
}

function makeProcessorEvent(
  opportunity: VerifiedOpportunity,
): ProcessorEvent {
  return {
    processorReference: `pi_${opportunity.verifiedOpportunityId}`,
    transactionId: `tx_${opportunity.verifiedOpportunityId}`,
    eventType: "payment_succeeded",
    amount: opportunity.amount,
    currency: opportunity.currency,
    receivedAt: nowIso(),
    rawStatus: "succeeded",
    metadata: {
      rail: "seed-rail",
    },
  };
}

resetFundTrackerJsonArtifacts();
resetFinTechionJsonArtifacts();

const activated = [];

for (let i = 1; i <= 5; i += 1) {
  const opportunity = makeOpportunity(i);
  const processorEvent = makeProcessorEvent(opportunity);

  appendVerifiedOpportunityJson(opportunity);
  appendProcessorEventJson(processorEvent);

  const result = processVerifiedOpportunity(opportunity, processorEvent);

  appendTransactionIntentJson(result.intent);
  appendVerificationDecisionJson(result.decision);

  if (result.activatedTransactionState) {
    appendActivatedTransactionStateJson(result.activatedTransactionState);
    activated.push(result.activatedTransactionState);
  }
}

const oversight = buildOversightState({
  period: "2026-04",
  transactions: activated,
  refundExposure: 0,
  disputeExposure: 0,
});

appendOversightJson(oversight);

console.log("SEEDED_TRANSACTIONS=", activated.length);
console.log("SEEDED_OVERSIGHT_ID=", oversight.oversightStateId);
console.log("SEEDED_OVERSIGHT_HEALTH=", oversight.merchantHealthState);
console.log("SEEDED_OVERSIGHT_ANOMALY_COUNT=", oversight.anomalyFlags.length);
