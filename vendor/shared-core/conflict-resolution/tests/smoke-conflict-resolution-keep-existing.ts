import { resolveSlotConflict } from "../src/index.js";

const result = resolveSlotConflict({
  resolutionId: "resolve_002",
  slotExists: true,
  candidateAuthorizationClass: "operator",
  existingOccupancy: {
    occupancyId: "occ_002",
    slotId: "slot_002",
    subjectId: "subject_existing",
    subjectType: "delivery",
    claimId: "claim_existing",
    occupancyState: "ACTIVE",
    continuityProtected: false,
  },
  candidate: {
    assignmentId: "assign_002",
    slotId: "slot_002",
    subjectId: "subject_002",
    subjectType: "delivery",
    claimId: "claim_new",
    requestedBy: "user_b",
    requiredAuthorizationClass: "operator",
    providedAuthorizationClass: "operator",
    priorityScore: 20,
    window: { startAt: new Date().toISOString() },
  },
});

if (result.ok || !result.artifact || result.artifact.decision !== "REFUSE_CANDIDATE") {
  throw new Error("Expected keep-existing refusal outcome.");
}

console.log("SMOKE_CONFLICT_RESOLUTION_KEEP_EXISTING=PASS");