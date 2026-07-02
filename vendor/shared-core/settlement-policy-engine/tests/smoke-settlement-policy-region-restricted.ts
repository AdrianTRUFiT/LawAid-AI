import { runSettlementPolicyEngine } from "../src/index.js";

const result = runSettlementPolicyEngine({
  subjectId: "pay_104",
  restrictedRegions: ["SG"],
  paymentRail: {
    paymentRailId: "payment_rail_pay_104_triplea_stablecoin",
    subjectId: "pay_104",
    railType: "stablecoin",
    provider: "triplea",
    asset: "USDC",
    amount: 80,
    currency: "USD",
    region: "SG",
    environment: "sandbox",
    routeClass: "digital_asset",
    sourceRequestAccepted: true,
    reason: "Payment rail request normalized into governed payment-entry form.",
    createdAt: new Date().toISOString(),
  },
});

if (result.ok || result.refusal?.refusalCode !== "REGION_RESTRICTED") {
  throw new Error("Expected region-restricted refusal.");
}

console.log("SMOKE_SETTLEMENT_POLICY_REGION_RESTRICTED=PASS");