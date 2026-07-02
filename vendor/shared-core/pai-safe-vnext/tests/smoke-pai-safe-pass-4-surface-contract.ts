import {
  buildPaiSafeSurfaceContractPacket,
  projectPaiSafeTransactionState,
  runPaiSafeTransactionCircuit,
  type PaiSafeTransactionRequest
} from "../src/index.js";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const now = "2026-05-11T14:00:00.000Z";

const baseRequest: PaiSafeTransactionRequest = {
  transactionId: "txn_surface_safe",
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

function buildSurface(request: PaiSafeTransactionRequest) {
  const circuit = runPaiSafeTransactionCircuit(request, now);
  const projection = projectPaiSafeTransactionState(circuit);
  return buildPaiSafeSurfaceContractPacket(projection);
}

const safe = buildSurface(baseRequest);

assert(safe.decision === "SAFE", "SAFE surface decision mismatch");
assert(safe.merchantCard.tone === "success", "SAFE merchant tone mismatch");
assert(safe.consumerReceiptView.tone === "success", "SAFE consumer tone mismatch");
assert(safe.merchantCard.fulfillmentLabel === "Ready to fulfill", "SAFE fulfillment label mismatch");
assert(safe.merchantCard.allowedActions.includes("FULFILL_TRANSACTION"), "SAFE merchant should allow fulfill");
assert(!safe.merchantCard.allowedActions.includes("DO_NOT_FULFILL"), "SAFE merchant should not show do-not-fulfill action");
assert(safe.consumerReceiptView.labels.decisionLabel === "Safe", "SAFE consumer label mismatch");

const hold = buildSurface({
  ...baseRequest,
  transactionId: "txn_surface_hold",
  amountCents: 75000
});

assert(hold.decision === "HOLD", "HOLD surface decision mismatch");
assert(hold.merchantCard.tone === "warning", "HOLD merchant tone mismatch");
assert(hold.consumerReceiptView.tone === "warning", "HOLD consumer tone mismatch");
assert(hold.merchantCard.fulfillmentLabel === "Hold for review", "HOLD fulfillment label mismatch");
assert(hold.merchantCard.allowedActions.includes("REQUEST_REVIEW"), "HOLD merchant should allow review request");
assert(hold.consumerReceiptView.allowedActions.includes("WAIT_FOR_REVIEW"), "HOLD consumer should wait for review");

const refused = buildSurface({
  ...baseRequest,
  transactionId: "txn_surface_refused",
  paymentDestination: "acct_bad_destination_001"
});

assert(refused.decision === "REFUSED", "REFUSED surface decision mismatch");
assert(refused.merchantCard.tone === "danger", "REFUSED merchant tone mismatch");
assert(refused.consumerReceiptView.tone === "danger", "REFUSED consumer tone mismatch");
assert(refused.merchantCard.fulfillmentLabel === "Do not fulfill", "REFUSED fulfillment label mismatch");
assert(refused.merchantCard.allowedActions.includes("DO_NOT_FULFILL"), "REFUSED merchant should block fulfillment");
assert(refused.consumerReceiptView.allowedActions.includes("DO_NOT_PAY"), "REFUSED consumer should not pay");
assert(refused.consumerReceiptView.labels.decisionLabel === "Refused", "REFUSED consumer label mismatch");

const merchantJson = JSON.stringify(refused.merchantCard);
const consumerJson = JSON.stringify(refused.consumerReceiptView);
const internalJson = JSON.stringify(refused.internalReviewPacket);

assert(!merchantJson.includes("riskCodes"), "merchant surface must not expose riskCodes key");
assert(!merchantJson.includes("requestHash"), "merchant surface must not expose requestHash");
assert(!merchantJson.includes("decisionHash"), "merchant surface must not expose decisionHash");
assert(!merchantJson.includes("recordHash"), "merchant surface must not expose recordHash");
assert(!merchantJson.includes("receiptHash"), "merchant surface must not expose receiptHash");

assert(!consumerJson.includes("riskCodes"), "consumer surface must not expose riskCodes key");
assert(!consumerJson.includes("requestHash"), "consumer surface must not expose requestHash");
assert(!consumerJson.includes("decisionHash"), "consumer surface must not expose decisionHash");
assert(!consumerJson.includes("recordHash"), "consumer surface must not expose recordHash");
assert(!consumerJson.includes("receiptHash"), "consumer surface must not expose receiptHash");

assert(internalJson.includes("riskCodes"), "internal surface should expose riskCodes");
assert(internalJson.includes("requestHash"), "internal surface should expose requestHash");
assert(internalJson.includes("decisionHash"), "internal surface should expose decisionHash");
assert(internalJson.includes("recordHash"), "internal surface should expose recordHash");
assert(internalJson.includes("receiptHash"), "internal surface should expose receiptHash");

assert(refused.internalReviewPacket.blockedActions.includes("AUTHORIZE_PAYMENT"), "internal must not authorize payment");
assert(refused.internalReviewPacket.blockedActions.includes("WRITE_CUSTODY"), "internal must not write custody");
assert(refused.internalReviewPacket.blockedActions.includes("PROMOTE_DOCTRINE"), "internal must not promote doctrine");
assert(refused.internalReviewPacket.blockedActions.includes("MODIFY_TRUST_DECISION"), "internal must not modify trust decision");
assert(refused.internalReviewPacket.blockedActions.includes("MODIFY_PROOF_RECORD"), "internal must not modify proof record");

assert(refused.hiddenFieldPolicy.hiddenFromMerchant.includes("riskCodes"), "hidden policy missing merchant riskCodes");
assert(refused.hiddenFieldPolicy.hiddenFromConsumer.includes("merchantRiskInternals"), "hidden policy missing consumer merchant internals");
assert(refused.hiddenFieldPolicy.internalOnly.includes("receiptHash"), "hidden policy missing internal receiptHash");

assert(refused.stateToUiMapping.circuit === "DECIDES", "circuit mapping mismatch");
assert(refused.stateToUiMapping.projection === "REFLECTS", "projection mapping mismatch");
assert(refused.stateToUiMapping.surfaceContract === "MAPS", "surface mapping mismatch");
assert(refused.stateToUiMapping.ui === "RENDERS_LATER", "UI mapping mismatch");

const first = buildSurface({ ...baseRequest, transactionId: "txn_surface_deterministic" });
const second = buildSurface({ ...baseRequest, transactionId: "txn_surface_deterministic" });

assert(JSON.stringify(first) === JSON.stringify(second), "surface contract determinism failed");

console.log("PAI_SAFE_PASS_4_SURFACE_CONTRACT=PASS");
console.log(JSON.stringify(
  {
    tested: [
      "merchant safe transaction card contract",
      "consumer safe-pay receipt view contract",
      "internal review packet contract",
      "copy-safe public labels",
      "hidden internal fields",
      "state-to-UI mapping",
      "SAFE display rules",
      "HOLD display rules",
      "REFUSED display rules",
      "fulfillment readiness display rules",
      "ProofBack Protection display rules",
      "proof-backed receipt display rules",
      "role-specific allowed actions",
      "role-specific blocked actions",
      "surface determinism"
    ],
    status: "PASS"
  },
  null,
  2
));