import type { SettlementBridgePolicy } from "./trustBridgeContracts.js";
import type { SettlementRecord } from "./contracts.js";

export function validateSettlementShape(
  value: unknown,
): value is SettlementRecord {
  if (!value || typeof value !== "object") return false;

  const record = value as Record<string, unknown>;

  const requiredStringFields = [
    "settlementId",
    "walletId",
    "ownerId",
    "merchantId",
    "jurisdictionCode",
    "selectedRail",
    "settlementCurrency",
    "displayCurrency",
    "status",
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

export function validateSettlementPolicy(
  record: SettlementRecord,
  policy: SettlementBridgePolicy,
): { ok: boolean; reason: string } {
  if (policy.requireSettledStatus && record.status !== "settled") {
    return {
      ok: false,
      reason: `Settlement status must be settled, received ${record.status}.`,
    };
  }

  if (record.complianceSnapshot.status !== policy.requireComplianceStatus) {
    return {
      ok: false,
      reason: `Compliance status must be ${policy.requireComplianceStatus}, received ${record.complianceSnapshot.status}.`,
    };
  }

  return {
    ok: true,
    reason: "Settlement policy validated.",
  };
}