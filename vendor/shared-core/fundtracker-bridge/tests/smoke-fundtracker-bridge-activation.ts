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
} from "../../ecosystem-value/src/index.js";
import { activateTrustedSettlementForFundTracker } from "../src/index.js";

const wallet: EcosystemWalletProfile = {
  walletId: "wallet_ft_001",
  ownerId: "owner_ft_001",
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
  merchantId: "merchant_ft_001",
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

const bridgeTrustPolicy: PolicySnapshot = {
  policyId: "shared-bridge-trust-policy",
  version: "1.0.0",
  allowedArtifactTypes: ["EcosystemSettlementRecord"],
  allowedScopes: ["financial"],
};

const activationTrustPolicy: PolicySnapshot = {
  policyId: "fundtracker-activation-policy",
  version: "1.0.0",
  allowedArtifactTypes: ["ActivatedTransactionState"],
  allowedScopes: ["financial"],
};

const wrapped = executeSharedSettlementForFundTracker({
  wallet,
  price,
  policy,
  rails,
  rates,
  hasKyc: true,
  actor,
  trustPolicy: bridgeTrustPolicy,
});

if (!wrapped.bridgeTrusted || !wrapped.settlementRecord) {
  throw new Error("Expected trusted wrapped settlement before FundTracker activation.");
}

const activation = activateTrustedSettlementForFundTracker({
  wrapped: {
    trusted: wrapped.bridgeTrusted,
    decision: wrapped.bridgeDecision as "TRUSTED",
    reason: "Bridge trusted.",
    settlementRecord: wrapped.settlementRecord,
    trustedEnvelopeId: wrapped.trustedEnvelopeId,
    authorizationDecision: "approved",
    registryValid: wrapped.registryValid,
  },
  actor,
  trustPolicy: activationTrustPolicy,
});

if (!activation.activated || activation.decision !== "ACTIVATED") {
  throw new Error(`Expected ACTIVATED but received ${activation.decision}`);
}

console.log("SMOKE_FUNDTRACKER_BRIDGE_ACTIVATION=PASS");
console.log(`ACTIVATION_DECISION=${activation.decision}`);