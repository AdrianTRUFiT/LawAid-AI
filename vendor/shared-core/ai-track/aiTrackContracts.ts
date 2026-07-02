export type ZoneType =
  | "GOVERNED_ZONE"
  | "FREE_EXPRESSIVE_ZONE"
  | "COMMONS_ZONE";

export type UsageDecision =
  | "APPROVED"
  | "REFUSED"
  | "HELD"
  | "ESCALATED"
  | "ROUTED";

export type ContributionLayer =
  | "SOURCE"
  | "USE"
  | "COMBINATION"
  | "INFLUENCE"
  | "AUTHORITY"
  | "VALUE"
  | "TRACE";

export type IdentityUsageInput = {
  identityId: string;
  assetId: string;
  usageId: string;
  zoneType: ZoneType;
  consent: boolean;
  scopeMatched: boolean;
  attributionPresent: boolean;
  valueRoutingPresent: boolean;
  narrativeClaim?: string;
  presenceSignal?: boolean;
  contributionLayers: ContributionLayer[];
};

export type IdentityUsageResult = {
  decision: UsageDecision;
  reason: string;
  traceRequired: boolean;
  consequenceAllowed: boolean;
};
