import { runTreasuryVisibilityLedger } from "../src/index.js";

const result = runTreasuryVisibilityLedger({
  subjectId: "pay_302",
  reserveDestination: "usdc_reserve_wallet",
  settlementPolicy: {
    settlementPolicyId: "settlement_policy_payment_rail_pay_302",
    subjectId: "pay_302",
    sourcePaymentRailId: "payment_rail_pay_302",
    receivedAsset: "USDC",
    receivedAmount: 80,
    receivedCurrency: "USD",
    settlementDecision: "RETAIN_ASSET",
    settlementAsset: "USDC",
    reviewRequired: false,
    policyReason: "Stablecoin rail retained as governed settlement asset.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.settlementAsset !== "USDC" || result.artifact.reserveDestination !== "usdc_reserve_wallet") {
  throw new Error("Expected stablecoin treasury visibility record.");
}

console.log("SMOKE_TREASURY_VISIBILITY_STABLECOIN=PASS");