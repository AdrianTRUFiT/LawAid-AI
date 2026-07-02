import type { FundTrackerActivationPolicy } from "./contracts.js";

export function createDefaultFundTrackerActivationPolicy(): FundTrackerActivationPolicy {
  return {
    requiredBridgeDecision: "TRUSTED",
    requiredAuthorizationDecision: "approved",
    requiredComplianceStatus: "compliant",
    trustScope: "financial",
    artifactType: "ActivatedTransactionState",
  };
}