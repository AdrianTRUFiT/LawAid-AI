import { runOfferToEntitlementMatrix } from "../src/index.js";

const result = runOfferToEntitlementMatrix({
  subjectId: "user_104",
  offerCode: "UNKNOWN_PLAN",
  offerTerm: "monthly",
});

if (result.ok || result.refusal?.refusalCode !== "MISSING_OFFER") {
  throw new Error("Expected missing-offer refusal.");
}

console.log("SMOKE_ENTITLEMENT_MISSING_OFFER=PASS");