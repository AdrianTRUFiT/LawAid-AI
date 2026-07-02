import type { DemandPoolingThresholdArtifact } from "../../demand-pooling-threshold-layer/src/index.js";
import type { QualityPreservationGateArtifact } from "../../quality-preservation-gate/src/index.js";

export type PnlGuardStatus =
  | "PNL_PASSED"
  | "PNL_HELD"
  | "PNL_REFUSED";

export interface PnlIntelligenceGuardInput {
  subjectId: string;
  poolingThreshold: DemandPoolingThresholdArtifact | null;
  qualityGate: QualityPreservationGateArtifact | null;
  expectedRevenueMinor: number;
  expectedCostMinor: number;
}

export interface PnlIntelligenceGuardArtifact {
  pnlGuardId: string;
  subjectId: string;
  pnlGuardStatus: PnlGuardStatus;
  expectedRevenueMinor: number;
  expectedCostMinor: number;
  expectedMarginMinor: number;
  expectedMarginRatio: number;
  releaseEconomicallySafe: boolean;
  reason: string;
  createdAt: string;
}

export interface PnlIntelligenceGuardRefusal {
  refusalCode:
    | "MISSING_INPUT"
    | "SUBJECT_MISMATCH"
    | "INVALID_ECONOMICS";
  refusalReason: string;
}

export interface PnlIntelligenceGuardResult {
  ok: boolean;
  artifact: PnlIntelligenceGuardArtifact | null;
  refusal: PnlIntelligenceGuardRefusal | null;
}