import { runPaymentRailAbstraction } from "../src/index.js";

const result = runPaymentRailAbstraction({
  subjectId: "pay_004",
  railType: "barter",
  provider: "custom",
  asset: "trade",
  amount: 10,
  currency: "usd",
  region: "us",
  environment: "sandbox",
});

if (result.ok || result.refusal?.refusalCode !== "UNSUPPORTED_RAIL") {
  throw new Error("Expected unsupported rail refusal.");
}

console.log("SMOKE_PAYMENT_RAIL_UNSUPPORTED=PASS");