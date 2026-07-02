import type {
  ProtectionAwareContinuityBindingArtifact,
  ProtectionAwareContinuityBindingInput,
  ProtectionAwareContinuityBindingResult,
} from "./protectionAwareContinuityBindingTypes.js";
import { makeContinuityBindingId, nowIso } from "./protectionAwareContinuityBindingUtils.js";

export function runProtectionAwareContinuityBinding(
  input: ProtectionAwareContinuityBindingInput,
): ProtectionAwareContinuityBindingResult {
  if (!input.protectiveState || !input.visibilityMeaning) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_INPUT",
        refusalReason: "Protection-aware continuity binding refused because required inputs are missing.",
      },
    };
  }

  if (
    input.subjectId !== input.protectiveState.subjectId ||
    input.subjectId !== input.visibilityMeaning.subjectId
  ) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "Protection-aware continuity binding refused because subject identities do not match.",
      },
    };
  }

  let operatorVisible = true;
  let consumerVisible = true;
  let continuityMessageClass: "informational" | "reassurance" | "action_required" | "operator_review" = "informational";
  let messageToEmit = input.visibilityMeaning.userExplanation;

  switch (input.protectiveState.protectiveState) {
    case "PROTECTED":
      operatorVisible = true;
      consumerVisible = true;
      continuityMessageClass = "reassurance";
      break;
    case "UNDER_REVIEW":
      operatorVisible = true;
      consumerVisible = false;
      continuityMessageClass = "operator_review";
      messageToEmit = "A protected review is in progress.";
      break;
    case "DELAYED_FOR_SAFETY":
      operatorVisible = true;
      consumerVisible = true;
      continuityMessageClass = "action_required";
      break;
    case "RESTORED":
      operatorVisible = true;
      consumerVisible = true;
      continuityMessageClass = "reassurance";
      break;
    case "ACTIVE":
      operatorVisible = true;
      consumerVisible = true;
      continuityMessageClass = "informational";
      break;
    case "BLOCKED":
      operatorVisible = true;
      consumerVisible = true;
      continuityMessageClass = "action_required";
      break;
  }

  const artifact: ProtectionAwareContinuityBindingArtifact = {
    continuityBindingId: makeContinuityBindingId(input.protectiveState.protectiveStateId),
    subjectId: input.subjectId,
    operatorVisible,
    consumerVisible,
    continuityMessageClass,
    messageToEmit,
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}