import { createDefaultScreeningPolicy, runTransactionScreening } from "../lib/transaction-screening";

const result = runTransactionScreening({
  input: {
    transactionId: "txn_review_001",
    transactionType: "transfer",
    amount: 500,
    currency: "USD",
    sender: {
      id: "snd_002",
      name: "Sender Review",
      country: "US",
      kycVerified: false,
      sanctionsMatched: false,
    },
    recipient: {
      id: "rcp_002",
      name: "Recipient Review",
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

if (result.decision !== "REVIEW_REQUIRED") {
  throw new Error(`Expected REVIEW_REQUIRED but received ${result.decision}`);
}

console.log("SMOKE_SCREENING_REVIEW=PASS");
console.log(`DECISION=${result.decision}`);
console.log(`HIT_COUNT=${result.hits.length}`);
