import type {
  PaiSafeTransactionRequest,
  PaiSafeTrustCheck,
  ProofBackProtectionRecord
} from "./contracts.js";
import { deterministicHash } from "./integrityUtils.js";

export function generateProofBackProtectionRecord(
  request: PaiSafeTransactionRequest,
  trustCheck: PaiSafeTrustCheck,
  generatedAt = new Date().toISOString()
): ProofBackProtectionRecord {
  const base = {
    proofBackId: `pbp_${request.transactionId}`,
    transactionId: request.transactionId,
    decision: trustCheck.decision,
    riskCodes: trustCheck.riskCodes,
    merchantId: request.merchant.merchantId,
    consumerId: request.consumer.consumerId,
    amountCents: request.amountCents,
    currency: request.currency,
    purpose: request.purpose,
    paymentDestination: request.paymentDestination,
    requestHash: trustCheck.requestHash,
    decisionHash: trustCheck.decisionHash,
    recordStatus: "GENERATED" as const,
    generatedAt
  };

  return {
    ...base,
    recordHash: deterministicHash(base)
  };
}