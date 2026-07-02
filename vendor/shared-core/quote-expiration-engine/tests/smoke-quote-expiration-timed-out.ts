import { runQuoteExpirationEngine } from "../src/index.js";

const quotedAt = new Date(Date.now() - 1300 * 1000).toISOString();
const evalAt = new Date().toISOString();

const result = runQuoteExpirationEngine({
  subjectId: "pay_203",
  referenceRate: 1,
  quoteWindowSeconds: 600,
  createdAtIso: quotedAt,
  evaluationAtIso: evalAt,
  paymentRail: {
    paymentRailId: "payment_rail_pay_203_triplea_stablecoin",
    subjectId: "pay_203",
    railType: "stablecoin",
    provider: "triplea",
    asset: "USDC",
    amount: 60,
    currency: "USD",
    region: "SG",
    environment: "sandbox",
    routeClass: "digital_asset",
    sourceRequestAccepted: true,
    reason: "Payment rail request normalized into governed payment-entry form.",
    createdAt: quotedAt,
  },
});

if (!result.ok || !result.artifact || result.artifact.quoteStatus !== "TIMED_OUT") {
  throw new Error("Expected timed-out quote.");
}

console.log("SMOKE_QUOTE_EXPIRATION_TIMED_OUT=PASS");