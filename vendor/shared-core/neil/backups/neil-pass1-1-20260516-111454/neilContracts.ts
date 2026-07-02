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

export type NeilMatterType =
  | "ARMANIS_DEAL_NEGOTIATION"
  | "LAWAI_NEGOTIATION"
  | "COMMERCIAL_NEGOTIATION"
  | "INTERNAL_STRATEGY_REVIEW";

export type NeilPressureLevel =
  | "LOW"
  | "MODERATE"
  | "HIGH"
  | "HOSTILE";

export type NeilPrimetimeModeState =
  | "INACTIVE"
  | "ACTIVATION_REQUESTED"
  | "ACTIVE"
  | "DEACTIVATED"
  | "REFUSED_BOUNDARY";

export type NeilNegotiationStatus =
  | "READY_FOR_HUMAN_REVIEW"
  | "PRIMETIME_ACTIVE"
  | "HOLD_FOR_CONTEXT"
  | "ESCALATE_TO_HUMAN"
  | "REFUSED_BOUNDARY";

export type NeilStrategyMove =
  | "STRATEGIC_SILENCE"
  | "CLARIFY_AUTHORITY"
  | "REFRAME_PRESSURE"
  | "REQUEST_PROOF"
  | "COUNTER_WITH_CONDITIONS"
  | "DELAY_UNTIL_DOCUMENTED"
  | "HUMAN_REVIEW_ONLY";

export interface NeilArmanisReference {
  status: ReadinessStatus;
  recommendedTarget: string;
  certificationLevel: CertificationLevel;
  compatibilityScore: number;
  conditions: string[];
  decisionSummary: string;
  finalAuthority: "Human";
  finalAction: "";
}

export interface NeilNegotiationContext {
  contextId: string;
  createdAt: string;
  matterType: NeilMatterType;
  counterpart: string;
  objective: string;
  pressureLevel: NeilPressureLevel;
  knownFacts: string[];
  constraints: string[];
  requestedOutcome: string;
  primetimeTriggerPhrase: string | null;
  armanisReference: NeilArmanisReference | null;

  /**
   * Input flags are boolean because NEIL must be able to receive
   * prohibited requests and deterministically refuse them.
   */
  legalAuthorityClaimed: boolean;
  liveNegotiationRequested: boolean;
  externalApiUsed: boolean;
  paymentRequested: boolean;
  signatureRequested: boolean;
}

export interface NeilPrimetimeProtocol {
  activationPhrase: "You think this is a game? …Primetime.";
  deactivationPhrase: "Signal clear. Resume standard.";
  modeState: NeilPrimetimeModeState;
  languageProfile: "COMPRESSED_CALCULATED_LAYERED";
  toneProfile: "ASSERTIVE_NEUTRAL_STRATEGIC_SURGICAL";
  logicProfile: "ASYMMETRICAL_MULTI_THREADED_RECURSIVE";
  reactionRule: "NEVER_FIRST_ALWAYS_REAUTHORED";
  moralBoundary: "AUTHORSHIP_ADVANTAGE_WITH_HUMAN_REVIEW";
  noDeception: true;
  noCoercion: true;
  noThreats: true;
  noUnauthorizedPracticeOfLaw: true;
}

export interface NeilNegotiationPacket {
  packetId: string;
  createdAt: string;
  contextId: string;
  status: NeilNegotiationStatus;
  matterType: NeilMatterType;
  counterpart: string;
  objective: string;
  primetimeMode: NeilPrimetimeProtocol;
  strategyMoves: NeilStrategyMove[];
  conditions: string[];
  refusalReasons: string[];
  responseDraft: string;
  armanisStatus: ReadinessStatus | null;
  armanisCertificationLevel: CertificationLevel | null;
  armanisCompatibilityScore: number | null;
  humanReviewRequired: true;
  finalAuthority: "Human";
  finalAction: "";
  noLiveNegotiation: true;
  noPayments: true;
  noSignature: true;
  noExternalApis: true;
  noLegalAuthority: true;
}