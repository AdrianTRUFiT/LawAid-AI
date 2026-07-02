import { runOfferToEntitlementMatrix } from "../src/index.js";

const result = runOfferToEntitlementMatrix({
  subjectId: "user_103",
  offerCode: "MODULE_ADDON",
  offerTerm: "annual",
});

if (!result.ok || !result.artifact || result.artifact.durationDays !== 365) {
  throw new Error("Expected add-on offer mapping.");
}

console.log("SMOKE_ENTITLEMENT_ADDON=PASS");