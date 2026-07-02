import { createDefaultScreeningPolicy, runTransactionScreening } from "../lib/transaction-screening";

const result = runTransactionScreening({
  input: {
    transactionId: "txn_clean_001",
    transactionType: "payment",
    amount: 125,
    currency: "USD",
    sender: {
      id: "snd_001",
      name: "Sender Clean",
      country: "US",
      kycVerified: true,
      sanctionsMatched: false,
    },
    recipient: {
      id: "rcp_001",
      name: "Recipient Clean",
      country: "US",
      kycVerified: true,
      sanctionsMatched: false,
    },
    metadata: {},
    occurredAt: new Date().toISOString(),
    priorTransactionIds: [],
    recentVelocityCount: 1,
  },
  policy: createDefaultScreeningPolicy("enforce"),
});

if (result.decision !== "PASS") {
  throw new Error(`Expected PASS but received ${result.decision}`);
}

console.log("SMOKE_SCREENING_PASS=PASS");
console.log(`DECISION=${result.decision}`);
console.log(`ARTIFACT_COUNT=${result.artifacts.length}`);
