import {
  ProductBundleOfferingGuardResult,
  ProductBundlePricingRecord
} from "./productBundlePricingContracts";

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function checkProductBundleOfferingGuard(
  record: ProductBundlePricingRecord
): ProductBundleOfferingGuardResult {
  const boundary = {
    ...record.authorityBoundary,
    offeringGuardIsNotCheckout: true as const,
    offeringGuardIsNotPaymentCommitment: true as const,
    offeringGuardIsNotActivation: true as const
  };

  if (record.status === "DRAFT") {
    return {
      offeringGuardId: id("offering-guard"),
      pricingRecordId: record.pricingRecordId,
      checkedAt: new Date().toISOString(),
      allowed: false,
      reason: "DRAFT_PRICING_CANNOT_SURFACE",
      requiredCorrections: ["MOVE_PRICING_TO_REVIEW_AND_APPROVAL_BEFORE_OFFERING"],
      authorityBoundary: boundary
    };
  }

  if (record.status === "REVIEW_HELD") {
    return {
      offeringGuardId: id("offering-guard"),
      pricingRecordId: record.pricingRecordId,
      checkedAt: new Date().toISOString(),
      allowed: false,
      reason: "REVIEW_HELD_PRICING_CANNOT_SURFACE",
      requiredCorrections: ["RESOLVE_REVIEW_HOLD_BEFORE_OFFERING"],
      authorityBoundary: boundary
    };
  }

  if (record.status === "RETIRED") {
    return {
      offeringGuardId: id("offering-guard"),
      pricingRecordId: record.pricingRecordId,
      checkedAt: new Date().toISOString(),
      allowed: false,
      reason: "RETIRED_PRICING_CANNOT_SURFACE",
      requiredCorrections: ["CREATE_OR_SELECT_CURRENT_PRICING_RECORD"],
      authorityBoundary: boundary
    };
  }

  if (record.status === "SUPERSEDED") {
    return {
      offeringGuardId: id("offering-guard"),
      pricingRecordId: record.pricingRecordId,
      checkedAt: new Date().toISOString(),
      allowed: false,
      reason: "SUPERSEDED_PRICING_CANNOT_SURFACE",
      requiredCorrections: ["USE_CURRENT_PRICING_RECORD"],
      authorityBoundary: boundary
    };
  }

  if (record.status === "APPROVED_FOR_OFFERING") {
    return {
      offeringGuardId: id("offering-guard"),
      pricingRecordId: record.pricingRecordId,
      checkedAt: new Date().toISOString(),
      allowed: true,
      reason: "APPROVED_PRICING_CAN_SURFACE_AS_OFFER",
      requiredCorrections: [],
      authorityBoundary: boundary
    };
  }

  return {
    offeringGuardId: id("offering-guard"),
    pricingRecordId: record.pricingRecordId,
    checkedAt: new Date().toISOString(),
    allowed: false,
    reason: "PRICING_NOT_APPROVED_FOR_OFFERING",
    requiredCorrections: ["APPROVED_FOR_OFFERING_STATUS_REQUIRED"],
    authorityBoundary: boundary
  };
}
