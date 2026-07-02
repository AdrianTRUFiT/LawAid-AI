export type ReadinessStatus =
  | "SAFE_TO_ACQUIRE"
  | "SAFE_WITH_CONDITIONS"
  | "HOLD_REMEDIATION_REQUIRED"
  | "NOT_AGENTIC_READY"
  | "REFUSED";

export type CertificationLevel =
  | "LEVEL_1_VISIBILITY"
  | "LEVEL_2_CONTROL"
  | "LEVEL_3_TRANSFER_READINESS"
  | "LEVEL_4_ACQUISITION_READY_INTELLIGENCE";

export interface ReadinessScores {
  aiGovernance: number;
  dataCustody: number;
  workflowTransferability: number;
  authorizationClarity: number;
  humanOverride: number;
  auditability: number;
  integrationReadiness: number;
  negotiationPreparedness: number;
  proofContinuity: number;
}

export interface CompanyReadinessPacket {
  companyId: string;
  companyName: string;
  createdAt: string;
  scores: ReadinessScores;
  evidenceSummary: string;
  knownGaps: string[];
  humanAuthorityConfirmed: boolean;
  auditTrailAvailable: boolean;
  proofContinuityAvailable: boolean;
  externalApiUsed: false;
  legalAuthorityClaimed: false;
}

export interface AcquirerProfile extends CompanyReadinessPacket {
  acquisitionIntent: string;
  integrationCapacity: number;
  capitalReadiness: number;
}

export interface TargetProfile extends CompanyReadinessPacket {
  transferReadiness: number;
  operationalDependencyRisk: number;
  dataRoomPreparedness: number;
}

export interface AgenticReadinessAssessment {
  companyId: string;
  companyName: string;
  averageScore: number;
  status: ReadinessStatus;
  certificationLevel: CertificationLevel;
  conditions: string[];
  refusedReasons: string[];
  humanReviewRequired: true;
  legalAuthorityClaimed: false;
}

export interface CompatibilityScore {
  acquirerId: string;
  targetId: string;
  compatibilityScore: number;
  status: ReadinessStatus;
  conditions: string[];
  integrationUncertainty: number;
  proofContinuityGap: number;
}

export interface DealAnswerPacket {
  status: ReadinessStatus;
  recommendedTarget: string;
  certificationLevel: CertificationLevel;
  compatibilityScore: number;
  conditions: string[];
  decisionSummary: string;
  acquirerAssessment: AgenticReadinessAssessment;
  targetAssessment: AgenticReadinessAssessment;
  noLiveNegotiation: true;
  noPayments: true;
  noBlockchain: true;
  noExternalApis: true;
  noLegalAuthority: true;
  noMarketplace: true;
  humanReviewRequired: true;
  finalAuthority: "Human";
  finalAction: "";
}