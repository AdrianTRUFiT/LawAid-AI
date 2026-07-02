export type LwiHilStatus =
  | "LWI_HIL_ACCEPTED"
  | "LWI_HIL_BLOCKED"
  | "LWI_HIL_REQUIRES_HIGHER_CONTEXT";

export type LwiHilDecisionType =
  | "BUILD"
  | "PUBLISH"
  | "ROUTE"
  | "AUTHORIZE"
  | "EXPOSE"
  | "ACTIVATE"
  | "EXECUTE"
  | "REVIEW"
  | "GENERAL_INTERACTION";

export type LwiHilAuthorityLayer =
  | "PERSONAL_LAW"
  | "CANONICAL_DOCTRINE"
  | "PROJECT_SCOPE"
  | "MODULE_CONTRACT"
  | "HUMAN_AUTHORITY"
  | "VERIFIED_SOURCE_TRUTH"
  | "UNKNOWN";

export interface LwiHilInput {
  decisionId: string;
  decisionType: LwiHilDecisionType;
  actionDescription: string;
  availableContext: string[];
  authorityLayer: LwiHilAuthorityLayer;
  sourceTruthVerified: boolean;
  humanControlPreserved: boolean;
  architecturalDriftRisk: "LOW" | "MEDIUM" | "HIGH";
  exposureRisk: "LOW" | "MEDIUM" | "HIGH";
  consequenceRisk: "LOW" | "MEDIUM" | "HIGH";
}

export interface LwiHilEvaluation {
  decisionId: string;
  status: LwiHilStatus;
  highestAvailableIntelligenceLayer: string;
  canProceed: boolean;
  refusalReasons: string[];
  requiredCorrections: string[];
  governingLine: string;
  boundary: {
    lwiIsNotProduct: true;
    lwiIsNotUmbrella: true;
    lwiIsNotRateEngine: true;
    lwiIsNotDashboard: true;
    lwiIsNotAuthorityOverride: true;
    hilDoesNotOutrunAuthority: true;
    humanControlRequired: true;
  };
}
