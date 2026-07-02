import type { MerchantRiskPolicy } from "../../lib/fundtracker";
import {
  getMerchantRiskPolicy,
  listMerchantRiskPolicies,
  upsertMerchantRiskPolicy,
} from "../../lib/fundtracker";

export function getMerchantPolicyApi(merchantId: string) {
  return {
    ok: true,
    artifactType: "MerchantRiskPolicy",
    payload: getMerchantRiskPolicy(merchantId),
  };
}

export function listMerchantPoliciesApi() {
  return {
    ok: true,
    artifactType: "MerchantRiskPolicyList",
    payload: listMerchantRiskPolicies(),
  };
}

export function upsertMerchantPolicyApi(payload: MerchantRiskPolicy) {
  return {
    ok: true,
    artifactType: "MerchantRiskPolicy",
    payload: upsertMerchantRiskPolicy(payload),
  };
}
