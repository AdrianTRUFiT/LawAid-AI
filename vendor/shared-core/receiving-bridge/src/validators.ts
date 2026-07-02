import type { ActivatedTransactionStateRecord } from "../../fundtracker-bridge/src/index.js";
import type { ReceivingPolicy, TrustedActivationResult } from "./contracts.js";

export function validateActivatedTransactionShape(
  value: unknown,
): value is ActivatedTransactionStateRecord {
  if (!value || typeof value !== "object") return false;

  const record = value as Record<string, unknown>;

  const requiredStringFields = [
    "activationId",
    "sourceSettlementId",
    "walletId",
    "ownerId",
    "merchantId",
    "jurisdictionCode",
    "settlementCurrency",
    "displayCurrency",
    "activationStatus",
    "occurredAt",
  ];

  for (const field of requiredStringFields) {
    if (typeof record[field] !== "string" || !record[field]) {
      return false;
    }
  }

  const requiredNumberFields = [
    "settlementAmount",
    "displayAmount",
    "realValueUnits",
  ];

  for (const field of requiredNumberFields) {
    if (typeof record[field] !== "number" || !Number.isFinite(record[field] as number)) {
      return false;
    }
  }

  if (!Array.isArray(record["fundingChoices"])) return false;

  const complianceSnapshot = record["complianceSnapshot"];
  if (!complianceSnapshot || typeof complianceSnapshot !== "object") return false;

  const compliance = complianceSnapshot as Record<string, unknown>;
  if (typeof compliance["status"] !== "string") return false;
  if (!Array.isArray(compliance["allowedRails"])) return false;
  if (!Array.isArray(compliance["acceptedValueKinds"])) return false;

  return true;
}

export function validateTrustedActivationForReceiving(input: {
  wrapped: TrustedActivationResult;
  policy: ReceivingPolicy;
}): { ok: boolean; reason: string } {
  if (!input.wrapped.trusted) {
    if (input.wrapped.decision === "REFUSED_TAMPERED") {
      return { ok: false, reason: "Activation was refused as tampered." };
    }

    if (input.wrapped.decision === "REFUSED_QUARANTINED") {
      return { ok: false, reason: "Activation was refused as quarantined." };
    }

    return { ok: false, reason: "Activation is not trusted." };
  }

  if (input.wrapped.authorizationDecision !== "approved") {
    return {
      ok: false,
      reason: `Authorization decision must be approved, received ${input.wrapped.authorizationDecision}.`,
    };
  }

  const activation = input.wrapped.activationRecord;

  if (!validateActivatedTransactionShape(activation)) {
    return {
      ok: false,
      reason: "Activation record shape is invalid.",
    };
  }

  if (activation.activationStatus !== input.policy.requiredActivationStatus) {
    return {
      ok: false,
      reason: `Activation status must be ${input.policy.requiredActivationStatus}, received ${activation.activationStatus}.`,
    };
  }

  if (activation.complianceSnapshot.status !== input.policy.requiredComplianceStatus) {
    return {
      ok: false,
      reason: `Compliance status must be ${input.policy.requiredComplianceStatus}, received ${activation.complianceSnapshot.status}.`,
    };
  }

  return {
    ok: true,
    reason: "Trusted activation validated for receiving.",
  };
}