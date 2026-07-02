import { runPaymentRailAbstraction } from "../src/index.js";

const result = runPaymentRailAbstraction({
  subjectId: "pay_002",
  railType: "crypto",
  provider: "coinbase",
  asset: "btc",
  amount: 125,
  currency: "usd",
  region: "us",
  environment: "sandbox",
});

if (!result.ok || !result.artifact || result.artifact.railType !== "crypto" || result.artifact.routeClass !== "digital_asset") {
  throw new Error("Expected normalized crypto rail.");
}

console.log("SMOKE_PAYMENT_RAIL_CRYPTO=PASS");