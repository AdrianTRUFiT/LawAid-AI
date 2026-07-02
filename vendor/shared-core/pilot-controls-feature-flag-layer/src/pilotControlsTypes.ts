import type { NormalizedPaymentRailArtifact } from "../../payment-rail-abstraction-layer/src/index.js";

export type PilotControlDecision =
  | "ALLOW"
  | "DENY"
  | "REVIEW"
  | "SANDBOX_ONLY"
  | "EMERGENCY_DISABLED";

export interface PilotControlsInput {
  subjectId: string;
  paymentRail: NormalizedPaymentRailArtifact;
  allowedRegions?: string[];
  allowedAssets?: string[];
  allowedProviders?: string[];
  allowedPilotGroups?: string[];
  activePilotGroup?: string;
  sandboxOnly?: boolean;
  emergencyDisabled?: boolean;
}

export interface PilotControlsArtifact {
  pilotControlId: string;
  subjectId: string;
  sourcePaymentRailId: string;
  decision: PilotControlDecision;
  rolloutReason: string;
  createdAt: string;
}

export interface PilotControlsRefusal {
  refusalCode:
    | "MISSING_PAYMENT_RAIL"
    | "SUBJECT_MISMATCH"
    | "REGION_DENIED"
    | "ASSET_DENIED"
    | "PROVIDER_DENIED"
    | "PILOT_GROUP_DENIED";
  refusalReason: string;
}

export interface PilotControlsResult {
  ok: boolean;
  artifact: PilotControlsArtifact | null;
  refusal: PilotControlsRefusal | null;
}