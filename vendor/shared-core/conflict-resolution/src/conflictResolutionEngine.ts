import type {
  ConflictDecision,
  ConflictReasonCode,
  ConflictResolutionArtifact,
  ConflictResolutionInput,
  ConflictResolutionResult,
} from "./conflictResolutionTypes.js";
import {
  authorizationRank,
  deriveCandidatePriorityScore,
  deriveExistingPriorityScore,
  nowIso,
} from "./conflictResolutionUtils.js";

function buildArtifact(input: {
  resolutionId: string;
  slotId: string;
  decision: ConflictDecision;
  reasonCode: ConflictReasonCode;
  candidateAssignmentId: string;
  winningClaimId: string;
  losingClaimId?: string;
  existingOccupancyId?: string;
  existingPriorityScore?: number;
  candidatePriorityScore: number;
  notes: string[];
}): ConflictResolutionArtifact {
  return {
    resolutionId: input.resolutionId,
    slotId: input.slotId,
    decision: input.decision,
    reasonCode: input.reasonCode,
    existingOccupancyId: input.existingOccupancyId,
    candidateAssignmentId: input.candidateAssignmentId,
    winningClaimId: input.winningClaimId,
    losingClaimId: input.losingClaimId,
    existingPriorityScore: input.existingPriorityScore,
    candidatePriorityScore: input.candidatePriorityScore,
    createdAt: nowIso(),
    notes: input.notes,
  };
}

