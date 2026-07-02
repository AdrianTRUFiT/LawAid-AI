export {};
import {
  assessTransactionRisk,
  createTransactionIntent,
} from "../lib/fundtracker";
import type { ProcessorEvent, VerifiedOpportunity } from "../lib/fundtracker/types";

const baseOpportunity: VerifiedOpportunity = {
  verifiedOpportunityId: "vo_policy_001",
  sourceSystem: "merchant_portal",
  merchantId: "m_201",
  customerId: "cust_policy_001",
  productId: "prod_policy_001",
  productName: "Policy Test Plan",
  offerId: "offer_policy_001",
  planId: "monthly",
  amount: 700,
  currency: "EUR",
  paymentMode: "card",
  destinationType: "subscription_activation",
  successRoute: "/success",
  cancelRoute: "/cancel",
  metadata: {},
  createdAt: new Date().toISOString(),
};

const baseEvent: ProcessorEvent = {
  processorReference: "pi_policy_001",
  transactionId: "tx_vo_policy_001",
  eventType: "payment_succeeded",
  amount: 700,
  currency: "EUR",
  receivedAt: new Date().toISOString(),
  rawStatus: "succeeded",
  metadata: {
    rail: "stripe",
  },
};

const strictIntent = createTransactionIntent(baseOpportunity);
const strictRisk = assessTransactionRisk(strictIntent, baseEvent);

const flexibleIntent = createTransactionIntent({
  ...baseOpportunity,
  merchantId: "m_202",
  verifiedOpportunityId: "vo_policy_002",
});
const flexibleRisk = assessTransactionRisk(flexibleIntent, {
  ...baseEvent,
  processorReference: "pi_policy_002",
  transactionId: "tx_vo_policy_002",
});

console.log("STRICT_MERCHANT_ID=", strictIntent.verifiedOpportunity.merchantId);
console.log("STRICT_PROFILE_SCORE=", strictRisk.score);
console.log("STRICT_PROFILE_LEVEL=", strictRisk.riskLevel);
console.log("STRICT_PROFILE_ACTION=", strictRisk.recommendedAction);

console.log("FLEX_MERCHANT_ID=", flexibleIntent.verifiedOpportunity.merchantId);
console.log("FLEX_PROFILE_SCORE=", flexibleRisk.score);
console.log("FLEX_PROFILE_LEVEL=", flexibleRisk.riskLevel);
console.log("FLEX_PROFILE_ACTION=", flexibleRisk.recommendedAction);

