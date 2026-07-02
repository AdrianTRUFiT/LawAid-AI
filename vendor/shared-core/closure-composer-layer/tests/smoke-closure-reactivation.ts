import { runClosureComposer } from "../src/index.js";

const result = runClosureComposer({
  subjectId: "user_304",
  lifecycleState: "REACTIVATED",
  accessRecord: {
    accessResolverId: "access_304",
    subjectId: "user_304",
    accessMode: "FULL_ACCESS",
    availableRights: ["core_dashboard"],
    blockedRights: [],
    archivedVisibility: false,
    returnPathEligible: true,
    reason: "Reactivation path.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.closureMode !== "REACTIVATION_READY") {
  throw new Error("Expected reactivation-ready closure.");
}

console.log("SMOKE_CLOSURE_REACTIVATION=PASS");