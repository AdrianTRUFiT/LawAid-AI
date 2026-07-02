import { runMeshPaidServiceTruthBridge } from "../src/index.js";

const result = runMeshPaidServiceTruthBridge({
  subjectId: "tx_105",
  transactionIntent: {
    transactionIntentId: "mesh_tx_intent_tx_105_MESSAGING_MONTHLY",
    subjectId: "tx_105",
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
    subjectId: "wrong_tx",
    processorReference: "proc_105",
    processorStatus: "processor_approved",
    amountMinor: 1500,
    currency: "USD",
    eventTimestamp: new Date().toISOString(),
  },
});

if (result.ok || result.refusal?.refusalCode !== "SUBJECT_MISMATCH") {
  throw new Error("Expected subject mismatch refusal.");
}

console.log("SMOKE_MESH_PAID_TRUTH_SUBJECT_MISMATCH=PASS");