import {
  buildComplianceSnapshot,
  type EcosystemWalletProfile,
  type JurisdictionPolicy,
  type RailCapability,
} from "../src/index.js";

const wallet: EcosystemWalletProfile = {
  walletId: "wallet_002",
  ownerId: "owner_002",
  homeJurisdiction: "US",
  trustTier: "starter",
  balances: [],
};

const policy: JurisdictionPolicy = {
  jurisdictionCode: "AE",
  acceptedValueKinds: ["stable_value", "fiat_balance"],
  allowedRails: ["stable_settlement"],
  requiresKyc: true,
  minTrustTier: "verified",
};

const rails: RailCapability[] = [
  {
    railType: "stable_settlement",
    supportedSettlementCurrencies: ["AED"],
    jurisdictions: ["AE"],
    enabled: true,
    priority: 1,
    settlementFinalityClass: "network_final",
  },
];

const snapshot = buildComplianceSnapshot({
  wallet,
  merchantId: "merchant_ae",
  jurisdictionCode: "AE",
  hasKyc: false,
  policy,
  rails,
});

if (snapshot.status !== "review_required") {
  throw new Error(`Expected review_required but got ${snapshot.status}`);
}

console.log("SMOKE_SHARED_VALUE_COMPLIANCE=PASS");
