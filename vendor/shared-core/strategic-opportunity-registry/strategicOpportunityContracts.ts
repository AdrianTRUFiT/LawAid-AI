export type StrategicOpportunityStatus =
  | "CODE_NOW"
  | "BUILD_QUEUE"
  | "STRATEGY_CONTEXT"
  | "MARKET_OPTION"
  | "HOLD"
  | "SUPERSEDED";

export type StrategicOpportunityPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export type StrategicOpportunitySource =
  | "conversation"
  | "coding_session"
  | "market_signal"
  | "operator_observation"
  | "research"
  | "user_directive"
  | "other";

export type StrategicOpportunityAuthorityBoundary = {
  registryEntryIsNotDoctrine: true;
  registryEntryIsNotBuildAuthorization: true;
  registryEntryIsNotProductCommitment: true;
  preservedStrategicSignalOnlyUnlessPromoted: true;
  promotionRequiresAuthorizedDecision: true;
};

export type StrategicOpportunityRecord = {
  opportunityId: string;
  title: string;
  summary: string;
  source: StrategicOpportunitySource;
  relatedModules: string[];
  status: StrategicOpportunityStatus;
  priority: StrategicOpportunityPriority;
  dependencies: string[];
  futureTrigger?: string;
  createdAt: string;
  updatedAt: string;
  authorityBoundary: StrategicOpportunityAuthorityBoundary;
};

export type StrategicOpportunityClassificationInput = {
  title: string;
  summary: string;
  source: StrategicOpportunitySource;
  relatedModules?: string[];
  priority?: StrategicOpportunityPriority;
  dependencies?: string[];
  futureTrigger?: string;
  requestedStatus?: StrategicOpportunityStatus;
};

export type StrategicOpportunityPromotionResult = {
  promotionId: string;
  opportunityId: string;
  createdAt: string;
  allowed: boolean;
  fromStatus: StrategicOpportunityStatus;
  targetStatus: "BUILD_INSTRUCTION";
  reason:
    | "CODE_NOW_SURFACED_FOR_OPERATOR_REVIEW"
    | "HELD_ITEM_CANNOT_BECOME_BUILD_INSTRUCTION"
    | "SUPERSEDED_ITEM_CANNOT_BE_PROMOTED"
    | "STATUS_NOT_ELIGIBLE_FOR_BUILD_INSTRUCTION";
  requiredCorrections: string[];
  authorityBoundary: StrategicOpportunityAuthorityBoundary & {
    promotionResultIsNotExecution: true;
    surfacedItemStillRequiresHumanAuthorization: true;
  };
};

export type StrategicOpportunityLedgerEntry = {
  ledgerEntryId: string;
  createdAt: string;
  eventType:
    | "OPPORTUNITY_CAPTURED"
    | "OPPORTUNITY_CLASSIFIED"
    | "PROMOTION_CHECKED";
  opportunityId: string;
  status: StrategicOpportunityStatus;
  ledgerPath: string;
  notes: string[];
};
