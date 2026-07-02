import { runQuoteExpirationEngine } from "../src/index.js";

const now = new Date().toISOString();

const result = runQuoteExpirationEngine({
  subjectId: "pay_204",
  referenceRate: 3200,
  quoteWindowSeconds: 600,
  createdAtIso: now,
  evaluationAtIso: now,
  underpaymentDetected: true,
  paymentRail: {
    paymentRailId: "payment_rail_pay_204_coinbase_crypto",
    subjectId: "pay_204",
    railType: "crypto",
    provider: "coinbase",
    asset: "ETH",
    amount: 90,
    currency: "USD",
    region: "US",
    environment: "sandbox",
    routeClass: "digital_asset",
    sourceRequestAccepted: true,
    reason: "Payment rail request normalized into governed payment-entry form.",
    createdAt: now,
  },
});

if (!result.ok || !result.artifact || result.artifact.quoteStatus !== "REQUOTE_REQUIRED" || result.artifact.requoteRequired !== true) {
  throw new Error("Expected re-quote required.");
}

console.log("SMOKE_QUOTE_EXPIRATION_REQUOTE=PASS");