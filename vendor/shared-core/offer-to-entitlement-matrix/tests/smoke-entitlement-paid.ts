import { runOfferToEntitlementMatrix } from "../src/index.js";

const result = runOfferToEntitlementMatrix({
  subjectId: "user_102",
  offerCode: "PAID_CORE",
  offerTerm: "monthly",
});

if (!result.ok || !result.artifact || !result.artifact.rights.includes("full_support")) {
  throw new Error("Expected paid offer mapping.");
}

console.log("SMOKE_ENTITLEMENT_PAID=PASS");