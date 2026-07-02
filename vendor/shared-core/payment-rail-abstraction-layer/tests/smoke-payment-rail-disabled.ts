import { runPaymentRailAbstraction } from "../src/index.js";

const result = runPaymentRailAbstraction({
  subjectId: "pay_005",
  railType: "crypto",
  provider: "coinbase",
  asset: "eth",
  amount: 30,
  currency: "usd",
  region: "us",
  environment: "sandbox",
  enabled: false,
});

if (result.ok || result.refusal?.refusalCode !== "DISABLED_RAIL") {
  throw new Error("Expected disabled rail refusal.");
}

console.log("SMOKE_PAYMENT_RAIL_DISABLED=PASS");