import { runMeshServiceAccessActivationBridge } from "../src/index.js";

const result = runMeshServiceAccessActivationBridge({
  subjectId: "acc_005",
  entitlement: {
    entitlementId: "mesh_entitlement_acc_005_paid_truth_005_MESSAGING_MONTHLY",
    subjectId: "wrong_acc",
    paidTruthId: "paid_truth_005",
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

if (result.ok || result.refusal?.refusalCode !== "SUBJECT_MISMATCH") {
  throw new Error("Expected subject mismatch refusal.");
}

console.log("SMOKE_MESH_ACCESS_SUBJECT_MISMATCH=PASS");