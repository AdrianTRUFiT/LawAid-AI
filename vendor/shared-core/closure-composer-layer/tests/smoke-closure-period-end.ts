import { runClosureComposer } from "../src/index.js";

const result = runClosureComposer({
  subjectId: "user_301",
  lifecycleState: "CANCELED_PERIOD_END",
  accessThroughDateIso: "2026-05-01T00:00:00.000Z",
  archiveAvailable: true,
  exportAvailable: true,
  accessRecord: {
    accessResolverId: "access_301",
    subjectId: "user_301",
    accessMode: "ARCHIVED_ACCESS",
    availableRights: ["archived_visibility"],
    blockedRights: ["active_modules"],
    archivedVisibility: true,
    returnPathEligible: true,
    reason: "Closed lifecycle resolved into archived access with protected return path.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.closureMode !== "PERIOD_END_CLOSURE") {
  throw new Error("Expected period-end closure.");
}

console.log("SMOKE_CLOSURE_PERIOD_END=PASS");