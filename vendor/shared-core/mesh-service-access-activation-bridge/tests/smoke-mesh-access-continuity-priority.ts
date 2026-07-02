import { runMeshServiceAccessActivationBridge } from "../src/index.js";

const result = runMeshServiceAccessActivationBridge({
  subjectId: "acc_004",
  entitlement: {
    entitlementId: "mesh_entitlement_acc_004_paid_truth_004_WEATHER_PAY_PER_USE",
    subjectId: "acc_004",
    paidTruthId: "paid_truth_004",
    serviceCode: "WEATHER",
    serviceCategory: "tools",
    planCode: "PAY_PER_USE",
    entitlementStatus: "ENTITLED_ACTIVE",
    serviceRights: ["service:weather", "plan:pay_per_use", "usage:metered"],
    continuityPriorityGranted: true,
    accessClass: "active",
    transactionalAccessReady: true,
    reason: "Active tools entitlement.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.continuityPriorityActive !== true) {
  throw new Error("Expected continuity-priority activation.");
}

console.log("SMOKE_MESH_ACCESS_CONTINUITY_PRIORITY=PASS");