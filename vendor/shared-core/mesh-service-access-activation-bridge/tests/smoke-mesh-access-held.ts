import { runMeshServiceAccessActivationBridge } from "../src/index.js";

const result = runMeshServiceAccessActivationBridge({
  subjectId: "acc_002",
  entitlement: {
    entitlementId: "mesh_entitlement_acc_002_paid_truth_002_AUDIO_STREAMING_GROUP_PLAN",
    subjectId: "acc_002",
    paidTruthId: "paid_truth_002",
    serviceCode: "AUDIO_STREAMING",
    serviceCategory: "entertainment",
    planCode: "GROUP_PLAN",
    entitlementStatus: "ENTITLED_HELD_REVIEW",
    serviceRights: ["service:audio_streaming", "plan:group_plan", "usage:shared_group"],
    continuityPriorityGranted: false,
    accessClass: "held",
    transactionalAccessReady: false,
    reason: "Held entitlement.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.accessActivationStatus !== "ACCESS_HELD" || result.artifact.environmentClass !== "held") {
  throw new Error("Expected held entitlement activation.");
}

console.log("SMOKE_MESH_ACCESS_HELD=PASS");