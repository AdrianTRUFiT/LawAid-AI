import type { DisclosurePolicy } from "./contracts.js";

export function createDefaultDisclosurePolicy(): DisclosurePolicy {
  return {
    policyId: "default-compliance-trust-policy",
    minimumDisclosureFields: ["subjectId", "jurisdictionCode", "claimSummary"],
    requiredClaims: ["base_eligibility"],
    allowExpiredUse: false,
    releaseMode: "single_use",
  };
}