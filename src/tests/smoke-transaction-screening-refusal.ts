import { createDefaultScreeningPolicy, runTransactionScreening } from "../lib/transaction-screening";

const result = runTransactionScreening({
  input: {
    transactionId: "txn_refuse_001",
    transactionType: "payout",
    amount: 300,
    currency: "USD",
    sender: {
      id: "snd_003",
      name: "Sender Refuse",
      country: "US",
      kycVerified: true,
      sanctionsMatched: true,
    },
    recipient: {
      id: "rcp_003",
      name: "Recipient Refuse",
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

if (result.decision !== "REFUSE") {
  throw new Error(`Expected REFUSE but received ${result.decision}`);
}

console.log("SMOKE_SCREENING_REFUSAL=PASS");
console.log(`DECISION=${result.decision}`);
console.log(`BLOCKED=${result.blocked}`);
