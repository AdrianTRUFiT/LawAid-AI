import type { MerchantRiskPolicy } from "../../lib/fundtracker";
import {
  getStoredMerchantPolicies,
  upsertStoredMerchantPolicy,
} from "../../lib/fundtracker/merchantPolicyStore";

export function listStoredMerchantPoliciesApi() {
  return {
    ok: true,
    artifactType: "StoredMerchantRiskPolicyList",
    payload: getStoredMerchantPolicies(),
  };
}

export function upsertStoredMerchantPolicyApi(
  payload: MerchantRiskPolicy,
) {
  return {
    ok: true,
    artifactType: "StoredMerchantRiskPolicy",
    payload: upsertStoredMerchantPolicy(payload),
  };
}
