import type {
  ComplianceSnapshot,
  EcosystemWalletProfile,
  JurisdictionPolicy,
  RailCapability,
} from "./contracts.js";

const TRUST_ORDER: Record<EcosystemWalletProfile["trustTier"], number> = {
  starter: 1,
  verified: 2,
  trusted: 3,
  institutional: 4,
};

export function buildComplianceSnapshot(input: {
  wallet: EcosystemWalletProfile;
  merchantId: string;
  jurisdictionCode: string;
  hasKyc: boolean;
  policy: JurisdictionPolicy;
  rails: RailCapability[];
}): ComplianceSnapshot {
  const notes: string[] = [];
  const blockedMerchant = (input.policy.blockedMerchantIds ?? []).includes(input.merchantId);

  const trustSatisfied = input.policy.minTrustTier
    ? TRUST_ORDER[input.wallet.trustTier] >= TRUST_ORDER[input.policy.minTrustTier]
    : true;

  const kycSatisfied = input.policy.requiresKyc ? input.hasKyc : true;

  const allowedRails = input.rails
    .filter(
      (r) =>
        r.enabled &&
        r.jurisdictions.includes(input.jurisdictionCode) &&
        input.policy.allowedRails.includes(r.railType),
    )
    .map((r) => r.railType);

  let status: ComplianceSnapshot["status"] = "compliant";

  if (blockedMerchant) {
    status = "refused";
    notes.push("Merchant is blocked in this jurisdiction.");
  }
  if (!trustSatisfied) {
    status = "review_required";
    notes.push("Trust tier is below jurisdiction requirement.");
  }
  if (!kycSatisfied) {
    status = status === "refused" ? "refused" : "review_required";
    notes.push("KYC requirement is not satisfied.");
  }
  if (allowedRails.length === 0) {
    status = "restricted";
    notes.push("No allowed settlement rails are available.");
  }

  return {
    jurisdictionCode: input.jurisdictionCode,
    merchantId: input.merchantId,
    trustTier: input.wallet.trustTier,
    kycSatisfied,
    policySatisfied: status === "compliant",
    acceptedValueKinds: input.policy.acceptedValueKinds,
    allowedRails,
    status,
    notes,
    createdAt: new Date().toISOString(),
  };
}
