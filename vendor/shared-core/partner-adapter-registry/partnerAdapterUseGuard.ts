import {
  PartnerAdapterDefinition,
  PartnerAdapterUseGuardResult
} from "./partnerAdapterContracts";

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function checkPartnerAdapterUseGuard(
  adapter: PartnerAdapterDefinition
): PartnerAdapterUseGuardResult {
  const boundary = {
    ...adapter.authorityBoundary,
    useGuardIsNotExecution: true as const,
    useGuardIsNotActivation: true as const,
    useGuardIsNotTransactionTruth: true as const
  };

  if (adapter.status === "DRAFT") {
    return {
      useGuardId: id("partner-use-guard"),
      partnerAdapterId: adapter.partnerAdapterId,
      checkedAt: new Date().toISOString(),
      allowed: false,
      reason: "DRAFT_ADAPTER_CANNOT_CONNECT",
      requiredCorrections: ["MOVE_ADAPTER_TO_REVIEW_AND_APPROVAL_BEFORE_USE"],
      authorityBoundary: boundary
    };
  }

  if (adapter.status === "REVIEW_HELD") {
    return {
      useGuardId: id("partner-use-guard"),
      partnerAdapterId: adapter.partnerAdapterId,
      checkedAt: new Date().toISOString(),
      allowed: false,
      reason: "REVIEW_HELD_ADAPTER_CANNOT_CONNECT",
      requiredCorrections: ["RESOLVE_REVIEW_HOLD_BEFORE_USE"],
      authorityBoundary: boundary
    };
  }

  if (adapter.status === "RETIRED") {
    return {
      useGuardId: id("partner-use-guard"),
      partnerAdapterId: adapter.partnerAdapterId,
      checkedAt: new Date().toISOString(),
      allowed: false,
      reason: "RETIRED_ADAPTER_CANNOT_CONNECT",
      requiredCorrections: ["CREATE_OR_SELECT_CURRENT_PARTNER_ADAPTER"],
      authorityBoundary: boundary
    };
  }

  if (adapter.status === "SUPERSEDED") {
    return {
      useGuardId: id("partner-use-guard"),
      partnerAdapterId: adapter.partnerAdapterId,
      checkedAt: new Date().toISOString(),
      allowed: false,
      reason: "SUPERSEDED_ADAPTER_CANNOT_CONNECT",
      requiredCorrections: ["USE_CURRENT_PARTNER_ADAPTER"],
      authorityBoundary: boundary
    };
  }

  if (adapter.status === "APPROVED_FOR_TEST") {
    return {
      useGuardId: id("partner-use-guard"),
      partnerAdapterId: adapter.partnerAdapterId,
      checkedAt: new Date().toISOString(),
      allowed: true,
      reason: "APPROVED_ADAPTER_CAN_SURFACE_FOR_TEST",
      requiredCorrections: [],
      authorityBoundary: boundary
    };
  }

  if (adapter.status === "APPROVED_FOR_PRODUCTION") {
    return {
      useGuardId: id("partner-use-guard"),
      partnerAdapterId: adapter.partnerAdapterId,
      checkedAt: new Date().toISOString(),
      allowed: true,
      reason: "APPROVED_ADAPTER_CAN_SURFACE_FOR_PRODUCTION",
      requiredCorrections: [],
      authorityBoundary: boundary
    };
  }

  return {
    useGuardId: id("partner-use-guard"),
    partnerAdapterId: adapter.partnerAdapterId,
    checkedAt: new Date().toISOString(),
    allowed: false,
    reason: "ADAPTER_NOT_APPROVED_FOR_USE",
    requiredCorrections: ["APPROVED_ADAPTER_STATUS_REQUIRED"],
    authorityBoundary: boundary
  };
}
