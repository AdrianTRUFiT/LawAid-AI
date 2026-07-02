import { runSettlementPolicyEngine } from "../src/index.js";

const result = runSettlementPolicyEngine({
  subjectId: "pay_103",
  paymentRail: {
    paymentRailId: "payment_rail_pay_103_triplea_stablecoin",
    subjectId: "pay_103",
    railType: "stablecoin",
    provider: "triplea",
    asset: "USDC",
    amount: 80,
    currency: "USD",
    region: "SG",
    environment: "sandbox",
    routeClass: "digital_asset",
    sourceRequestAccepted: true,
    reason: "Payment rail request normalized into governed payment-entry form.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.settlementDecision !== "RETAIN_ASSET" || result.artifact.settlementAsset !== "USDC") {
  throw new Error("Expected stablecoin retain settlement.");
}

console.log("SMOKE_SETTLEMENT_POLICY_STABLECOIN_RETAIN=PASS");