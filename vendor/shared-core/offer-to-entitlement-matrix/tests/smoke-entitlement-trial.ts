import { runOfferToEntitlementMatrix } from "../src/index.js";

const result = runOfferToEntitlementMatrix({
  subjectId: "user_101",
  offerCode: "TRIAL_CORE",
  offerTerm: "trial_14d",
});

if (!result.ok || !result.artifact || result.artifact.durationDays !== 14) {
  throw new Error("Expected trial offer mapping.");
}

console.log("SMOKE_ENTITLEMENT_TRIAL=PASS");