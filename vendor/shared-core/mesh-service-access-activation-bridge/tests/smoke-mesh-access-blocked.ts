import { runMeshServiceAccessActivationBridge } from "../src/index.js";

const result = runMeshServiceAccessActivationBridge({
  subjectId: "acc_003",
  entitlement: {
    entitlementId: "mesh_entitlement_acc_003_paid_truth_003_MESSAGING_MONTHLY",
    subjectId: "acc_003",
    paidTruthId: "paid_truth_003",
    serviceCode: "MESSAGING",
    serviceCategory: "communication",
    planCode: "MONTHLY",
    entitlementStatus: "ENTITLED_REFUSED",
    serviceRights: ["service:messaging", "plan:monthly", "usage:subscription"],
    continuityPriorityGranted: true,
    accessClass: "blocked",
    transactionalAccessReady: false,
    reason: "Refused entitlement.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.accessActivationStatus !== "ACCESS_BLOCKED" || result.artifact.environmentClass !== "blocked") {
  throw new Error("Expected refused entitlement activation.");
}

console.log("SMOKE_MESH_ACCESS_BLOCKED=PASS");