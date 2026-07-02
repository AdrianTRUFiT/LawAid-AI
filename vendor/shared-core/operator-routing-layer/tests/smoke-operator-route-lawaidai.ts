import type { ActorIdentity, PolicySnapshot } from "../../trust-spine/src/index.js";
import {
  createOperatorRoutePolicy,
  executeOperatorRoute,
} from "../src/index.js";
import {
  buildRealValuePrice,
  type EcosystemWalletProfile,
  type JurisdictionPolicy,
  type RailCapability,
  type ValueConversionRate,
} from "../../ecosystem-value/src/index.js";

const wallet: EcosystemWalletProfile = {
  walletId: "wallet_or_law_001",
  ownerId: "owner_or_law_001",
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
  merchantId: "merchant_or_law_001",
  realValueUnits: 10,
  displayCurrency: "USD",
  settlementCurrency: "USD",
  realValueToDisplayRate: 2,
  realValueToSettlementRate: 2,
});

const jurisdictionPolicy: JurisdictionPolicy = {
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

const complianceActor: ActorIdentity = {
  actorId: "compliance-operator",
  role: "operator",
  scope: ["compliance"],
  keyId: "compliance-key-001",
};

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

const complianceAttestPolicy: PolicySnapshot = {
  policyId: "compliance-attest-policy",
  version: "1.0.0",
  allowedArtifactTypes: ["ComplianceEligibilityAttestation"],
  allowedScopes: ["compliance"],
};

const complianceReleasePolicy: PolicySnapshot = {
  policyId: "compliance-release-policy",
  version: "1.0.0",
  allowedArtifactTypes: ["ComplianceReleaseArtifact"],
  allowedScopes: ["compliance"],
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

const result = executeOperatorRoute({
  routePolicy: createOperatorRoutePolicy({
    districtType: "LAWAIDAI",
    receivingEnvironment: "lawaidai-receiving-environment",
  }),
  routeInput: {
    wallet,
    price,
    jurisdictionPolicy,
    rails,
    rates,
    hasKyc: true,
    districtType: "LAWAIDAI",
    evidenceAnchorIds: ["ev_001", "ev_002"],
  },
  complianceActor,
  fundActor,
  receiveActor,
  complianceAttestPolicy,
  complianceReleasePolicy,
  bridgeTrustPolicy,
  activationTrustPolicy,
  receivingTrustPolicy,
});

if (!result.routed || result.decision !== "ROUTED") {
  throw new Error(`Expected ROUTED but received ${result.decision}`);
}

console.log("SMOKE_OPERATOR_ROUTE_LAWAIDAI=PASS");