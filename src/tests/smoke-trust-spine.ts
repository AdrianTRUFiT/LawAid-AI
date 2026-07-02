import {
  TrustSpineController,
  type ActorIdentity,
  type PolicySnapshot,
} from "../lib/trust-spine";

const controller = new TrustSpineController();

const actor: ActorIdentity = {
  actorId: "operator-main",
  role: "operator",
  scope: ["financial", "legal"],
  keyId: "key-main-001",
};

const policy: PolicySnapshot = {
  policyId: "trust-policy",
  version: "1.0.0",
  allowedArtifactTypes: ["ActivatedTransactionState", "LiveSystemRecord"],
  allowedScopes: ["financial", "legal"],
};

const created = controller.createGovernedArtifact({
  actor,
  policy,
  request: {
    action: "emit",
    artifactType: "ActivatedTransactionState",
    scope: "financial",
    justification: "Verified transaction consequence.",
  },
  payload: {
    transactionId: "txn-001",
    amount: 5000,
    currency: "USD",
    state: "activated",
  },
});

const snapshot = controller.snapshot({
  envelope: created.envelope,
  authorizationApproved: created.receipt.decision === "approved",
});

console.log("TRUST_SPINE_PASS");
console.log(`AUTH_DECISION=${created.receipt.decision}`);
console.log(`TRUST_STATE=${snapshot.trustState}`);
console.log(`CAN_PROPAGATE=${snapshot.canPropagate}`);
console.log(`REGISTRY_VALID=${controller.getRegistry().verifyChain()}`);
