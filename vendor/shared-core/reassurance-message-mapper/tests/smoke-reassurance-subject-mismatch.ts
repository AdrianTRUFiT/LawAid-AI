import { runReassuranceMessageMapper } from "../src/index.js";

const result = runReassuranceMessageMapper({
  subjectId: "msg_005",
  accessActivation: {
    accessActivationId: "mesh_access_msg_005_entitlement_005_MESSAGING_MONTHLY",
    subjectId: "wrong_msg",
    entitlementId: "entitlement_005",
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

if (result.ok || result.refusal?.refusalCode !== "SUBJECT_MISMATCH") {
  throw new Error("Expected subject mismatch refusal.");
}

console.log("SMOKE_REASSURANCE_SUBJECT_MISMATCH=PASS");