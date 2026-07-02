import { runTreasuryVisibilityLedger } from "../src/index.js";

const result = runTreasuryVisibilityLedger({
  subjectId: "pay_304",
  settlementPolicy: {
    settlementPolicyId: "settlement_policy_payment_rail_pay_304",
    subjectId: "pay_304",
    sourcePaymentRailId: "payment_rail_pay_304",
    receivedAsset: "",
    receivedAmount: 0,
    receivedCurrency: "",
    settlementDecision: "CONVERT_TO_FIAT",
    settlementAsset: "USD",
    reviewRequired: false,
    policyReason: "Malformed test record.",
    createdAt: new Date().toISOString(),
  },
});

if (result.ok || result.refusal?.refusalCode !== "MALFORMED_SETTLEMENT_POLICY") {
  throw new Error("Expected malformed-settlement-policy refusal.");
}

console.log("SMOKE_TREASURY_VISIBILITY_MALFORMED=PASS");