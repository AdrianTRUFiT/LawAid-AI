import { createDefaultScreeningPolicy, runTransactionScreening } from "../lib/transaction-screening";

const result = runTransactionScreening({
  input: {
    transactionId: "txn_observe_001",
    transactionType: "payment",
    amount: 999999,
    currency: "USD",
    sender: {
      id: "snd_004",
      name: "Sender Observe",
      country: "IR",
      kycVerified: false,
      sanctionsMatched: true,
    },
    recipient: {
      id: "rcp_004",
      name: "Recipient Observe",
      country: "US",
      kycVerified: false,
      sanctionsMatched: false,
    },
    metadata: {
      declaredSenderId: "mismatch_sender",
    },
    occurredAt: new Date().toISOString(),
    priorTransactionIds: ["txn_observe_001"],
    recentVelocityCount: 20,
  },
  policy: createDefaultScreeningPolicy("observe"),
});

if (result.decision !== "PASS") {
  throw new Error(`Expected PASS in observe mode but received ${result.decision}`);
}

console.log("SMOKE_SCREENING_OBSERVE=PASS");
console.log(`DECISION=${result.decision}`);
console.log(`SUMMARY=${result.summary}`);
