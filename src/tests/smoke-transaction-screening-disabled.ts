import { createDefaultScreeningPolicy, runTransactionScreening } from "../lib/transaction-screening";

const result = runTransactionScreening({
  input: {
    transactionId: "txn_disabled_001",
    transactionType: "payment",
    amount: 999999,
    currency: "USD",
    sender: {
      id: "snd_006",
      name: "Sender Disabled",
      country: "IR",
      kycVerified: false,
      sanctionsMatched: true,
    },
    recipient: {
      id: "rcp_006",
      name: "Recipient Disabled",
      country: "US",
      kycVerified: false,
      sanctionsMatched: false,
    },
    metadata: {
      declaredSenderId: "mismatch_sender",
    },
    occurredAt: new Date().toISOString(),
    priorTransactionIds: ["txn_disabled_001"],
    recentVelocityCount: 20,
  },
  policy: createDefaultScreeningPolicy("disabled"),
});

if (result.decision !== "PASS") {
  throw new Error(`Expected PASS in disabled mode but received ${result.decision}`);
}

if (result.hits.length !== 0) {
  throw new Error(`Expected 0 hits in disabled mode but received ${result.hits.length}`);
}

console.log("SMOKE_SCREENING_DISABLED=PASS");
console.log(`DECISION=${result.decision}`);
console.log(`HIT_COUNT=${result.hits.length}`);
