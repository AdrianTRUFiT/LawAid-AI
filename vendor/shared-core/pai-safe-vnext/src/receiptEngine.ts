import type {
  PaiSafeDecision,
  PaiSafeTransactionRequest,
  PaiSafeTrustCheck,
  ProofBackedReceipt,
  ProofBackProtectionRecord
} from "./contracts.js";
import { deterministicHash } from "./integrityUtils.js";

type FulfillmentReadiness = ProofBackedReceipt["merchantView"]["fulfillmentReadiness"];
type DisputeSupportStatus = ProofBackedReceipt["merchantView"]["disputeSupportStatus"];

export function generateProofBackedReceipt(
  request: PaiSafeTransactionRequest,
  trustCheck: PaiSafeTrustCheck,
  proofBack: ProofBackProtectionRecord,
  issuedAt = new Date().toISOString()
): ProofBackedReceipt {
  const decision: PaiSafeDecision = trustCheck.decision;

  const fulfillmentReadiness: FulfillmentReadiness =
    decision === "SAFE"
      ? "READY_TO_FULFILL"
      : decision === "HOLD"
        ? "HOLD_FOR_REVIEW"
        : "DO_NOT_FULFILL";

  const disputeSupportStatus: DisputeSupportStatus =
    decision === "SAFE"
      ? "PROOF_RECORD_AVAILABLE"
      : decision === "HOLD"
        ? "REVIEW_RECORD_AVAILABLE"
        : "REFUSAL_RECORD_AVAILABLE";

  const base = {
    receiptId: `receipt_${request.transactionId}`,
    transactionId: request.transactionId,
    proofBackId: proofBack.proofBackId,
    requestHash: trustCheck.requestHash,
    decisionHash: trustCheck.decisionHash,
    recordHash: proofBack.recordHash,
    merchantView: {
      transactionStatus: decision,
      fulfillmentReadiness,
      disputeSupportStatus
    },
    consumerView: {
      safePayStatus: decision,
      proofAvailable: true as const,
      message:
        decision === "SAFE"
          ? "This transaction passed the advisory safety check and has a proof-backed record."
          : decision === "HOLD"
            ? "This transaction requires review before full confidence or fulfillment."
            : "This transaction was refused in the advisory safety check due to blocking risk."
    },
    issuedAt
  };

  return {
    ...base,
    receiptHash: deterministicHash(base)
  };
}