import { runPilotControlsFeatureFlagLayer } from "../src/index.js";

const result = runPilotControlsFeatureFlagLayer({
  subjectId: "pay_402",
  allowedRegions: ["US"],
  paymentRail: {
    paymentRailId: "payment_rail_pay_402_triplea_stablecoin",
    subjectId: "pay_402",
    railType: "stablecoin",
    provider: "triplea",
    asset: "USDC",
    amount: 50,
    currency: "USD",
    region: "SG",
    environment: "sandbox",
    routeClass: "digital_asset",
    sourceRequestAccepted: true,
    reason: "Payment rail request normalized into governed payment-entry form.",
    createdAt: new Date().toISOString(),
  },
});

if (result.ok || result.refusal?.refusalCode !== "REGION_DENIED") {
  throw new Error("Expected region-denied refusal.");
}

console.log("SMOKE_PILOT_CONTROLS_REGION_DENIED=PASS");