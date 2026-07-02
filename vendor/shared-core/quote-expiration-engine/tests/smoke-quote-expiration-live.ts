import { runQuoteExpirationEngine } from "../src/index.js";

const now = new Date().toISOString();

const result = runQuoteExpirationEngine({
  subjectId: "pay_201",
  referenceRate: 62000,
  quoteWindowSeconds: 600,
  createdAtIso: now,
  evaluationAtIso: now,
  paymentRail: {
    paymentRailId: "payment_rail_pay_201_coinbase_crypto",
    subjectId: "pay_201",
    railType: "crypto",
    provider: "coinbase",
    asset: "BTC",
    amount: 100,
    currency: "USD",
    region: "US",
    environment: "sandbox",
    routeClass: "digital_asset",
    sourceRequestAccepted: true,
    reason: "Payment rail request normalized into governed payment-entry form.",
    createdAt: now,
  },
});

if (!result.ok || !result.artifact || result.artifact.quoteStatus !== "LIVE") {
  throw new Error("Expected live quote.");
}

console.log("SMOKE_QUOTE_EXPIRATION_LIVE=PASS");