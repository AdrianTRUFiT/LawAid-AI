import {
  StrategicOpportunityPromotionResult,
  StrategicOpportunityRecord
} from "./strategicOpportunityContracts";

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function checkPromotionToBuildInstruction(
  record: StrategicOpportunityRecord
): StrategicOpportunityPromotionResult {
  const baseBoundary = {
    ...record.authorityBoundary,
    promotionResultIsNotExecution: true as const,
    surfacedItemStillRequiresHumanAuthorization: true as const
  };

  if (record.status === "SUPERSEDED") {
    return {
      promotionId: id("promotion-check"),
      opportunityId: record.opportunityId,
      createdAt: new Date().toISOString(),
      allowed: false,
      fromStatus: record.status,
      targetStatus: "BUILD_INSTRUCTION",
      reason: "SUPERSEDED_ITEM_CANNOT_BE_PROMOTED",
      requiredCorrections: ["CREATE_NEW_CURRENT_RECORD_OR_REAUTHORIZE_SUPERSEDED_SIGNAL"],
      authorityBoundary: baseBoundary
    };
  }

  if (record.status === "HOLD") {
    return {
      promotionId: id("promotion-check"),
      opportunityId: record.opportunityId,
      createdAt: new Date().toISOString(),
      allowed: false,
      fromStatus: record.status,
      targetStatus: "BUILD_INSTRUCTION",
      reason: "HELD_ITEM_CANNOT_BECOME_BUILD_INSTRUCTION",
      requiredCorrections: ["CHANGE_STATUS_WITH_AUTHORIZED_DECISION_BEFORE_BUILD"],
      authorityBoundary: baseBoundary
    };
  }

  if (record.status === "CODE_NOW") {
    return {
      promotionId: id("promotion-check"),
      opportunityId: record.opportunityId,
      createdAt: new Date().toISOString(),
      allowed: true,
      fromStatus: record.status,
      targetStatus: "BUILD_INSTRUCTION",
      reason: "CODE_NOW_SURFACED_FOR_OPERATOR_REVIEW",
      requiredCorrections: [],
      authorityBoundary: baseBoundary
    };
  }

  return {
    promotionId: id("promotion-check"),
    opportunityId: record.opportunityId,
    createdAt: new Date().toISOString(),
    allowed: false,
    fromStatus: record.status,
    targetStatus: "BUILD_INSTRUCTION",
    reason: "STATUS_NOT_ELIGIBLE_FOR_BUILD_INSTRUCTION",
    requiredCorrections: ["PROMOTE_TO_CODE_NOW_WITH_AUTHORIZED_DECISION_FIRST"],
    authorityBoundary: baseBoundary
  };
}
