import { runMeshPaidServiceTruthBridge } from "../src/index.js";

const result = runMeshPaidServiceTruthBridge({
  subjectId: "tx_104",
  transactionIntent: {
    transactionIntentId: "mesh_tx_intent_tx_104_MESSAGING_MONTHLY",
    subjectId: "tx_104",
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
    subjectId: "tx_104",
    processorReference: "proc_104",
    processorStatus: "processor_refused",
    amountMinor: 1500,
    currency: "USD",
    eventTimestamp: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.paidTruthStatus !== "PAID_REFUSED" || result.artifact.commercialTruthReady !== false) {
  throw new Error("Expected refused truth.");
}

console.log("SMOKE_MESH_PAID_TRUTH_REFUSED=PASS");