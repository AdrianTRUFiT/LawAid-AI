import type { ActivatedTransactionState } from "../fundtracker/types";
import type { OversightBuildInput } from "./types";

const now = new Date().toISOString();

export const sampleActivatedTransactionState: ActivatedTransactionState = {
  transactionId: "tx_vo_001",
  merchantId: "m_001",
  customerId: "cust_001",
  verifiedOpportunityId: "vo_001",
  processorReference: "pi_001",
  paymentStatus: "verified",
  verificationStatus: "verified",
  grossAmount: 99,
  processorFees: 3.17,
  platformFees: 0.99,
  netAmount: 94.84,
  currency: "USD",
  entitlement: {
    productId: "prod_001",
    productName: "Premium Plan",
    offerId: "offer_001",
    planId: "monthly_001",
    destinationType: "subscription_activation",
  },
  activationPermission: true,
  destination: "subscription_activation",
  successRoute: "/success",
  cancelRoute: "/cancel",
  verifiedAt: now,
  createdAt: now,
  updatedAt: now,
  metadata: {
    channel: "web",
    rail: "stripe",
    plan: "monthly",
    processorEventType: "payment_succeeded",
    processorStatus: "succeeded",
  },
};

export const sampleOversightBuildInput: OversightBuildInput = {
  period: "2026-04",
  transactions: [sampleActivatedTransactionState],
  refundExposure: 0,
  disputeExposure: 0,
};
