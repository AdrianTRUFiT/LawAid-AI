import { runReassuranceMessageMapper } from "../src/index.js";

const result = runReassuranceMessageMapper({
  subjectId: "msg_004",
  accessActivation: {
    accessActivationId: "mesh_access_msg_004_entitlement_004_WEATHER_PAY_PER_USE",
    subjectId: "msg_004",
    entitlementId: "entitlement_004",
    serviceCode: "WEATHER",
    planCode: "PAY_PER_USE",
    accessActivationStatus: "ACCESS_ACTIVE",
    serviceReady: true,
    continuityPriorityActive: true,
    activationRights: ["service:weather", "plan:pay_per_use", "access:access_active"],
    environmentClass: "live",
    reason: "Priority activation.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.continuityPriorityVisible !== true) {
  throw new Error("Expected continuity-priority reassurance visibility.");
}

console.log("SMOKE_REASSURANCE_CONTINUITY_PRIORITY=PASS");