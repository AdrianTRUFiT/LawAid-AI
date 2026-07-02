import type {
  SafeAi2VisibilityMeaningArtifact,
  SafeAi2VisibilityMeaningInput,
  SafeAi2VisibilityMeaningResult,
} from "./safeAi2VisibilityMeaningTypes.js";
import { makeVisibilityMeaningId, nowIso } from "./safeAi2VisibilityMeaningUtils.js";

export function runSafeAi2VisibilityMeaningLayer(
  input: SafeAi2VisibilityMeaningInput,
): SafeAi2VisibilityMeaningResult {
  if (!input.protectiveState) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_PROTECTIVE_STATE",
        refusalReason: "SAFE-AI² visibility meaning refused because protective state is missing.",
      },
    };
  }

  if (input.subjectId !== input.protectiveState.subjectId) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "SAFE-AI² visibility meaning refused because subjectId does not match protective-state subjectId.",
      },
    };
  }

  let displayLabel = "";
  let reassuranceLevel: "high" | "medium" | "low" = "medium";
  let actionPrompt = "";
  let userExplanation = "";

  switch (input.protectiveState.protectiveState) {
    case "PROTECTED":
      displayLabel = "Protected";
      reassuranceLevel = "high";
      actionPrompt = "No action needed.";
      userExplanation = "Your environment is protected and operating normally.";
      break;
    case "UNDER_REVIEW":
      displayLabel = "Under review";
      reassuranceLevel = "medium";
      actionPrompt = "Please wait while protection checks complete.";
      userExplanation = "A safety review is in progress to preserve continuity and prevent unsafe movement.";
      break;
    case "DELAYED_FOR_SAFETY":
      displayLabel = "Delayed for safety";
      reassuranceLevel = "medium";
      actionPrompt = "Please hold while the system verifies the safest next step.";
      userExplanation = "Movement is delayed temporarily so the system can protect your state before consequence.";
      break;
    case "RESTORED":
      displayLabel = "Restored";
      reassuranceLevel = "high";
      actionPrompt = "You may continue.";
      userExplanation = "A protected state was restored successfully and continuity has been preserved.";
      break;
    case "ACTIVE":
      displayLabel = "Active";
      reassuranceLevel = "high";
      actionPrompt = "You may continue.";
      userExplanation = "Your environment is active and ready.";
      break;
    case "BLOCKED":
      displayLabel = "Blocked with reason";
      reassuranceLevel = "low";
      actionPrompt = "Review the reason and follow the guided recovery path.";
      userExplanation = "The system blocked this path to prevent unsafe consequence and preserve trusted state.";
      break;
  }

  const artifact: SafeAi2VisibilityMeaningArtifact = {
    visibilityMeaningId: makeVisibilityMeaningId(input.protectiveState.protectiveStateId),
    subjectId: input.subjectId,
    sourceProtectiveStateId: input.protectiveState.protectiveStateId,
    displayLabel,
    reassuranceLevel,
    actionPrompt,
    userExplanation,
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}