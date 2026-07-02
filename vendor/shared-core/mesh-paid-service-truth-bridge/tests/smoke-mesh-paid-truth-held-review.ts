import { runMeshPaidServiceTruthBridge } from "../src/index.js";

const result = runMeshPaidServiceTruthBridge({
  subjectId: "tx_103",
  transactionIntent: {
    transactionIntentId: "mesh_tx_intent_tx_103_AUDIO_STREAMING_GROUP_PLAN",
    subjectId: "tx_103",
    serviceCode: "AUDIO_STREAMING",
    serviceCategory: "entertainment",
    planCode: "GROUP_PLAN",
    transactionIntentClass: "shared_group_intent",
    amountMinor: 4500,
    currency: "USD",
    transactionalEligible: true,
    continuityPriorityRequested: false,
    reason: "Intent formed.",
    createdAt: new Date().toISOString(),
  },
  processorEvent: {
    subjectId: "tx_103",
    processorReference: "proc_103",
    processorStatus: "processor_review",
    amountMinor: 4500,
    currency: "USD",
    eventTimestamp: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.paidTruthStatus !== "PAID_HELD_REVIEW" || result.artifact.requiresReview !== true) {
  throw new Error("Expected held review truth.");
}

console.log("SMOKE_MESH_PAID_TRUTH_HELD_REVIEW=PASS");