import { runPilotControlsFeatureFlagLayer } from "../src/index.js";

const result = runPilotControlsFeatureFlagLayer({
  subjectId: "pay_403",
  sandboxOnly: true,
  paymentRail: {
    paymentRailId: "payment_rail_pay_403_coinbase_crypto",
    subjectId: "pay_403",
    railType: "crypto",
    provider: "coinbase",
    asset: "BTC",
    amount: 60,
    currency: "USD",
    region: "US",
    environment: "production",
    routeClass: "digital_asset",
    sourceRequestAccepted: true,
    reason: "Payment rail request normalized into governed payment-entry form.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.decision !== "SANDBOX_ONLY") {
  throw new Error("Expected sandbox-only decision.");
}

console.log("SMOKE_PILOT_CONTROLS_SANDBOX_ONLY=PASS");