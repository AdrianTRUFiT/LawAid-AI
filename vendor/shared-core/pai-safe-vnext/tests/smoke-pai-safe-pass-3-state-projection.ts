import {
  projectPaiSafeTransactionState,
  runPaiSafeTransactionCircuit,
  type PaiSafeTransactionRequest
} from "../src/index.js";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const now = "2026-05-11T13:00:00.000Z";

const baseRequest: PaiSafeTransactionRequest = {
  transactionId: "txn_projection_safe",
  merchant: {
    merchantId: "merchant_001",
    displayName: "Verified Merchant",
    verifiedIdentity: true,
    knownProcessorAccount: true,
    expectedProcessorAccount: "acct_verified_merchant_001",
    supportedDestinationTypes: ["processor_account"]
  },
  consumer: {
    consumerId: "consumer_001",
    displayName: "Consumer One",
    acknowledgedTerms: true,
    acknowledgmentText: "I acknowledge the transaction terms and refund policy."
  },
  amountCents: 12500,
  currency: "USD",
  purpose: "Service package",
  paymentDestination: "acct_verified_merchant_001",
  expectedDestination: "acct_verified_merchant_001",
  destinationType: "processor_account",
  termsText: "Service will be delivered after confirmed payment and merchant acceptance.",
  refundPolicyText: "Refunds are reviewed within seven business days based on delivery status.",
  metadata: {
    routeLocked: true,
    routeOverride: false
  },
  createdAt: now
};

function buildProjection(request: PaiSafeTransactionRequest) {
  return projectPaiSafeTransactionState(runPaiSafeTransactionCircuit(request, now));
}

const safe = buildProjection(baseRequest);

assert(safe.decision === "SAFE", "safe projection should be SAFE");
assert(safe.merchant.role === "MERCHANT", "merchant role mismatch");
assert(safe.consumer.role === "CONSUMER", "consumer role mismatch");
assert(safe.internalReview.role === "INTERNAL_REVIEW", "internal role mismatch");

assert(safe.merchant.permissions.canFulfill === true, "safe merchant should be allowed to fulfill");
assert(safe.merchant.permissions.canViewInternalRiskCodes === false, "merchant must not view internal risk codes");
assert(safe.consumer.permissions.canPayWithConfidence === true, "safe consumer should be allowed to pay with confidence");
assert(safe.consumer.permissions.canViewMerchantRiskInternals === false, "consumer must not view merchant internals");
assert(safe.internalReview.permissions.canViewFullRiskCodes === true, "internal should view risk codes");
assert(safe.internalReview.permissions.canAuthorizePayment === false, "internal projection must not authorize payment");
assert(safe.internalReview.permissions.canWriteCustody === false, "internal projection must not write custody");
assert(safe.internalReview.permissions.canPromoteDoctrine === false, "internal projection must not promote doctrine");

assert(safe.merchant.reasonCategory === "NONE", "safe merchant reason category should be NONE");
assert(safe.consumer.reasonCategory === "NONE", "safe consumer reason category should be NONE");
assert(safe.internalReview.reasonCategory === "NONE", "safe internal reason category should be NONE");

assert(safe.internalReview.proofBackConsistent === true, "safe proofBack consistency failed");
assert(safe.internalReview.receiptConsistent === true, "safe receipt consistency failed");

const hold = buildProjection({
  ...baseRequest,
  transactionId: "txn_projection_hold",
  amountCents: 75000
});

assert(hold.decision === "HOLD", "hold projection should be HOLD");
assert(hold.merchant.fulfillmentReadiness === "HOLD_FOR_REVIEW", "hold merchant readiness mismatch");
assert(hold.merchant.nextStep === "WAIT_FOR_REVIEW", "hold merchant next step mismatch");
assert(hold.consumer.nextStep === "WAIT_FOR_MERCHANT_OR_SYSTEM_REVIEW", "hold consumer next step mismatch");
assert(hold.internalReview.nextStep === "INTERNAL_REVIEW_REQUIRED", "hold internal next step mismatch");
assert(hold.merchant.permissions.canFulfill === false, "hold merchant must not fulfill");
assert(hold.merchant.permissions.canRequestReview === true, "hold merchant should request review");
assert(hold.internalReview.reviewRequired === true, "hold internal reviewRequired mismatch");

const refused = buildProjection({
  ...baseRequest,
  transactionId: "txn_projection_refused",
  paymentDestination: "acct_bad_destination_001"
});

assert(refused.decision === "REFUSED", "refused projection should be REFUSED");
assert(refused.merchant.fulfillmentReadiness === "DO_NOT_FULFILL", "refused merchant readiness mismatch");
assert(refused.merchant.nextStep === "DO_NOT_FULFILL", "refused merchant next step mismatch");
assert(refused.consumer.nextStep === "TRANSACTION_REFUSED_DO_NOT_PAY", "refused consumer next step mismatch");
assert(refused.internalReview.nextStep === "INTERNAL_REFUSAL_RECORD_REQUIRED", "refused internal next step mismatch");
assert(refused.merchant.permissions.canFulfill === false, "refused merchant must not fulfill");
assert(refused.consumer.permissions.canPayWithConfidence === false, "refused consumer must not pay with confidence");
assert(refused.merchant.reasonCategory === "DESTINATION_INTEGRITY", "refused merchant reason category mismatch");
assert(refused.consumer.reasonCategory === "DESTINATION_INTEGRITY", "refused consumer reason category mismatch");
assert(refused.internalReview.riskCodes.includes("DESTINATION_MISMATCH"), "internal should include destination mismatch");

assert(
  safe.merchant.timeline.every((item) => item.visibleTo.includes("MERCHANT")),
  "merchant timeline visibility leak"
);

assert(
  safe.consumer.timeline.every((item) => item.visibleTo.includes("CONSUMER")),
  "consumer timeline visibility leak"
);

assert(
  safe.internalReview.timeline.some((item) => item.label === "Internal consistency hashes available"),
  "internal timeline missing internal hash event"
);

assert(
  safe.merchant.timeline.every((item) => item.label !== "Internal consistency hashes available"),
  "merchant should not see internal hash event"
);

assert(
  safe.consumer.timeline.every((item) => item.label !== "Internal consistency hashes available"),
  "consumer should not see internal hash event"
);

const first = buildProjection({ ...baseRequest, transactionId: "txn_projection_deterministic" });
const second = buildProjection({ ...baseRequest, transactionId: "txn_projection_deterministic" });

assert(JSON.stringify(first) === JSON.stringify(second), "projection determinism failed");

console.log("PAI_SAFE_PASS_3_STATE_PROJECTION=PASS");
console.log(JSON.stringify(
  {
    tested: [
      "merchant projection",
      "consumer projection",
      "internal review projection",
      "SAFE projection",
      "HOLD projection",
      "REFUSED projection",
      "party-specific permissions",
      "timeline visibility",
      "proof consistency visibility",
      "receipt consistency visibility",
      "deterministic projection"
    ],
    status: "PASS"
  },
  null,
  2
));