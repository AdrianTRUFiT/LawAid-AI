import type { Dis2ProtectiveStateArtifact } from "../../dis2-protective-state-bridge/src/index.js";
import type { SafeAi2VisibilityMeaningArtifact } from "../../safe-ai2-visibility-meaning-layer/src/index.js";

export interface ProtectionAwareContinuityBindingInput {
  subjectId: string;
  protectiveState: Dis2ProtectiveStateArtifact;
  visibilityMeaning: SafeAi2VisibilityMeaningArtifact;
}

export interface ProtectionAwareContinuityBindingArtifact {
  continuityBindingId: string;
  subjectId: string;
  operatorVisible: boolean;
  consumerVisible: boolean;
  continuityMessageClass: "informational" | "reassurance" | "action_required" | "operator_review";
  messageToEmit: string;
  createdAt: string;
}

export interface ProtectionAwareContinuityBindingRefusal {
  refusalCode:
    | "MISSING_INPUT"
    | "SUBJECT_MISMATCH";
  refusalReason: string;
}

export interface ProtectionAwareContinuityBindingResult {
  ok: boolean;
  artifact: ProtectionAwareContinuityBindingArtifact | null;
  refusal: ProtectionAwareContinuityBindingRefusal | null;
}