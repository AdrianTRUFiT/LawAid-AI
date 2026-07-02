import { runMeshPaidServiceTruthBridge } from "../src/index.js";

const result = runMeshPaidServiceTruthBridge({
  subjectId: "tx_102",
  transactionIntent: {
    transactionIntentId: "mesh_tx_intent_tx_102_WEATHER_PAY_PER_USE",
    subjectId: "tx_102",
    serviceCode: "WEATHER",
    serviceCategory: "tools",
    planCode: "PAY_PER_USE",
    transactionIntentClass: "metered_intent",
    amountMinor: 299,
    currency: "USD",
    transactionalEligible: true,
    continuityPriorityRequested: true,
    reason: "Intent formed.",
    createdAt: new Date().toISOString(),
  },
  processorEvent: {
    subjectId: "tx_102",
    processorReference: "proc_102",
    processorStatus: "processor_approved",
    amountMinor: 299,
    currency: "USD",
    eventTimestamp: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.paidTruthStatus !== "PAID_CONFIRMED") {
  throw new Error("Expected approved metered truth.");
}

console.log("SMOKE_MESH_PAID_TRUTH_APPROVED_METERED=PASS");