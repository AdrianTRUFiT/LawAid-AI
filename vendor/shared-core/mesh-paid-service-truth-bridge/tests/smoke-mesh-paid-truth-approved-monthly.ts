import { runMeshPaidServiceTruthBridge } from "../src/index.js";

const result = runMeshPaidServiceTruthBridge({
  subjectId: "tx_101",
  transactionIntent: {
    transactionIntentId: "mesh_tx_intent_tx_101_MESSAGING_MONTHLY",
    subjectId: "tx_101",
    serviceCode: "MESSAGING",
    serviceCategory: "communication",
    planCode: "MONTHLY",
    transactionIntentClass: "subscription_intent",
    amountMinor: 1500,
    currency: "USD",
    transactionalEligible: true,
    continuityPriorityRequested: true,
    reason: "Intent formed.",
    createdAt: new Date().toISOString(),
  },
  processorEvent: {
    subjectId: "tx_101",
    processorReference: "proc_101",
    processorStatus: "processor_approved",
    amountMinor: 1500,
    currency: "usd",
    eventTimestamp: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.paidTruthStatus !== "PAID_CONFIRMED") {
  throw new Error("Expected approved monthly truth.");
}

console.log("SMOKE_MESH_PAID_TRUTH_APPROVED_MONTHLY=PASS");