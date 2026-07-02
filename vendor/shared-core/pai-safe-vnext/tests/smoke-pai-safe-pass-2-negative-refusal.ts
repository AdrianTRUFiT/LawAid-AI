import {
  runPaiSafeTransactionCircuit,
  type PaiSafeRiskCode,
  type PaiSafeTransactionRequest
} from "../src/index.js";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const now = "2026-05-11T12:00:00.000Z";

const baseRequest: PaiSafeTransactionRequest = {
  transactionId: "txn_base_001",
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

function runCase(
  name: string,
  request: PaiSafeTransactionRequest,
  expectedDecision: "SAFE" | "HOLD" | "REFUSED",
  expectedRisks: PaiSafeRiskCode[]
): void {
  const result = runPaiSafeTransactionCircuit(request, now);

  assert(result.trustCheck.decision === expectedDecision, `${name}: expected ${expectedDecision}, got ${result.trustCheck.decision}`);

  for (const risk of expectedRisks) {
    assert(result.trustCheck.riskCodes.includes(risk), `${name}: missing expected risk ${risk}`);
  }

  assert(result.proofBack.transactionId === result.trustCheck.transactionId, `${name}: proofBack transaction mismatch`);
  assert(result.proofBack.decision === result.trustCheck.decision, `${name}: proofBack decision mismatch`);
  assert(result.proofBack.requestHash === result.trustCheck.requestHash, `${name}: proofBack requestHash mismatch`);
  assert(result.proofBack.decisionHash === result.trustCheck.decisionHash, `${name}: proofBack decisionHash mismatch`);
  assert(result.proofBack.recordHash.startsWith("psh_"), `${name}: proofBack recordHash missing`);

  assert(result.receipt.transactionId === result.trustCheck.transactionId, `${name}: receipt transaction mismatch`);
  assert(result.receipt.proofBackId === result.proofBack.proofBackId, `${name}: receipt proofBack mismatch`);
  assert(result.receipt.requestHash === result.trustCheck.requestHash, `${name}: receipt requestHash mismatch`);
  assert(result.receipt.decisionHash === result.trustCheck.decisionHash, `${name}: receipt decisionHash mismatch`);
  assert(result.receipt.recordHash === result.proofBack.recordHash, `${name}: receipt recordHash mismatch`);
  assert(result.receipt.receiptHash.startsWith("psh_"), `${name}: receiptHash missing`);
  assert(result.receipt.merchantView.transactionStatus === expectedDecision, `${name}: merchant status mismatch`);
  assert(result.receipt.consumerView.safePayStatus === expectedDecision, `${name}: consumer status mismatch`);

  if (expectedDecision === "SAFE") {
    assert(result.receipt.merchantView.fulfillmentReadiness === "READY_TO_FULFILL", `${name}: safe readiness mismatch`);
  }

  if (expectedDecision === "HOLD") {
    assert(result.trustCheck.reviewRequired === true, `${name}: hold should require review`);
    assert(result.receipt.merchantView.fulfillmentReadiness === "HOLD_FOR_REVIEW", `${name}: hold readiness mismatch`);
  }

  if (expectedDecision === "REFUSED") {
    assert(result.trustCheck.reviewRequired === false, `${name}: refused should not be approval/review-ready`);
    assert(result.receipt.merchantView.fulfillmentReadiness === "DO_NOT_FULFILL", `${name}: refused readiness mismatch`);
  }
}

runCase("safe-baseline", baseRequest, "SAFE", ["NO_BLOCKING_RISK"]);

runCase(
  "missing-merchant-identity",
  { ...baseRequest, transactionId: "txn_missing_merchant", merchant: { ...baseRequest.merchant, merchantId: "" } },
  "REFUSED",
  ["MISSING_MERCHANT_IDENTITY"]
);

runCase(
  "invalid-merchant-identity",
  { ...baseRequest, transactionId: "txn_invalid_merchant", merchant: { ...baseRequest.merchant, verifiedIdentity: false } },
  "REFUSED",
  ["INVALID_MERCHANT_IDENTITY"]
);

runCase(
  "unknown-processor-account",
  { ...baseRequest, transactionId: "txn_unknown_processor", merchant: { ...baseRequest.merchant, knownProcessorAccount: false } },
  "HOLD",
  ["UNKNOWN_PROCESSOR_ACCOUNT"]
);

runCase(
  "missing-terms",
  { ...baseRequest, transactionId: "txn_missing_terms", termsText: "" },
  "HOLD",
  ["MISSING_TERMS"]
);

runCase(
  "missing-refund-policy",
  { ...baseRequest, transactionId: "txn_missing_refund", refundPolicyText: "" },
  "HOLD",
  ["MISSING_REFUND_POLICY"]
);

runCase(
  "missing-consumer-ack",
  { ...baseRequest, transactionId: "txn_missing_ack", consumer: { ...baseRequest.consumer, acknowledgedTerms: false } },
  "HOLD",
  ["CONSUMER_ACK_MISSING"]
);

runCase(
  "destination-mismatch",
  { ...baseRequest, transactionId: "txn_dest_mismatch", paymentDestination: "acct_bad_destination_001" },
  "REFUSED",
  ["DESTINATION_MISMATCH"]
);

runCase(
  "invalid-destination-format",
  { ...baseRequest, transactionId: "txn_bad_dest_format", paymentDestination: "bad" },
  "REFUSED",
  ["INVALID_DESTINATION_FORMAT"]
);

runCase(
  "unsupported-destination-type",
  { ...baseRequest, transactionId: "txn_unsupported_destination", destinationType: "wallet" },
  "REFUSED",
  ["UNSUPPORTED_DESTINATION_TYPE"]
);

runCase(
  "high-amount-review",
  { ...baseRequest, transactionId: "txn_high_amount", amountCents: 75000 },
  "HOLD",
  ["AMOUNT_REVIEW_REQUIRED"]
);

runCase(
  "contradictory-consent",
  { ...baseRequest, transactionId: "txn_contradictory_consent", consumer: { ...baseRequest.consumer, consentContradiction: true } },
  "REFUSED",
  ["CONTRADICTORY_TRANSACTION_CONSENT"]
);

runCase(
  "conflicting-metadata",
  {
    ...baseRequest,
    transactionId: "txn_conflicting_metadata",
    metadata: {
      sellerClaimsRefundable: true,
      termsClaimFinalSale: true
    }
  },
  "REFUSED",
  ["CONFLICTING_TRANSACTION_METADATA"]
);

runCase(
  "duplicate-transaction",
  { ...baseRequest, transactionId: "txn_duplicate", duplicateOfTransactionId: "txn_base_001" },
  "REFUSED",
  ["DUPLICATE_TRANSACTION_ATTEMPT"]
);

runCase(
  "multiple-risk-combination",
  {
    ...baseRequest,
    transactionId: "txn_multi_risk",
    termsText: "",
    refundPolicyText: "",
    consumer: { ...baseRequest.consumer, acknowledgedTerms: false },
    amountCents: 90000
  },
  "HOLD",
  ["MULTIPLE_RISK_COMBINATION"]
);

const first = runPaiSafeTransactionCircuit({ ...baseRequest, transactionId: "txn_deterministic" }, now);
const second = runPaiSafeTransactionCircuit({ ...baseRequest, transactionId: "txn_deterministic" }, now);

assert(first.trustCheck.requestHash === second.trustCheck.requestHash, "Deterministic requestHash failed");
assert(first.trustCheck.decisionHash === second.trustCheck.decisionHash, "Deterministic decisionHash failed");
assert(first.proofBack.recordHash === second.proofBack.recordHash, "Deterministic recordHash failed");
assert(first.receipt.receiptHash === second.receipt.receiptHash, "Deterministic receiptHash failed");

console.log("PAI_SAFE_PASS_2_NEGATIVE_REFUSAL_HARDENING=PASS");
console.log(JSON.stringify(
  {
    tested: [
      "missing merchant identity",
      "invalid merchant identity",
      "unknown processor account",
      "missing terms",
      "missing refund policy",
      "missing consumer acknowledgment",
      "destination mismatch",
      "invalid destination formatting",
      "unsupported destination type",
      "high amount review",
      "contradictory consent",
      "conflicting metadata",
      "duplicate transaction",
      "multiple risk combination",
      "proof consistency",
      "receipt consistency",
      "deterministic hashes"
    ],
    status: "PASS"
  },
  null,
  2
));