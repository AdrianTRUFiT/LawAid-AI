import { runQuoteExpirationEngine } from "../src/index.js";

const quotedAt = new Date(Date.now() - 700 * 1000).toISOString();
const evalAt = new Date().toISOString();

const result = runQuoteExpirationEngine({
  subjectId: "pay_202",
  referenceRate: 3200,
  quoteWindowSeconds: 600,
  createdAtIso: quotedAt,
  evaluationAtIso: evalAt,
  paymentRail: {
    paymentRailId: "payment_rail_pay_202_coinbase_crypto",
    subjectId: "pay_202",
    railType: "crypto",
    provider: "coinbase",
    asset: "ETH",
    amount: 75,
    currency: "USD",
    region: "US",
    environment: "sandbox",
    routeClass: "digital_asset",
    sourceRequestAccepted: true,
    reason: "Payment rail request normalized into governed payment-entry form.",
    createdAt: quotedAt,
  },
});

if (!result.ok || !result.artifact || result.artifact.quoteStatus !== "EXPIRED" || result.artifact.requoteRequired !== true) {
  throw new Error("Expected expired quote.");
}

console.log("SMOKE_QUOTE_EXPIRATION_EXPIRED=PASS");