import type {
  LifecycleRegistryArtifact,
  LifecycleRegistryInput,
  LifecycleRegistryResult,
} from "./lifecycleRegistryTypes.js";
import {
  isAllowedTransition,
  makeLifecycleEventId,
  nowIso,
} from "./lifecycleRegistryUtils.js";

export function runLifecycleRegistry(
  input: LifecycleRegistryInput,
): LifecycleRegistryResult {
  if (!input.subjectId || input.subjectId.trim() === "") {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISSING",
        refusalReason: "Lifecycle registry refused because subjectId is missing.",
      },
    };
  }

  if (!isAllowedTransition(input.currentState, input.requestedState)) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "INVALID_TRANSITION",
        refusalReason: `Lifecycle registry refused because transition '${input.currentState}' -> '${input.requestedState}' is not allowed.`,
      },
    };
  }

  const artifact: LifecycleRegistryArtifact = {
    lifecycleEventId: makeLifecycleEventId(input.subjectId, input.currentState, input.requestedState),
    subjectId: input.subjectId,
    previousState: input.currentState,
    nextState: input.requestedState,
    transitionAccepted: true,
    sourceEvent: input.sourceEvent ?? null,
    reason: input.reason ?? "Lifecycle transition accepted.",
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}