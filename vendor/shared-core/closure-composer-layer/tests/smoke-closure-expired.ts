import { runClosureComposer } from "../src/index.js";

const result = runClosureComposer({
  subjectId: "user_302",
  lifecycleState: "EXPIRED",
  archiveAvailable: true,
  exportAvailable: true,
  accessRecord: {
    accessResolverId: "access_302",
    subjectId: "user_302",
    accessMode: "ARCHIVED_ACCESS",
    availableRights: ["archived_visibility"],
    blockedRights: ["active_modules"],
    archivedVisibility: true,
    returnPathEligible: true,
    reason: "Expired path.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.closureMode !== "EXPIRED_CLOSURE") {
  throw new Error("Expected expired closure.");
}

console.log("SMOKE_CLOSURE_EXPIRED=PASS");