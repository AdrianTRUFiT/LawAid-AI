import { runMeshPaidServiceTruthBridge } from "../src/index.js";

const result = runMeshPaidServiceTruthBridge({
  subjectId: "tx_106",
  transactionIntent: null,
  processorEvent: {
    subjectId: "tx_106",
    processorReference: "proc_106",
    processorStatus: "processor_approved",
    amountMinor: 1500,
    currency: "USD",
    eventTimestamp: new Date().toISOString(),
  },
});

if (result.ok || result.refusal?.refusalCode !== "MISSING_INPUT") {
  throw new Error("Expected missing-input refusal.");
}

console.log("SMOKE_MESH_PAID_TRUTH_MISSING_INPUT=PASS");