import type {
  ActorIdentity,
  PolicySnapshot,
} from "../../trust-spine/src/index.js";
import {
  buildRealValuePrice,
  executeSharedSettlementForFundTracker,
  type EcosystemWalletProfile,
  type JurisdictionPolicy,
  type RailCapability,
  type ValueConversionRate,
} from "../src/index.js";

const wallet: EcosystemWalletProfile = {
  walletId: "wallet_tb_001",
  ownerId: "owner_tb_001",
  homeJurisdiction: "US",
  trustTier: "trusted",
  balances: [
    {
      balanceId: "bal_usdx",
      valueKind: "stable_value",
      unitCode: "USDX",
      amount: 100,
      priority: 1,
    },
  ],
};

const price = buildRealValuePrice({
  merchantId: "merchant_tb_001",
  realValueUnits: 10,
  displayCurrency: "USD",
  settlementCurrency: "USD",
  realValueToDisplayRate: 2,
  realValueToSettlementRate: 2,
});

const policy: JurisdictionPolicy = {
  jurisdictionCode: "US",
  acceptedValueKinds: ["stable_value", "fiat_balance", "merchant_credit"],
  allowedRails: ["stable_settlement", "internal_ledger"],
  requiresKyc: true,
  minTrustTier: "verified",
};

const rails: RailCapability[] = [
  {
    railType: "stable_settlement",
    supportedSettlementCurrencies: ["USD"],
    jurisdictions: ["US"],
    enabled: true,
    priority: 1,
    settlementFinalityClass: "network_final",
  },
];

const rates: ValueConversionRate[] = [
  {
    unitCode: "USDX",
    settlementCurrency: "USD",
    settlementPerUnit: 1,
    displayCurrency: "USD",
    displayPerUnit: 1,
  },
];

const actor: ActorIdentity = {
  actorId: "fundtracker-operator",
  role: "operator",
  scope: ["financial"],
  keyId: "fundtracker-key-001",
};

const trustPolicy: PolicySnapshot = {
  policyId: "shared-bridge-trust-policy",
  version: "1.0.0",
  allowedArtifactTypes: ["EcosystemSettlementRecord"],
  allowedScopes: ["financial"],
};

const result = executeSharedSettlementForFundTracker({
  wallet,
  price,
  policy,
  rails,
  rates,
  hasKyc: true,
  actor,
  trustPolicy,
});

if (!result.walletDecisionApproved) {
  throw new Error("Expected wallet decision to be approved.");
}

if (!result.bridgeTrusted || result.bridgeDecision !== "TRUSTED") {
  throw new Error(`Expected trusted bridge result, received ${result.bridgeDecision}`);
}

console.log("SMOKE_SHARED_VALUE_TO_SHARED_TRUST_WRAP=PASS");
console.log(`BRIDGE_DECISION=${result.bridgeDecision}`);