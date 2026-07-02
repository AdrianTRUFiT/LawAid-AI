import { runReassuranceMessageMapper } from "../src/index.js";

const result = runReassuranceMessageMapper({
  subjectId: "msg_003",
  accessActivation: {
    accessActivationId: "mesh_access_msg_003_entitlement_003_MESSAGING_MONTHLY",
    subjectId: "msg_003",
    entitlementId: "entitlement_003",
    serviceCode: "MESSAGING",
    planCode: "MONTHLY",
    accessActivationStatus: "ACCESS_BLOCKED",
    serviceReady: false,
    continuityPriorityActive: false,
    activationRights: ["service:messaging", "plan:monthly", "access:access_blocked"],
    environmentClass: "blocked",
    reason: "Blocked activation.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.messageClass !== "blocked_guidance") {
  throw new Error("Expected blocked access reassurance.");
}

console.log("SMOKE_REASSURANCE_BLOCKED=PASS");