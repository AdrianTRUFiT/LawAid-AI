import { runFundTrackerScreeningReserveBridge } from "../lib/fundtracker/screeningReserveBridge";

const bridgeResult = runFundTrackerScreeningReserveBridge({
  screeningEnabled: true,
  mode: "review",
  screeningInput: {
    transactionId: "txn_bridge_001",
    transactionType: "transfer",
    amount: 15000,
    currency: "USD",
    sender: {
      id: "snd_005",
      name: "Sender Bridge",
      country: "US",
      kycVerified: true,
      sanctionsMatched: false,
    },
    recipient: {
      id: "rcp_005",
      name: "Recipient Bridge",
      country: "US",
      kycVerified: true,
      sanctionsMatched: false,
    },
    metadata: {},
    occurredAt: new Date().toISOString(),
    priorTransactionIds: [],
    recentVelocityCount: 1,
  },
});

if (!bridgeResult.screeningApplied) {
  throw new Error("Expected screeningApplied=true");
}

if (!bridgeResult.screeningResult) {
  throw new Error("Expected screeningResult");
}

if (bridgeResult.screeningResult.decision !== "REVIEW_REQUIRED") {
  throw new Error(
    `Expected REVIEW_REQUIRED in review mode but received ${bridgeResult.screeningResult.decision}`
  );
}

console.log("SMOKE_SCREENING_BRIDGE=PASS");
console.log(`DECISION=${bridgeResult.screeningResult.decision}`);
console.log(`REQUIRES_REVIEW=${bridgeResult.requiresReview}`);
