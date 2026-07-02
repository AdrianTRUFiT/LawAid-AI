import { runOfferToEntitlementMatrix } from "../src/index.js";

const result = runOfferToEntitlementMatrix({
  subjectId: "user_105",
  offerCode: "PAID_CORE",
  offerTerm: "weekly",
});

if (result.ok || result.refusal?.refusalCode !== "INVALID_TERM") {
  throw new Error("Expected invalid-term refusal.");
}

console.log("SMOKE_ENTITLEMENT_INVALID_TERM=PASS");