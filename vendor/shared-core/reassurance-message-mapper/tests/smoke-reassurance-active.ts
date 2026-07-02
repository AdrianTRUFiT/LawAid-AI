import { runReassuranceMessageMapper } from "../src/index.js";

const result = runReassuranceMessageMapper({
  subjectId: "msg_001",
  accessActivation: {
    accessActivationId: "mesh_access_msg_001_entitlement_001_MESSAGING_MONTHLY",
    subjectId: "msg_001",
    entitlementId: "entitlement_001",
    serviceCode: "MESSAGING",
    planCode: "MONTHLY",
    accessActivationStatus: "ACCESS_ACTIVE",
    serviceReady: true,
    continuityPriorityActive: false,
    activationRights: ["service:messaging", "plan:monthly", "access:access_active"],
    environmentClass: "live",
    reason: "Live activation.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.messageClass !== "live_confirmation") {
  throw new Error("Expected active access reassurance.");
}

console.log("SMOKE_REASSURANCE_ACTIVE=PASS");