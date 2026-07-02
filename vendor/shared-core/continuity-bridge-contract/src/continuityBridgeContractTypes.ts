import type {
  ContinuitySnapshot,
  ContinuityState,
  FallbackMode,
} from "../../home-base-continuity-core/src/index.js";

export type ContinuityBridgeStatus =
  | "BRIDGED_CONNECTED"
  | "BRIDGED_FALLBACK"
  | "BRIDGED_RELAYED"
  | "BRIDGED_PRESERVED"
  | "BRIDGED_RECOVERY_ATTENTION";

export interface ContinuityBridgeContractInput {
  subjectId: string;
  continuitySnapshot: ContinuitySnapshot;
}

export interface ContinuityBridgeArtifact {
  continuityBridgeId: string;
  subjectId: string;
  homeBaseId: string;
  releasedNodeId: string;
  continuityState: ContinuityState;
  fallbackMode: FallbackMode;
  bridgeStatus: ContinuityBridgeStatus;
  relayUsed: boolean;
  requiresAttention: boolean;
  continuityClass: "stable" | "degraded" | "preserved" | "review";
  sourceRefusalCodes: string[];
  reason: string;
  createdAt: string;
}

export interface ContinuityBridgeRefusal {
  refusalCode:
    | "MISSING_CONTINUITY_SNAPSHOT"
    | "SUBJECT_MISMATCH";
  refusalReason: string;
}

export interface ContinuityBridgeResult {
  ok: boolean;
  artifact: ContinuityBridgeArtifact | null;
  refusal: ContinuityBridgeRefusal | null;
}