export function resolveSlotConflict(
  input: ConflictResolutionInput,
): ConflictResolutionResult {
  if (!input.slotExists) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "INVALID_SLOT",
        refusalReason: "Conflict resolution refused because slot does not exist.",
        slotId: input.candidate.slotId,
        resolutionId: input.resolutionId,
      },
    };
  }

  const candidatePriority = deriveCandidatePriorityScore(input.candidate);
  const authRank = authorizationRank(input.candidateAuthorizationClass);

  if (authRank < 0) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "AUTHORIZATION_INSUFFICIENT",
        refusalReason: "Conflict resolution refused because candidate authorization class is invalid or missing.",
        slotId: input.candidate.slotId,
        resolutionId: input.resolutionId,
      },
    };
  }

  if (!input.existingOccupancy) {
    return {
      ok: true,
      artifact: buildArtifact({
        resolutionId: input.resolutionId,
        slotId: input.candidate.slotId,
        decision: "NO_CONFLICT",
        reasonCode: "NO_ACTIVE_OCCUPANCY",
        candidateAssignmentId: input.candidate.assignmentId,
        winningClaimId: input.candidate.claimId,
        candidatePriorityScore: candidatePriority,
        notes: ["No active or held occupancy exists for the slot."],
      }),
      refusal: null,
    };
  }

  const existing = input.existingOccupancy;
  const existingPriority = deriveExistingPriorityScore(existing);

  if (existing.claimId === input.candidate.claimId) {
    return {
      ok: true,
      artifact: buildArtifact({
        resolutionId: input.resolutionId,
        slotId: input.candidate.slotId,
        decision: "KEEP_EXISTING",
        reasonCode: "SAME_CLAIM",
        existingOccupancyId: existing.occupancyId,
        candidateAssignmentId: input.candidate.assignmentId,
        winningClaimId: existing.claimId,
        losingClaimId: input.candidate.claimId,
        existingPriorityScore: existingPriority,
        candidatePriorityScore: candidatePriority,
        notes: ["Candidate matches the same claim as existing occupancy."],
      }),
      refusal: null,
    };
  }

  if (existing.continuityProtected && !input.candidate.continuityProtected) {
    return {
      ok: false,
      artifact: buildArtifact({
        resolutionId: input.resolutionId,
        slotId: input.candidate.slotId,
        decision: "REFUSE_CANDIDATE",
        reasonCode: "CONTINUITY_PROTECTED_EXISTING",
        existingOccupancyId: existing.occupancyId,
        candidateAssignmentId: input.candidate.assignmentId,
        winningClaimId: existing.claimId,
        losingClaimId: input.candidate.claimId,
        existingPriorityScore: existingPriority,
        candidatePriorityScore: candidatePriority,
        notes: ["Existing occupancy is continuity protected and candidate is not."],
      }),
      refusal: {
        refusalCode: "CANDIDATE_REFUSED",
        refusalReason: "Candidate refused because existing occupancy is continuity protected.",
        slotId: input.candidate.slotId,
        resolutionId: input.resolutionId,
      },
    };
  }

  if (existing.occupancyState === "HELD" && candidatePriority > existingPriority) {
    return {
      ok: true,
      artifact: buildArtifact({
        resolutionId: input.resolutionId,
        slotId: input.candidate.slotId,
        decision: "REPLACE_EXISTING",
        reasonCode: "HELD_EXISTING_REPLACEABLE",
        existingOccupancyId: existing.occupancyId,
        candidateAssignmentId: input.candidate.assignmentId,
        winningClaimId: input.candidate.claimId,
        losingClaimId: existing.claimId,
        existingPriorityScore: existingPriority,
        candidatePriorityScore: candidatePriority,
        notes: ["Held existing occupancy is replaceable by stronger candidate."],
      }),
      refusal: null,
    };
  }

  if (candidatePriority > existingPriority) {
    return {
      ok: true,
      artifact: buildArtifact({
        resolutionId: input.resolutionId,
        slotId: input.candidate.slotId,
        decision: "REPLACE_EXISTING",
        reasonCode: "HIGHER_PRIORITY",
        existingOccupancyId: existing.occupancyId,
        candidateAssignmentId: input.candidate.assignmentId,
        winningClaimId: input.candidate.claimId,
        losingClaimId: existing.claimId,
        existingPriorityScore: existingPriority,
        candidatePriorityScore: candidatePriority,
        notes: ["Candidate priority exceeds existing occupancy priority."],
      }),
      refusal: null,
    };
  }

  if (candidatePriority < existingPriority) {
    if (input.candidate.holdAllowed) {
      return {
        ok: false,
        artifact: buildArtifact({
          resolutionId: input.resolutionId,
          slotId: input.candidate.slotId,
          decision: "HOLD_CANDIDATE",
          reasonCode: "LOWER_PRIORITY",
          existingOccupancyId: existing.occupancyId,
          candidateAssignmentId: input.candidate.assignmentId,
          winningClaimId: existing.claimId,
          losingClaimId: input.candidate.claimId,
          existingPriorityScore: existingPriority,
          candidatePriorityScore: candidatePriority,
          notes: ["Candidate priority is lower than existing occupancy. Candidate may be held."],
        }),
        refusal: {
          refusalCode: "CANDIDATE_REFUSED",
          refusalReason: "Candidate held because existing occupancy has higher priority.",
          slotId: input.candidate.slotId,
          resolutionId: input.resolutionId,
        },
      };
    }

    return {
      ok: false,
      artifact: buildArtifact({
        resolutionId: input.resolutionId,
        slotId: input.candidate.slotId,
        decision: "REFUSE_CANDIDATE",
        reasonCode: "LOWER_PRIORITY",
        existingOccupancyId: existing.occupancyId,
        candidateAssignmentId: input.candidate.assignmentId,
        winningClaimId: existing.claimId,
        losingClaimId: input.candidate.claimId,
        existingPriorityScore: existingPriority,
        candidatePriorityScore: candidatePriority,
        notes: ["Candidate priority is lower than existing occupancy."],
      }),
      refusal: {
        refusalCode: "CANDIDATE_REFUSED",
        refusalReason: "Candidate refused because existing occupancy has higher priority.",
        slotId: input.candidate.slotId,
        resolutionId: input.resolutionId,
      },
    };
  }

  return {
    ok: false,
    artifact: buildArtifact({
      resolutionId: input.resolutionId,
      slotId: input.candidate.slotId,
      decision: "KEEP_EXISTING",
      reasonCode: "EQUAL_PRIORITY_DEFAULT_KEEP",
      existingOccupancyId: existing.occupancyId,
      candidateAssignmentId: input.candidate.assignmentId,
      winningClaimId: existing.claimId,
      losingClaimId: input.candidate.claimId,
      existingPriorityScore: existingPriority,
      candidatePriorityScore: candidatePriority,
      notes: ["Priority tie defaults to keeping existing occupancy."],
    }),
    refusal: {
      refusalCode: "CANDIDATE_REFUSED",
      refusalReason: "Candidate refused because equal priority defaults to existing occupancy.",
      slotId: input.candidate.slotId,
      resolutionId: input.resolutionId,
    },
  };
}