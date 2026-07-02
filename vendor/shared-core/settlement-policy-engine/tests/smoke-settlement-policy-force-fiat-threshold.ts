import { runSettlementPolicyEngine } from "../src/index.js";

const result = runSettlementPolicyEngine({
  subjectId: "pay_105",
  forceFiatThreshold: 100,
  paymentRail: {
    paymentRailId: "payment_rail_pay_105_coinbase_crypto",
    subjectId: "pay_105",
    railType: "crypto",
    provider: "coinbase",
    asset: "ETH",
    amount: 150,
    currency: "USD",
    region: "US",
    environment: "sandbox",
    routeClass: "digital_asset",
    sourceRequestAccepted: true,
    reason: "Payment rail request normalized into governed payment-entry form.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.settlementDecision !== "CONVERT_TO_FIAT") {
  throw new Error("Expected force-fiat threshold settlement.");
}

console.log("SMOKE_SETTLEMENT_POLICY_FORCE_FIAT_THRESHOLD=PASS");