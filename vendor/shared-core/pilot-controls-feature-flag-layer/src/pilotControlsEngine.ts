import type {
  PilotControlsArtifact,
  PilotControlsInput,
  PilotControlsResult,
} from "./pilotControlsTypes.js";
import {
  includesIgnoreCase,
  makePilotControlId,
  nowIso,
} from "./pilotControlsUtils.js";

export function runPilotControlsFeatureFlagLayer(
  input: PilotControlsInput,
): PilotControlsResult {
  if (!input.paymentRail) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_PAYMENT_RAIL",
        refusalReason: "Pilot controls refused because payment rail artifact is missing.",
      },
    };
  }

  if (input.subjectId !== input.paymentRail.subjectId) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "Pilot controls refused because subjectId does not match payment rail subjectId.",
      },
    };
  }

  if (input.emergencyDisabled === true) {
    return {
      ok: true,
      artifact: {
        pilotControlId: makePilotControlId(input.paymentRail.paymentRailId),
        subjectId: input.subjectId,
        sourcePaymentRailId: input.paymentRail.paymentRailId,
        decision: "EMERGENCY_DISABLED",
        rolloutReason: "Pilot flow disabled by emergency control.",
        createdAt: nowIso(),
      },
      refusal: null,
    };
  }

  if (includesIgnoreCase(input.allowedRegions, input.paymentRail.region) === false && input.allowedRegions && input.allowedRegions.length > 0) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "REGION_DENIED",
        refusalReason: `Pilot controls refused because region '${input.paymentRail.region}' is not enabled.`,
      },
    };
  }

  if (includesIgnoreCase(input.allowedAssets, input.paymentRail.asset) === false && input.allowedAssets && input.allowedAssets.length > 0) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "ASSET_DENIED",
        refusalReason: `Pilot controls refused because asset '${input.paymentRail.asset}' is not enabled.`,
      },
    };
  }

  if (includesIgnoreCase(input.allowedProviders, input.paymentRail.provider) === false && input.allowedProviders && input.allowedProviders.length > 0) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "PROVIDER_DENIED",
        refusalReason: `Pilot controls refused because provider '${input.paymentRail.provider}' is not enabled.`,
      },
    };
  }

  if (input.allowedPilotGroups && input.allowedPilotGroups.length > 0) {
    if (!input.activePilotGroup || includesIgnoreCase(input.allowedPilotGroups, input.activePilotGroup) === false) {
      return {
        ok: false,
        artifact: null,
        refusal: {
          refusalCode: "PILOT_GROUP_DENIED",
          refusalReason: "Pilot controls refused because active pilot group is not enabled.",
        },
      };
    }
  }

  let decision: "ALLOW" | "DENY" | "REVIEW" | "SANDBOX_ONLY" | "EMERGENCY_DISABLED" = "ALLOW";
  let rolloutReason = "Payment rail is enabled for this rollout path.";

  if (input.sandboxOnly === true && input.paymentRail.environment === "production") {
    decision = "SANDBOX_ONLY";
    rolloutReason = "Payment rail is limited to sandbox during pilot rollout.";
  }

  const artifact: PilotControlsArtifact = {
    pilotControlId: makePilotControlId(input.paymentRail.paymentRailId),
    subjectId: input.subjectId,
    sourcePaymentRailId: input.paymentRail.paymentRailId,
    decision,
    rolloutReason,
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}