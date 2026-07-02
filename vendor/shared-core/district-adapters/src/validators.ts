import type { LiveSystemRecord } from "../../receiving-bridge/src/index.js";
import type { DistrictIngressValidationResult } from "./contracts.js";

export function validateLiveSystemRecordForDistrict(
  incoming: unknown,
): DistrictIngressValidationResult {
  if (!incoming || typeof incoming !== "object") {
    return {
      accepted: false,
      reason: "Incoming value is not an object.",
      liveSystemRecord: null,
    };
  }

  const record = incoming as Record<string, unknown>;

  const requiredStringFields = [
    "liveRecordId",
    "sourceActivationId",
    "receivingEnvironment",
    "walletId",
    "ownerId",
    "merchantId",
    "jurisdictionCode",
    "settlementCurrency",
    "displayCurrency",
    "recordStatus",
    "occurredAt",
  ];

  for (const field of requiredStringFields) {
    if (typeof record[field] !== "string" || !record[field]) {
      return {
        accepted: false,
        reason: `Missing or invalid string field: ${field}.`,
        liveSystemRecord: null,
      };
    }
  }

  const requiredNumberFields = [
    "settlementAmount",
    "displayAmount",
    "realValueUnits",
  ];

  for (const field of requiredNumberFields) {
    if (typeof record[field] !== "number" || !Number.isFinite(record[field] as number)) {
      return {
        accepted: false,
        reason: `Missing or invalid numeric field: ${field}.`,
        liveSystemRecord: null,
      };
    }
  }

  const complianceSnapshot = record["complianceSnapshot"];
  if (!complianceSnapshot || typeof complianceSnapshot !== "object") {
    return {
      accepted: false,
      reason: "Missing complianceSnapshot.",
      liveSystemRecord: null,
    };
  }

  const compliance = complianceSnapshot as Record<string, unknown>;
  if (compliance["status"] !== "compliant") {
    return {
      accepted: false,
      reason: "Compliance status must be compliant.",
      liveSystemRecord: null,
    };
  }

  if (record["recordStatus"] !== "live") {
    return {
      accepted: false,
      reason: "recordStatus must be live.",
      liveSystemRecord: null,
    };
  }

  return {
    accepted: true,
    reason: "Live system record accepted for district adaptation.",
    liveSystemRecord: incoming as LiveSystemRecord,
  };
}