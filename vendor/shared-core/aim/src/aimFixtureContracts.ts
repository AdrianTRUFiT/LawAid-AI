import type { AimDecisionItem, AimPaiSafeDecisionReviewStatus } from "./aimDecisionQueueContracts.js";
import type { AimJournalPacket, AimJournalPacketStatus } from "./aimJournalContracts.js";

export type AimFixtureExportStatus =
  | "FIXTURE_EXPORT_READY"
  | "FIXTURE_EXPORT_HELD"
  | "FIXTURE_EXPORT_ARCHIVED"
  | "FIXTURE_EXPORT_EMPTY";

export type AimFixtureRole =
  | "operator"
  | "internal_review"
  | "future_ui_preview"
  | "audit";

export type AimFixtureHiddenFieldPolicy =
  | "HIDE_INTERNAL_REASONS"
  | "SHOW_REVIEW_REASONS"
  | "SHOW_AUDIT_FIELDS";

export interface AimFixtureManifest {
  manifestId: string;
  createdAt: string;
  source: "AIM";
  pass: "AIM_PASS_5_READ_ONLY_FIXTURE_EXPORT";
  readOnly: true;
  deterministic: true;
  fixtureCount: number;
  decisionCount: number;
  journalCount: number;
  exportStatus: AimFixtureExportStatus;
  hiddenFieldPolicy: AimFixtureHiddenFieldPolicy;
  mayRenderUi: false;
  mayMutateState: false;
  mayExecuteTrade: false;
  mayApproveInvestment: false;
  mayProvideFinancialAdvice: false;
  mayWriteSoul: false;
  finalAction: "";
}

export interface AimDecisionFixturePacket {
  fixtureId: string;
  role: AimFixtureRole;
  decisionId: string;
  assetOrSubject: string;
  signalType: AimDecisionItem["signalType"];
  departmentOrigin: AimDecisionItem["departmentOrigin"];
  agentOrigin: AimDecisionItem["agentOrigin"];
  evidenceStrength: AimDecisionItem["evidenceStrength"];
  riskClass: AimDecisionItem["riskClass"];
  timingContext: AimDecisionItem["timingContext"];
  urgencyLevel: AimDecisionItem["urgencyLevel"];
  paiSafeStatus: AimPaiSafeDecisionReviewStatus;
  prohibitedActionFlag: boolean;
  humanReviewRequired: true;
  journalRequired: true;
  finalAuthority: "Human";
  nextStep: string;
  readOnly: true;
  hiddenInternalFields: string[];
  allowedDisplayFields: string[];
  mayMutateSource: false;
  mayExecuteTrade: false;
  mayApproveInvestment: false;
  mayProvideFinancialAdvice: false;
  finalAction: "";
}

export interface AimJournalFixturePacket {
  fixtureId: string;
  role: AimFixtureRole;
  journalPacketId: string;
  decisionId: string;
  status: AimJournalPacketStatus;
  resultClassification: AimJournalPacket["feedbackLoopInput"]["resultClassification"];
  reviewOutcome: AimJournalPacket["reviewOutcomePlaceholder"]["reviewOutcome"];
  preservationRequired: true;
  humanReviewRequired: true;
  finalAuthority: "Human";
  readOnly: true;
  hiddenInternalFields: string[];
  allowedDisplayFields: string[];
  mayMutateSource: false;
  executionAuthorized: false;
  tradeRecommendation: null;
  financialAdviceProvided: false;
  finalAction: "";
}

export interface AimQueueSummaryFixture {
  fixtureId: string;
  role: AimFixtureRole;
  totalDecisions: number;
  totalJournals: number;
  decisionStatusCounts: Record<AimPaiSafeDecisionReviewStatus, number>;
  journalStatusCounts: Record<AimJournalPacketStatus, number>;
  readOnly: true;
  mayMutateSource: false;
  mayExecuteTrade: false;
  mayApproveInvestment: false;
  mayProvideFinancialAdvice: false;
  finalAction: "";
}

export interface AimFixtureExportPacket {
  manifest: AimFixtureManifest;
  decisionFixtures: readonly AimDecisionFixturePacket[];
  journalFixtures: readonly AimJournalFixturePacket[];
  queueSummaryFixture: AimQueueSummaryFixture;
  readOnly: true;
  deterministic: true;
  exportHash: string;
  preservationRequired: true;
  humanReviewRequired: true;
  finalAuthority: "Human";
  mayRenderUi: false;
  mayMutateState: false;
  mayExecuteTrade: false;
  mayApproveInvestment: false;
  mayProvideFinancialAdvice: false;
  mayWriteSoul: false;
  finalAction: "";
}