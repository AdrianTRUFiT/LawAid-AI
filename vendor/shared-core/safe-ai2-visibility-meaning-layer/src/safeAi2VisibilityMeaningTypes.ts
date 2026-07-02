import type { Dis2ProtectiveStateArtifact } from "../../dis2-protective-state-bridge/src/index.js";

export interface SafeAi2VisibilityMeaningInput {
  subjectId: string;
  protectiveState: Dis2ProtectiveStateArtifact;
}

export interface SafeAi2VisibilityMeaningArtifact {
  visibilityMeaningId: string;
  subjectId: string;
  sourceProtectiveStateId: string;
  displayLabel: string;
  reassuranceLevel: "high" | "medium" | "low";
  actionPrompt: string;
  userExplanation: string;
  createdAt: string;
}

export interface SafeAi2VisibilityMeaningRefusal {
  refusalCode:
    | "MISSING_PROTECTIVE_STATE"
    | "SUBJECT_MISMATCH";
  refusalReason: string;
}

export interface SafeAi2VisibilityMeaningResult {
  ok: boolean;
  artifact: SafeAi2VisibilityMeaningArtifact | null;
  refusal: SafeAi2VisibilityMeaningRefusal | null;
}