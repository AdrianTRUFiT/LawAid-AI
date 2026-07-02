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
import {
  activateTrustedSettlementForFundTracker,
} from "../../fundtracker-bridge/src/index.js";
import { receiveTrustedActivation } from "../src/index.js";

const wallet: EcosystemWalletProfile = {
  walletId: "wallet_rcv_001",
  ownerId: "owner_rcv_001",
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
  merchantId: "merchant_rcv_001",
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

const fundActor: ActorIdentity = {
  actorId: "fundtracker-operator",
  role: "operator",
  scope: ["financial"],
  keyId: "fundtracker-key-001",
};

const receiveActor: ActorIdentity = {
  actorId: "receiving-operator",
  role: "operator",
  scope: ["receiving"],
  keyId: "receiving-key-001",
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

const receivingTrustPolicy: PolicySnapshot = {
  policyId: "receiving-policy",
  version: "1.0.0",
  allowedArtifactTypes: ["LiveSystemRecord"],
  allowedScopes: ["receiving"],
};

const wrapped = executeSharedSettlementForFundTracker({
  wallet,
  price,
  policy,
  rails,
  rates,
  hasKyc: true,
  actor: fundActor,
  trustPolicy: bridgeTrustPolicy,
});

if (!wrapped.bridgeTrusted || !wrapped.settlementRecord) {
  throw new Error("Expected trusted wrapped settlement.");
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
  actor: fundActor,
  trustPolicy: activationTrustPolicy,
});

if (!activation.activated || !activation.activationRecord) {
  throw new Error("Expected activated transaction state.");
}

const receiving = receiveTrustedActivation({
  wrapped: {
    trusted: true,
    decision: "TRUSTED",
    reason: "Activation trusted.",
    activationRecord: activation.activationRecord,
    trustedEnvelopeId: activation.trustedEnvelopeId,
    authorizationDecision: "approved",
    registryValid: activation.registryValid,
  },
  actor: receiveActor,
  trustPolicy: receivingTrustPolicy,
});

if (!receiving.received || receiving.decision !== "RECEIVED") {
  throw new Error(`Expected RECEIVED but got ${receiving.decision}`);
}

console.log("SMOKE_RECEIVING_BRIDGE_SUCCESS=PASS");
console.log(`RECEIVING_DECISION=${receiving.decision}`);