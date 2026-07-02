import { runSettlementPolicyEngine } from "../src/index.js";

const result = runSettlementPolicyEngine({
  subjectId: "pay_102",
  preferredStablecoin: "USDC",
  paymentRail: {
    paymentRailId: "payment_rail_pay_102_coinbase_crypto",
    subjectId: "pay_102",
    railType: "crypto",
    provider: "coinbase",
    asset: "ETH",
    amount: 95,
    currency: "USD",
    region: "US",
    environment: "sandbox",
    routeClass: "digital_asset",
    sourceRequestAccepted: true,
    reason: "Payment rail request normalized into governed payment-entry form.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.settlementDecision !== "CONVERT_TO_STABLECOIN" || result.artifact.settlementAsset !== "USDC") {
  throw new Error("Expected ETH to USDC settlement.");
}

console.log("SMOKE_SETTLEMENT_POLICY_ETH_USDC=PASS");