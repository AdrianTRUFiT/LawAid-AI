import type {
  ContinuityBridgeArtifact,
  ContinuityBridgeContractInput,
  ContinuityBridgeResult,
} from "./continuityBridgeContractTypes.js";
import { makeContinuityBridgeId, nowIso } from "./continuityBridgeContractUtils.js";

export function runContinuityBridgeContract(
  input: ContinuityBridgeContractInput,
): ContinuityBridgeResult {
  if (!input.continuitySnapshot) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_CONTINUITY_SNAPSHOT",
        refusalReason: "Continuity bridge contract refused because continuity snapshot is missing.",
      },
    };
  }

  if (input.subjectId !== input.continuitySnapshot.releasedNodeId) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "Continuity bridge contract refused because subjectId does not match releasedNodeId.",
      },
    };
  }

  let bridgeStatus:
    | "BRIDGED_CONNECTED"
    | "BRIDGED_FALLBACK"
    | "BRIDGED_RELAYED"
    | "BRIDGED_PRESERVED"
    | "BRIDGED_RECOVERY_ATTENTION";

  let continuityClass: "stable" | "degraded" | "preserved" | "review";
  let requiresAttention = false;
  let reason = "";

  switch (input.continuitySnapshot.continuityState) {
    case "connected":
      bridgeStatus = "BRIDGED_CONNECTED";
      continuityClass = "stable";
      reason = "Continuity is connected and bridged cleanly.";
      break;
    case "degraded":
    case "fallback_active":
      bridgeStatus = "BRIDGED_FALLBACK";
      continuityClass = "degraded";
      reason = "Continuity is degraded and bridged through fallback mode.";
      break;
    case "relayed":
      bridgeStatus = "BRIDGED_RELAYED";
      continuityClass = "degraded";
      reason = "Continuity is bridged through a permissioned relay path.";
      break;
    case "store_and_forward":
    case "disconnected_but_stateful":
      bridgeStatus = "BRIDGED_PRESERVED";
      continuityClass = "preserved";
      reason = "Continuity is preserved locally and bridged for later recovery.";
      break;
    case "recovering":
    case "reconciled":
      bridgeStatus = "BRIDGED_RECOVERY_ATTENTION";
      continuityClass = "review";
      requiresAttention = true;
      reason = "Continuity is in recovery/reconciliation posture and requires governed attention.";
      break;
  }

  if (input.continuitySnapshot.refusalCodes.length > 0) {
    requiresAttention = true;
    if (continuityClass !== "preserved") {
      continuityClass = "review";
    }
  }

  const artifact: ContinuityBridgeArtifact = {
    continuityBridgeId: makeContinuityBridgeId(
      input.continuitySnapshot.homeBaseId,
      input.continuitySnapshot.releasedNodeId,
    ),
    subjectId: input.subjectId,
    homeBaseId: input.continuitySnapshot.homeBaseId,
    releasedNodeId: input.continuitySnapshot.releasedNodeId,
    continuityState: input.continuitySnapshot.continuityState,
    fallbackMode: input.continuitySnapshot.fallbackMode,
    bridgeStatus,
    relayUsed: input.continuitySnapshot.relayUsed,
    requiresAttention,
    continuityClass,
    sourceRefusalCodes: input.continuitySnapshot.refusalCodes,
    reason,
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}