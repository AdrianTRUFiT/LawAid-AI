import type { ActivatedTransactionStateRecord } from "../../fundtracker-bridge/src/index.js";
import type { FinTechionAIOversightInput } from "./contracts.js";

export function validateActivationRecordShape(
  value: unknown,
): value is ActivatedTransactionStateRecord {
  if (!value || typeof value !== "object") return false;

  const record = value as Record<string, unknown>;

  const requiredStrings = [
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

  for (const field of requiredStrings) {
    if (typeof record[field] !== "string" || !record[field]) {
      return false;
    }
  }

  const requiredNumbers = [
    "settlementAmount",
    "displayAmount",
    "realValueUnits",
  ];

  for (const field of requiredNumbers) {
    if (typeof record[field] !== "number" || !Number.isFinite(record[field] as number)) {
      return false;
    }
  }

  return true;
}

export function validateOversightInput(
  input: FinTechionAIOversightInput,
): { ok: boolean; reason: string } {
  if (!Array.isArray(input.activationRecords) || input.activationRecords.length === 0) {
    return {
      ok: false,
      reason: "At least one activation record is required.",
    };
  }

  for (const record of input.activationRecords) {
    if (!validateActivationRecordShape(record)) {
      return {
        ok: false,
        reason: "Activation record shape is invalid.",
      };
    }

    if (record.activationStatus !== "activated") {
      return {
        ok: false,
        reason: `Activation record ${record.activationId} is not activated.`,
      };
    }
  }

  if (!input.protectedFlow || !input.protectedFlow.snapshot) {
    return {
      ok: false,
      reason: "Protected flow snapshot is required.",
    };
  }

  return {
    ok: true,
    reason: "Oversight input is valid.",
  };
}