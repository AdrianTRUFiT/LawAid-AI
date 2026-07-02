import { resolveSlotConflict } from "../src/index.js";

const result = resolveSlotConflict({
  resolutionId: "resolve_003",
  slotExists: true,
  candidateAuthorizationClass: "supervisor",
  existingOccupancy: {
    occupancyId: "occ_003",
    slotId: "slot_003",
    subjectId: "subject_existing",
    subjectType: "reservation",
    claimId: "claim_existing",
    occupancyState: "HELD",
    continuityProtected: false,
  },
  candidate: {
    assignmentId: "assign_003",
    slotId: "slot_003",
    subjectId: "subject_003",
    subjectType: "reservation",
    claimId: "claim_candidate",
    requestedBy: "user_c",
    requiredAuthorizationClass: "operator",
    providedAuthorizationClass: "supervisor",
    priorityScore: 95,
    continuityProtected: true,
    window: { startAt: new Date().toISOString() },
  },
});

if (!result.ok || !result.artifact || result.artifact.decision !== "REPLACE_EXISTING") {
  throw new Error("Expected replace-existing resolution.");
}

console.log("SMOKE_CONFLICT_RESOLUTION_REPLACE_EXISTING=PASS");