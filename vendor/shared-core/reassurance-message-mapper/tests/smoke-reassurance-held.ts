import { runReassuranceMessageMapper } from "../src/index.js";

const result = runReassuranceMessageMapper({
  subjectId: "msg_002",
  accessActivation: {
    accessActivationId: "mesh_access_msg_002_entitlement_002_AUDIO_STREAMING_GROUP_PLAN",
    subjectId: "msg_002",
    entitlementId: "entitlement_002",
    serviceCode: "AUDIO_STREAMING",
    planCode: "GROUP_PLAN",
    accessActivationStatus: "ACCESS_HELD",
    serviceReady: false,
    continuityPriorityActive: false,
    activationRights: ["service:audio_streaming", "plan:group_plan", "access:access_held"],
    environmentClass: "held",
    reason: "Held activation.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.messageClass !== "held_guidance") {
  throw new Error("Expected held access reassurance.");
}

console.log("SMOKE_REASSURANCE_HELD=PASS");