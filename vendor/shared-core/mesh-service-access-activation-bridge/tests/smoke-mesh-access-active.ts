import { runMeshServiceAccessActivationBridge } from "../src/index.js";

const result = runMeshServiceAccessActivationBridge({
  subjectId: "acc_001",
  entitlement: {
    entitlementId: "mesh_entitlement_acc_001_paid_truth_001_MESSAGING_MONTHLY",
    subjectId: "acc_001",
    paidTruthId: "paid_truth_001",
    serviceCode: "MESSAGING",
    serviceCategory: "communication",
    planCode: "MONTHLY",
    entitlementStatus: "ENTITLED_ACTIVE",
    serviceRights: ["service:messaging", "plan:monthly", "usage:subscription"],
    continuityPriorityGranted: true,
    accessClass: "active",
    transactionalAccessReady: true,
    reason: "Active entitlement.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.accessActivationStatus !== "ACCESS_ACTIVE" || result.artifact.serviceReady !== true) {
  throw new Error("Expected active entitlement activation.");
}

console.log("SMOKE_MESH_ACCESS_ACTIVE=PASS");