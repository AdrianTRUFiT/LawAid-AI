import { resolveSlotConflict } from "../src/index.js";

const result = resolveSlotConflict({
  resolutionId: "resolve_001",
  slotExists: true,
  candidateAuthorizationClass: "operator",
  existingOccupancy: null,
  candidate: {
    assignmentId: "assign_001",
    slotId: "slot_001",
    subjectId: "subject_001",
    subjectType: "reservation",
    claimId: "claim_001",
    requestedBy: "user_a",
    requiredAuthorizationClass: "operator",
    providedAuthorizationClass: "operator",
    window: { startAt: new Date().toISOString() },
  },
});

if (!result.ok || !result.artifact || result.artifact.decision !== "NO_CONFLICT") {
  throw new Error("Expected no-conflict resolution.");
}

console.log("SMOKE_CONFLICT_RESOLUTION_NO_CONFLICT=PASS");