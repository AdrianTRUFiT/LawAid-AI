import { runPaymentRailAbstraction } from "../src/index.js";

const result = runPaymentRailAbstraction({
  subjectId: "pay_003",
  railType: "stablecoin",
  provider: "triplea",
  asset: "usdc",
  amount: 80,
  currency: "usd",
  region: "sg",
  environment: "sandbox",
});

if (!result.ok || !result.artifact || result.artifact.railType !== "stablecoin" || result.artifact.routeClass !== "digital_asset") {
  throw new Error("Expected normalized stablecoin rail.");
}

console.log("SMOKE_PAYMENT_RAIL_STABLECOIN=PASS");