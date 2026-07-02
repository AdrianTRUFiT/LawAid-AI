import { runTreasuryVisibilityLedger } from "../src/index.js";

const result = runTreasuryVisibilityLedger({
  subjectId: "pay_303",
  settlementPolicy: {
    settlementPolicyId: "settlement_policy_payment_rail_pay_303",
    subjectId: "pay_303",
    sourcePaymentRailId: "payment_rail_pay_303",
    receivedAsset: "BTC",
    receivedAmount: 250,
    receivedCurrency: "USD",
    settlementDecision: "HOLD_FOR_REVIEW",
    settlementAsset: null,
    reviewRequired: true,
    policyReason: "Settlement held for review because amount exceeds configured review threshold.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.exceptionState !== "review_required") {
  throw new Error("Expected review-state treasury visibility record.");
}

console.log("SMOKE_TREASURY_VISIBILITY_REVIEW=PASS");