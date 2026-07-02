import type { ProcessorEvent, VerifiedOpportunity } from "./types";

const now = new Date().toISOString();

export const sampleVerifiedOpportunity: VerifiedOpportunity = {
  verifiedOpportunityId: "vo_001",
  sourceSystem: "merchant_portal",
  merchantId: "m_001",
  customerId: "cust_001",
  productId: "prod_001",
  productName: "Premium Plan",
  offerId: "offer_001",
  planId: "monthly_001",
  amount: 99,
  currency: "USD",
  paymentMode: "card",
  destinationType: "subscription_activation",
  successRoute: "/success",
  cancelRoute: "/cancel",
  metadata: {
    channel: "web",
    plan: "monthly",
  },
  createdAt: now,
};

export const sampleProcessorEvent: ProcessorEvent = {
  processorReference: "pi_001",
  transactionId: "tx_001",
  eventType: "payment_succeeded",
  amount: 99,
  currency: "USD",
  receivedAt: now,
  rawStatus: "succeeded",
  metadata: {
    rail: "stripe",
  },
};
