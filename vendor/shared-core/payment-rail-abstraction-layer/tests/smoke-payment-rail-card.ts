import { runPaymentRailAbstraction } from "../src/index.js";

const result = runPaymentRailAbstraction({
  subjectId: "pay_001",
  railType: "card",
  provider: "stripe",
  asset: "card",
  amount: 49,
  currency: "usd",
  region: "us",
  environment: "sandbox",
});

if (!result.ok || !result.artifact || result.artifact.railType !== "card" || result.artifact.routeClass !== "traditional") {
  throw new Error("Expected normalized card rail.");
}

console.log("SMOKE_PAYMENT_RAIL_CARD=PASS");