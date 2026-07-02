import { runTreasuryVisibilityLedger } from "../src/index.js";

const result = runTreasuryVisibilityLedger({
  subjectId: "pay_301",
  reserveDestination: "ops_usd_account",
  settlementPolicy: {
    settlementPolicyId: "settlement_policy_payment_rail_pay_301",
    subjectId: "pay_301",
    sourcePaymentRailId: "payment_rail_pay_301",
    receivedAsset: "BTC",
    receivedAmount: 125,
    receivedCurrency: "USD",
    settlementDecision: "CONVERT_TO_FIAT",
    settlementAsset: "USD",
    reviewRequired: false,
    policyReason: "BTC converted to fiat under treasury policy.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.settlementDecision !== "CONVERT_TO_FIAT" || result.artifact.reserveDestination !== "ops_usd_account") {
  throw new Error("Expected fiat treasury visibility record.");
}

console.log("SMOKE_TREASURY_VISIBILITY_FIAT=PASS");