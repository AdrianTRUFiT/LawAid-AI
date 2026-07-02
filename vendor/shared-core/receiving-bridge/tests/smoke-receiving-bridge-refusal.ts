import type { ActivatedTransactionStateRecord } from "../../fundtracker-bridge/src/index.js";
import { receiveTrustedActivation } from "../src/index.js";

const fakeActivation: ActivatedTransactionStateRecord = {
  activationId: "ats_bad_001",
  sourceSettlementId: "settlement_bad_001",
  walletId: "wallet_bad_001",
  ownerId: "owner_bad_001",
  merchantId: "merchant_bad_001",
  jurisdictionCode: "US",
  settlementCurrency: "USD",
  settlementAmount: 10,
  displayCurrency: "USD",
  displayAmount: 10,
  realValueUnits: 10,
  fundingChoices: [],
  complianceSnapshot: {
    jurisdictionCode: "US",
    merchantId: "merchant_bad_001",
    trustTier: "trusted",
    kycSatisfied: true,
    policySatisfied: true,
    acceptedValueKinds: ["fiat_balance"],
    allowedRails: ["internal_ledger"],
    status: "compliant",
    notes: [],
    createdAt: new Date().toISOString(),
  },
  activationStatus: "activated",
  occurredAt: new Date().toISOString(),
};

const result = receiveTrustedActivation({
  wrapped: {
    trusted: false,
    decision: "REFUSED_UNAUTHORIZED",
    reason: "Activation not trusted.",
    activationRecord: fakeActivation,
    authorizationDecision: "refused",
    registryValid: false,
  },
  actor: {
    actorId: "receiving-operator",
    role: "operator",
    scope: ["receiving"],
    keyId: "receiving-key-001",
  },
  trustPolicy: {
    policyId: "receiving-policy",
    version: "1.0.0",
    allowedArtifactTypes: ["LiveSystemRecord"],
    allowedScopes: ["receiving"],
  },
});

if (result.received || result.decision !== "REFUSED_UNAUTHORIZED") {
  throw new Error(`Expected REFUSED_UNAUTHORIZED but got ${result.decision}`);
}

console.log("SMOKE_RECEIVING_BRIDGE_REFUSAL=PASS");
console.log(`RECEIVING_DECISION=${result.decision}`);