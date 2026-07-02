import { resolveSlotConflict } from "../src/index.js";

const result = resolveSlotConflict({
  resolutionId: "resolve_004",
  slotExists: true,
  candidateAuthorizationClass: "system_admin",
  existingOccupancy: {
    occupancyId: "occ_004",
    slotId: "slot_004",
    subjectId: "subject_existing",
    subjectType: "workflow_state",
    claimId: "claim_existing",
    occupancyState: "ACTIVE",
    continuityProtected: true,
  },
  candidate: {
    assignmentId: "assign_004",
    slotId: "slot_004",
    subjectId: "subject_004",
    subjectType: "workflow_state",
    claimId: "claim_candidate",
    requestedBy: "user_d",
    requiredAuthorizationClass: "system_admin",
    providedAuthorizationClass: "system_admin",
    priorityScore: 99,
    continuityProtected: false,
    window: { startAt: new Date().toISOString() },
  },
});

if (result.ok || result.refusal?.refusalCode !== "CANDIDATE_REFUSED") {
  throw new Error("Expected continuity-protected refusal.");
}

console.log("SMOKE_CONFLICT_RESOLUTION_CONTINUITY_PROTECTED=PASS");