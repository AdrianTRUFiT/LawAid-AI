export type HilRegistryStatus =
  | "VERIFIED"
  | "VERIFIED_WITH_FALSE_PASS_HISTORY"
  | "MISSING_REPORT"
  | "NOT_VERIFIED";

export type HilModuleClass =
  | "CERTIFICATION_ENGINE"
  | "DEAL_VALUE_ASSESSMENT"
  | "NEGOTIATION_INTELLIGENCE"
  | "COMMERCE_MODEL"
  | "VERIFIED_EXPERIENCE_RAIL"
  | "LOCAL_COCKPIT"
  | "READINESS_ENGINE"
  | "PAYMENT_SAFETY_RAIL";

export interface HilVerifiedModuleRecord {
  moduleId: string;
  moduleName: string;
  moduleClass: HilModuleClass;
  modulePath: string;
  expectedVerifiedReports: string[];
  knownFalsePassReports: string[];
  status: HilRegistryStatus;
  verified: boolean;
  hasFalsePassHistory: boolean;
  boundaries: string[];
  latestVerifiedReport: string | null;
  nextAction: string;
  humanFinalAuthority: true;
  finalAction: "";
}

export interface HilVerifiedRegistrySnapshot {
  createdAt: string;
  registryId: string;
  records: HilVerifiedModuleRecord[];
  verifiedCount: number;
  verifiedCleanCount: number;
  verifiedWithFalsePassHistoryCount: number;
  falsePassCount: number;
  missingReportCount: number;
  allCriticalVerified: boolean;
  humanFinalAuthority: true;
  finalAction: "";
}