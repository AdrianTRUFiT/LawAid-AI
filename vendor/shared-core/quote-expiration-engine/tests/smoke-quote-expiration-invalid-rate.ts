import { runQuoteExpirationEngine } from "../src/index.js";

const result = runQuoteExpirationEngine({
  subjectId: "pay_205",
  referenceRate: 0,
  quoteWindowSeconds: 600,
  paymentRail: {
    paymentRailId: "payment_rail_pay_205_coinbase_crypto",
    subjectId: "pay_205",
    railType: "crypto",
    provider: "coinbase",
    asset: "BTC",
    amount: 90,
    currency: "USD",
    region: "US",
    environment: "sandbox",
    routeClass: "digital_asset",
    sourceRequestAccepted: true,
    reason: "Payment rail request normalized into governed payment-entry form.",
    createdAt: new Date().toISOString(),
  },
});

if (result.ok || result.refusal?.refusalCode !== "INVALID_RATE") {
  throw new Error("Expected invalid-rate refusal.");
}

console.log("SMOKE_QUOTE_EXPIRATION_INVALID_RATE=PASS");