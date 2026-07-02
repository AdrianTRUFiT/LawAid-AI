import type { SettlementRecord } from "../../ecosystem-value/src/index.js";
import { activateTrustedSettlementForFundTracker } from "../src/index.js";

const fakeSettlement: SettlementRecord = {
  settlementId: "settlement_bad_001",
  walletId: "wallet_bad_001",
  ownerId: "owner_bad_001",
  merchantId: "merchant_bad_001",
  jurisdictionCode: "US",
  selectedRail: "internal_ledger",
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
  status: "settled",
  occurredAt: new Date().toISOString(),
};

const result = activateTrustedSettlementForFundTracker({
  wrapped: {
    trusted: false,
    decision: "REFUSED_UNAUTHORIZED",
    reason: "Not trusted.",
    settlementRecord: fakeSettlement,
    authorizationDecision: "refused",
    registryValid: false,
  },
  actor: {
    actorId: "fundtracker-operator",
    role: "operator",
    scope: ["financial"],
    keyId: "fundtracker-key-001",
  },
  trustPolicy: {
    policyId: "fundtracker-activation-policy",
    version: "1.0.0",
    allowedArtifactTypes: ["ActivatedTransactionState"],
    allowedScopes: ["financial"],
  },
});

if (result.activated || result.decision !== "REFUSED_UNAUTHORIZED") {
  throw new Error(`Expected REFUSED_UNAUTHORIZED but received ${result.decision}`);
}

console.log("SMOKE_FUNDTRACKER_BRIDGE_REFUSAL=PASS");
console.log(`ACTIVATION_DECISION=${result.decision}`);