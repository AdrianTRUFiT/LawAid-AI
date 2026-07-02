export interface MerchantRiskPolicy {
  merchantId: string;
  profileName: string;
  highAmountThreshold: number;
  nonUsdWeight: number;
  missingMetadataWeight: number;
  suspiciousRailWeight: number;
  highRiskSourceWeight: number;
  mediumRiskMin: number;
  highRiskMin: number;
  criticalRiskMin: number;
  allowTestRails: boolean;
  allowNonUsd: boolean;
}

const defaultPolicy: MerchantRiskPolicy = {
  merchantId: "default",
  profileName: "default",
  highAmountThreshold: 500,
  nonUsdWeight: 20,
  missingMetadataWeight: 10,
  suspiciousRailWeight: 15,
  highRiskSourceWeight: 25,
  mediumRiskMin: 25,
  highRiskMin: 55,
  criticalRiskMin: 80,
  allowTestRails: false,
  allowNonUsd: false,
};

const merchantPolicies: Record<string, MerchantRiskPolicy> = {
  default: defaultPolicy,
  m_001: {
    merchantId: "m_001",
    profileName: "standard-usd",
    highAmountThreshold: 500,
    nonUsdWeight: 20,
    missingMetadataWeight: 10,
    suspiciousRailWeight: 15,
    highRiskSourceWeight: 25,
    mediumRiskMin: 25,
    highRiskMin: 55,
    criticalRiskMin: 80,
    allowTestRails: false,
    allowNonUsd: false,
  },
  m_201: {
    merchantId: "m_201",
    profileName: "strict-consumer",
    highAmountThreshold: 300,
    nonUsdWeight: 25,
    missingMetadataWeight: 15,
    suspiciousRailWeight: 25,
    highRiskSourceWeight: 30,
    mediumRiskMin: 20,
    highRiskMin: 45,
    criticalRiskMin: 70,
    allowTestRails: false,
    allowNonUsd: false,
  },
  m_202: {
    merchantId: "m_202",
    profileName: "international-flex",
    highAmountThreshold: 2000,
    nonUsdWeight: 5,
    missingMetadataWeight: 10,
    suspiciousRailWeight: 15,
    highRiskSourceWeight: 20,
    mediumRiskMin: 35,
    highRiskMin: 65,
    criticalRiskMin: 90,
    allowTestRails: false,
    allowNonUsd: true,
  },
  m_203: {
    merchantId: "m_203",
    profileName: "sandbox-friendly",
    highAmountThreshold: 1000,
    nonUsdWeight: 10,
    missingMetadataWeight: 10,
    suspiciousRailWeight: 0,
    highRiskSourceWeight: 15,
    mediumRiskMin: 30,
    highRiskMin: 60,
    criticalRiskMin: 90,
    allowTestRails: true,
    allowNonUsd: true,
  },
};

export function getDefaultMerchantPolicy(): MerchantRiskPolicy {
  return { ...defaultPolicy };
}

export function getMerchantRiskPolicy(
  merchantId?: string,
): MerchantRiskPolicy {
  if (!merchantId) {
    return getDefaultMerchantPolicy();
  }

  return { ...(merchantPolicies[merchantId] ?? defaultPolicy), merchantId };
}

export function upsertMerchantRiskPolicy(
  policy: MerchantRiskPolicy,
): MerchantRiskPolicy {
  merchantPolicies[policy.merchantId] = { ...policy };
  return { ...merchantPolicies[policy.merchantId] };
}

export function listMerchantRiskPolicies(): MerchantRiskPolicy[] {
  return Object.values(merchantPolicies).map((policy) => ({ ...policy }));
}
