import type { DemandPoolingThresholdArtifact } from "../../demand-pooling-threshold-layer/src/index.js";
import type { QualityPreservationGateArtifact } from "../../quality-preservation-gate/src/index.js";
import type { PnlIntelligenceGuardArtifact } from "../../pnl-intelligence-guard/src/index.js";

export type BookingReadyStatus =
  | "BOOKING_READY"
  | "BOOKING_HELD"
  | "BOOKING_BLOCKED";

export interface BookingReadyFormationBridgeInput {
  subjectId: string;
  poolingThreshold: DemandPoolingThresholdArtifact | null;
  qualityGate: QualityPreservationGateArtifact | null;
  pnlGuard: PnlIntelligenceGuardArtifact | null;
}

export interface BookingReadyFormationArtifact {
  bookingReadyId: string;
  subjectId: string;
  bookingReadyStatus: BookingReadyStatus;
  releaseEligible: boolean;
  sourcingMode: "isolated" | "pooled" | "not_ready";
  bookingReadyReason: string;
  createdAt: string;
}

export interface BookingReadyFormationBridgeRefusal {
  refusalCode:
    | "MISSING_INPUT"
    | "SUBJECT_MISMATCH";
  refusalReason: string;
}

export interface BookingReadyFormationBridgeResult {
  ok: boolean;
  artifact: BookingReadyFormationArtifact | null;
  refusal: BookingReadyFormationBridgeRefusal | null;
}