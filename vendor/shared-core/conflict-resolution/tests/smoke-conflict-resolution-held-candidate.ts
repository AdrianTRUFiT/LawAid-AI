import { resolveSlotConflict } from "../src/index.js";

const result = resolveSlotConflict({
  resolutionId: "resolve_005",
  slotExists: true,
  candidateAuthorizationClass: "operator",
  existingOccupancy: {
    occupancyId: "occ_005",
    slotId: "slot_005",
    subjectId: "subject_existing",
    subjectType: "package",
    claimId: "claim_existing",
    occupancyState: "ACTIVE",
    continuityProtected: false,
  },
  candidate: {
    assignmentId: "assign_005",
    slotId: "slot_005",
    subjectId: "subject_005",
    subjectType: "package",
    claimId: "claim_candidate",
    requestedBy: "user_e",
    requiredAuthorizationClass: "operator",
    providedAuthorizationClass: "operator",
    priorityScore: 10,
    holdAllowed: true,
    window: { startAt: new Date().toISOString() },
  },
});

if (result.ok || !result.artifact || result.artifact.decision !== "HOLD_CANDIDATE") {
  throw new Error("Expected held-candidate resolution.");
}

console.log("SMOKE_CONFLICT_RESOLUTION_HELD_CANDIDATE=PASS");