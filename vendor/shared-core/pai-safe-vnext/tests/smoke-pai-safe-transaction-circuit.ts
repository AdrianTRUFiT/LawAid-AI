import {
  runPaiSafeTransactionCircuit,
  type PaiSafeTransactionRequest
} from "../src/index.js";

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

const now = "2026-05-10T12:00:00.000Z";

const safeRequest: PaiSafeTransactionRequest = {
  transactionId: "txn_safe_001",
  merchant: {
    merchantId: "merchant_001",
    displayName: "Verified Merchant",
    verifiedIdentity: true,
    knownProcessorAccount: true
  },
  consumer: {
    consumerId: "consumer_001",
    displayName: "Consumer One",
    acknowledgedTerms: true
  },
  amountCents: 12500,
  currency: "USD",
  purpose: "Service package",
  paymentDestination: "acct_verified_merchant_001",
  expectedDestination: "acct_verified_merchant_001",
  termsText: "Service will be delivered after confirmed payment and merchant acceptance.",
  refundPolicyText: "Refunds are reviewed within seven business days based on delivery status.",
  createdAt: now
};

const holdRequest: PaiSafeTransactionRequest = {
  ...safeRequest,
  transactionId: "txn_hold_001",
  amountCents: 75000
};

const refusedRequest: PaiSafeTransactionRequest = {
  ...safeRequest,
  transactionId: "txn_refused_001",
  paymentDestination: "acct_unknown_destination",
  expectedDestination: "acct_verified_merchant_001"
};

const safe = runPaiSafeTransactionCircuit(safeRequest, now);
const hold = runPaiSafeTransactionCircuit(holdRequest, now);
const refused = runPaiSafeTransactionCircuit(refusedRequest, now);

assert(safe.trustCheck.decision === "SAFE", "Expected SAFE decision.");
assert(safe.receipt.merchantView.fulfillmentReadiness === "READY_TO_FULFILL", "Expected safe fulfillment readiness.");
assert(safe.proofBack.recordStatus === "GENERATED", "Expected ProofBack record.");

assert(hold.trustCheck.decision === "HOLD", "Expected HOLD decision.");
assert(hold.trustCheck.reviewRequired === true, "Expected HOLD review required.");
assert(hold.receipt.merchantView.fulfillmentReadiness === "HOLD_FOR_REVIEW", "Expected hold fulfillment status.");

assert(refused.trustCheck.decision === "REFUSED", "Expected REFUSED decision.");
assert(refused.trustCheck.riskCodes.includes("DESTINATION_MISMATCH"), "Expected destination mismatch.");
assert(refused.receipt.merchantView.fulfillmentReadiness === "DO_NOT_FULFILL", "Expected do-not-fulfill status.");

console.log("PAI_SAFE_TRANSACTION_CIRCUIT_SMOKE=PASS");
console.log(JSON.stringify(
  {
    safe: safe.trustCheck.decision,
    hold: hold.trustCheck.decision,
    refused: refused.trustCheck.decision,
    safeProofBack: safe.proofBack.proofBackId,
    holdProofBack: hold.proofBack.proofBackId,
    refusedProofBack: refused.proofBack.proofBackId
  },
  null,
  2
));
