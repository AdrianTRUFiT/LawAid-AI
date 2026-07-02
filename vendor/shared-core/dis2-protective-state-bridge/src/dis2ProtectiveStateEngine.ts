import type {
  Dis2ProtectiveStateArtifact,
  Dis2ProtectiveStateInput,
  Dis2ProtectiveStateResult,
} from "./dis2ProtectiveStateTypes.js";
import { makeProtectiveStateId, nowIso } from "./dis2ProtectiveStateUtils.js";

export function runDis2ProtectiveStateBridge(
  input: Dis2ProtectiveStateInput,
): Dis2ProtectiveStateResult {
  if (!input.protectedFlow) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_PROTECTED_FLOW",
        refusalReason: "DIS² protective-state bridge refused because protected-flow input is missing.",
      },
    };
  }

  if (input.subjectId !== input.protectedFlow.subjectId) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "DIS² protective-state bridge refused because subjectId does not match protected-flow subjectId.",
      },
    };
  }

  if (!input.protectedFlow.flowId || !input.protectedFlow.checkpointHealth || !input.protectedFlow.protectedChannelState) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MALFORMED_PROTECTED_FLOW",
        refusalReason: "DIS² protective-state bridge refused because protected-flow input is malformed.",
      },
    };
  }

  let protectiveState: "PROTECTED" | "UNDER_REVIEW" | "DELAYED_FOR_SAFETY" | "RESTORED" | "ACTIVE" | "BLOCKED";
  let reviewRequired = false;
  let restorationVisible = false;
  let reason = "";

  if (input.protectedFlow.checkpointHealth === "healthy" && input.protectedFlow.protectedChannelState === "open") {
    protectiveState = "PROTECTED";
    reason = "Protected flow is healthy and channel is open.";
  } else if (input.protectedFlow.checkpointHealth === "swollen" && input.protectedFlow.protectedChannelState === "watch") {
    protectiveState = "UNDER_REVIEW";
    reviewRequired = true;
    reason = "Protected flow shows swelling and requires watch/review posture.";
  } else if (
    input.protectedFlow.checkpointHealth === "swollen" &&
    input.protectedFlow.protectedChannelState === "held"
  ) {
    protectiveState = "DELAYED_FOR_SAFETY";
    reviewRequired = true;
    reason = "Protected flow is being held to delay unsafe consequence.";
  } else if (
    input.protectedFlow.checkpointHealth === "restored" &&
    input.protectedFlow.protectedChannelState === "restored"
  ) {
    protectiveState = "RESTORED";
    restorationVisible = true;
    reason = "Protected flow was restored and can now be shown as stabilized.";
  } else if (
    input.protectedFlow.checkpointHealth === "healthy" &&
    input.protectedFlow.protectedChannelState === "restored"
  ) {
    protectiveState = "ACTIVE";
    restorationVisible = true;
    reason = "Protected flow returned to active state after restoration.";
  } else if (
    input.protectedFlow.checkpointHealth === "blocked" ||
    input.protectedFlow.protectedChannelState === "blocked"
  ) {
    protectiveState = "BLOCKED";
    reviewRequired = true;
    reason = "Protected flow is blocked and cannot proceed safely.";
  } else {
    protectiveState = "UNDER_REVIEW";
    reviewRequired = true;
    reason = "Protected flow entered fallback review posture.";
  }

  const artifact: Dis2ProtectiveStateArtifact = {
    protectiveStateId: makeProtectiveStateId(input.protectedFlow.flowId),
    subjectId: input.subjectId,
    sourceFlowId: input.protectedFlow.flowId,
    protectiveState,
    reviewRequired,
    restorationVisible,
    reason,
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}