import { runClosureComposer } from "../src/index.js";

const result = runClosureComposer({
  subjectId: "user_303",
  lifecycleState: "ARCHIVED",
  archiveAvailable: true,
  exportAvailable: true,
  accessRecord: {
    accessResolverId: "access_303",
    subjectId: "user_303",
    accessMode: "ARCHIVED_ACCESS",
    availableRights: ["archived_visibility"],
    blockedRights: ["active_modules"],
    archivedVisibility: true,
    returnPathEligible: true,
    reason: "Archived path.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.closureMode !== "ARCHIVED_CLOSURE" || result.artifact.returnPathAvailable !== true) {
  throw new Error("Expected archived closure.");
}

console.log("SMOKE_CLOSURE_ARCHIVED=PASS");