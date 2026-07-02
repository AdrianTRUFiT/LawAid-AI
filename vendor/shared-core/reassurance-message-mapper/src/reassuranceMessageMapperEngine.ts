import type {
  ReassuranceMessageArtifact,
  ReassuranceMessageMapperInput,
  ReassuranceMessageMapperResult,
  ReassuranceMessageClass,
} from "./reassuranceMessageMapperTypes.js";
import {
  makeReassuranceMessageId,
  nowIso,
} from "./reassuranceMessageMapperUtils.js";

export function runReassuranceMessageMapper(
  input: ReassuranceMessageMapperInput,
): ReassuranceMessageMapperResult {
  if (!input.accessActivation) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_INPUT",
        refusalReason: "Reassurance message mapper refused because access activation input is missing.",
      },
    };
  }

  if (input.subjectId !== input.accessActivation.subjectId) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "Reassurance message mapper refused because subject identity does not match access activation input.",
      },
    };
  }

  let messageClass: ReassuranceMessageClass;
  let headline = "";
  let body = "";
  let nextStep = "";

  switch (input.accessActivation.accessActivationStatus) {
    case "ACCESS_ACTIVE":
      messageClass = "live_confirmation";
      headline = "Your service is active";
      body = input.accessActivation.continuityPriorityActive
        ? "Your service is live and continuity priority is active."
        : "Your service is live and ready to use.";
      nextStep = "You can begin using your service now.";
      break;

    case "ACCESS_HELD":
      messageClass = "held_guidance";
      headline = "Your service is being reviewed";
      body = "Your access is currently held while the system completes a review.";
      nextStep = "Please wait for confirmation before using this service.";
      break;

    case "ACCESS_BLOCKED":
      messageClass = "blocked_guidance";
      headline = "Your service is not active";
      body = "Your current access is blocked, so this service is not available right now.";
      nextStep = "Review your plan or payment status to continue.";
      break;
  }

  const artifact: ReassuranceMessageArtifact = {
    reassuranceMessageId: makeReassuranceMessageId(
      input.subjectId,
      input.accessActivation.accessActivationId,
    ),
    subjectId: input.subjectId,
    accessActivationId: input.accessActivation.accessActivationId,
    messageClass,
    headline,
    body,
    nextStep,
    continuityPriorityVisible: input.accessActivation.continuityPriorityActive,
    serviceReadyVisible: input.accessActivation.serviceReady,
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}