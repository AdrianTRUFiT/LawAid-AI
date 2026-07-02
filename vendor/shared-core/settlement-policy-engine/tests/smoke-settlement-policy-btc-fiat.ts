import { runSettlementPolicyEngine } from "../src/index.js";

const result = runSettlementPolicyEngine({
  subjectId: "pay_101",
  paymentRail: {
    paymentRailId: "payment_rail_pay_101_coinbase_crypto",
    subjectId: "pay_101",
    railType: "crypto",
    provider: "coinbase",
    asset: "BTC",
    amount: 125,
    currency: "USD",
    region: "US",
    environment: "sandbox",
    routeClass: "digital_asset",
    sourceRequestAccepted: true,
    reason: "Payment rail request normalized into governed payment-entry form.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.settlementDecision !== "CONVERT_TO_FIAT" || result.artifact.settlementAsset !== "USD") {
  throw new Error("Expected BTC to fiat settlement.");
}

console.log("SMOKE_SETTLEMENT_POLICY_BTC_FIAT=PASS");