import { runPilotControlsFeatureFlagLayer } from "../src/index.js";

const result = runPilotControlsFeatureFlagLayer({
  subjectId: "pay_405",
  allowedProviders: ["stripe"],
  paymentRail: {
    paymentRailId: "payment_rail_pay_405_coinbase_crypto",
    subjectId: "pay_405",
    railType: "crypto",
    provider: "coinbase",
    asset: "BTC",
    amount: 60,
    currency: "USD",
    region: "US",
    environment: "sandbox",
    routeClass: "digital_asset",
    sourceRequestAccepted: true,
    reason: "Payment rail request normalized into governed payment-entry form.",
    createdAt: new Date().toISOString(),
  },
});

if (result.ok || result.refusal?.refusalCode !== "PROVIDER_DENIED") {
  throw new Error("Expected provider-denied refusal.");
}

console.log("SMOKE_PILOT_CONTROLS_PROVIDER_DENIED=PASS");