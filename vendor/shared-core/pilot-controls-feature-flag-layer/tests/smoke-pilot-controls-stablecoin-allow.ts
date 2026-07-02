import { runPilotControlsFeatureFlagLayer } from "../src/index.js";

const result = runPilotControlsFeatureFlagLayer({
  subjectId: "pay_401",
  allowedRegions: ["US", "SG"],
  allowedAssets: ["USDC"],
  allowedProviders: ["triplea"],
  paymentRail: {
    paymentRailId: "payment_rail_pay_401_triplea_stablecoin",
    subjectId: "pay_401",
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

if (!result.ok || !result.artifact || result.artifact.decision !== "ALLOW") {
  throw new Error("Expected stablecoin pilot allow.");
}

console.log("SMOKE_PILOT_CONTROLS_STABLECOIN_ALLOW=PASS");