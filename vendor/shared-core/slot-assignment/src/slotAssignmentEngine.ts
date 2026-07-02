import { evaluateAuthorization } from "../../authorization-gate/src/index.js";
import { OccupancyRegistry } from "../../occupancy-registry/src/index.js";
import { SlotStateRegistry } from "../../slot-state-registry/src/index.js";
import { normalizeStatus } from "../../status-normalization/src/index.js";
import type {
  SlotAssignmentArtifact,
  SlotAssignmentRequest,
  SlotAssignmentResult,
} from "./slotAssignmentTypes.js";
import { makeOccupancyId, nowIso } from "./slotAssignmentUtils.js";

export function runSlotAssignment(
  input: {
    request: SlotAssignmentRequest;
    slotRegistry: SlotStateRegistry;
    occupancyRegistry: OccupancyRegistry;
  },
): SlotAssignmentResult {
  const slotLookup = input.slotRegistry.getSlot(input.request.slotId);

  if (!slotLookup.ok || !slotLookup.value) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SLOT_NOT_FOUND",
        refusalReason: "Slot assignment refused because slot does not exist.",
        slotId: input.request.slotId,
        assignmentId: input.request.assignmentId,
      },
    };
  }

  const slot = slotLookup.value;

  const normalized = normalizeStatus({
    sourceSystem: "slot-state-registry",
    domain: "slot",
    rawStatus: slot.currentState,
  });

  if (!normalized.ok || !normalized.output) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SLOT_STATE_INELIGIBLE",
        refusalReason: "Slot assignment refused because slot status could not be normalized.",
        slotId: input.request.slotId,
        assignmentId: input.request.assignmentId,
      },
    };
  }

  if (
    normalized.output.canonicalStatus !== "OPEN" &&
    normalized.output.canonicalStatus !== "RESERVED" &&
    normalized.output.canonicalStatus !== "AUTHORIZATION_REQUIRED"
  ) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SLOT_STATE_INELIGIBLE",
        refusalReason: `Slot assignment refused because slot state '${slot.currentState}' is not eligible.`,
        slotId: input.request.slotId,
        assignmentId: input.request.assignmentId,
      },
    };
  }

  const activeOccupancy = input.occupancyRegistry.getActiveBySlot(input.request.slotId);

  if (activeOccupancy) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SLOT_ALREADY_OCCUPIED",
        refusalReason: "Slot assignment refused because slot already has active or held occupancy.",
        slotId: input.request.slotId,
        assignmentId: input.request.assignmentId,
      },
    };
  }

  const auth = evaluateAuthorization({
    requestId: input.request.assignmentId,
    actionType: "assign_slot",
    targetType: "slot",
    targetId: input.request.slotId,
    requestedBy: input.request.requestedBy,
    requiredAuthorizationClass: input.request.requiredAuthorizationClass,
    providedAuthorizationClass: input.request.providedAuthorizationClass,
  });

  if (!auth.ok || !auth.result) {
    const refusalCode =
      auth.refusal?.refusalCode === "INSUFFICIENT_AUTHORIZATION"
        ? "INSUFFICIENT_AUTHORIZATION"
        : "AUTHORIZATION_REQUIRED";

    if (input.request.holdAllowed) {
      const heldCreate = input.occupancyRegistry.createOccupancy({
        occupancyId: makeOccupancyId(input.request.assignmentId),
        slotId: input.request.slotId,
        subjectId: input.request.subjectId,
        subjectType: input.request.subjectType,
        claimId: input.request.claimId,
        occupancyState: "HELD",
        continuityProtected: input.request.continuityProtected ?? false,
        window: input.request.window,
        createdBy: input.request.requestedBy,
        metadata: input.request.metadata,
      });

      if (heldCreate.ok && heldCreate.value) {
        const artifact: SlotAssignmentArtifact = {
          assignmentId: input.request.assignmentId,
          slotId: input.request.slotId,
          occupancyId: heldCreate.value.occupancyId,
          subjectId: input.request.subjectId,
          subjectType: input.request.subjectType,
          claimId: input.request.claimId,
          assignedBy: input.request.requestedBy,
          decision: "HELD",
          slotCanonicalStatus: normalized.output.canonicalStatus,
          authorizationDecision: auth.result?.decision ?? "ESCALATE",
          continuityProtected: input.request.continuityProtected ?? false,
          createdAt: nowIso(),
          window: input.request.window,
          metadata: input.request.metadata,
        };

        return {
          ok: false,
          artifact,
          refusal: {
            refusalCode: "ASSIGNMENT_HELD",
            refusalReason: "Slot assignment held pending sufficient authorization.",
            slotId: input.request.slotId,
            assignmentId: input.request.assignmentId,
          },
        };
      }
    }

    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode,
        refusalReason: auth.refusal?.refusalReason ?? "Authorization required for slot assignment.",
        slotId: input.request.slotId,
        assignmentId: input.request.assignmentId,
      },
    };
  }

  const occupancyCreate = input.occupancyRegistry.createOccupancy({
    occupancyId: makeOccupancyId(input.request.assignmentId),
    slotId: input.request.slotId,
    subjectId: input.request.subjectId,
    subjectType: input.request.subjectType,
    claimId: input.request.claimId,
    occupancyState: "ACTIVE",
    continuityProtected: input.request.continuityProtected ?? false,
    window: input.request.window,
    createdBy: input.request.requestedBy,
    metadata: input.request.metadata,
  });

  if (!occupancyCreate.ok || !occupancyCreate.value) {
    const refusalCode =
      occupancyCreate.refusal?.refusalCode === "INVALID_WINDOW"
        ? "INVALID_WINDOW"
        : "SLOT_ALREADY_OCCUPIED";

    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode,
        refusalReason: occupancyCreate.refusal?.refusalReason ?? "Slot assignment refused during occupancy creation.",
        slotId: input.request.slotId,
        assignmentId: input.request.assignmentId,
      },
    };
  }

  const artifact: SlotAssignmentArtifact = {
    assignmentId: input.request.assignmentId,
    slotId: input.request.slotId,
    occupancyId: occupancyCreate.value.occupancyId,
    subjectId: input.request.subjectId,
    subjectType: input.request.subjectType,
    claimId: input.request.claimId,
    assignedBy: input.request.requestedBy,
    decision: "ASSIGNED",
    slotCanonicalStatus: normalized.output.canonicalStatus,
    authorizationDecision: auth.result.decision,
    continuityProtected: input.request.continuityProtected ?? false,
    createdAt: nowIso(),
    window: input.request.window,
    metadata: input.request.metadata,
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}