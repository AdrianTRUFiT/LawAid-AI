import { runPilotControlsFeatureFlagLayer } from "../src/index.js";

const result = runPilotControlsFeatureFlagLayer({
  subjectId: "pay_404",
  emergencyDisabled: true,
  paymentRail: {
    paymentRailId: "payment_rail_pay_404_coinbase_crypto",
    subjectId: "pay_404",
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

if (!result.ok || !result.artifact || result.artifact.decision !== "EMERGENCY_DISABLED") {
  throw new Error("Expected emergency-disabled decision.");
}

console.log("SMOKE_PILOT_CONTROLS_EMERGENCY_DISABLED=PASS");