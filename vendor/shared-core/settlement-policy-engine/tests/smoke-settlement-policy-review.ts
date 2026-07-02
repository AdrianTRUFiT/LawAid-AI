import { runSettlementPolicyEngine } from "../src/index.js";

const result = runSettlementPolicyEngine({
  subjectId: "pay_106",
  reviewAboveAmount: 200,
  paymentRail: {
    paymentRailId: "payment_rail_pay_106_coinbase_crypto",
    subjectId: "pay_106",
    railType: "crypto",
    provider: "coinbase",
    asset: "BTC",
    amount: 250,
    currency: "USD",
    region: "US",
    environment: "sandbox",
    routeClass: "digital_asset",
    sourceRequestAccepted: true,
    reason: "Payment rail request normalized into governed payment-entry form.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.settlementDecision !== "HOLD_FOR_REVIEW" || result.artifact.reviewRequired !== true) {
  throw new Error("Expected hold-for-review settlement.");
}

console.log("SMOKE_SETTLEMENT_POLICY_REVIEW=PASS");