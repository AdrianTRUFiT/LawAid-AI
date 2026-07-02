import {
  TrustSpineController,
  type ActorIdentity,
  type PolicySnapshot,
} from "../src/index.js";

const controller = new TrustSpineController();

const actor: ActorIdentity = {
  actorId: "operator-main",
  role: "operator",
  scope: ["financial"],
  keyId: "key-main-001",
};

const policy: PolicySnapshot = {
  policyId: "trust-policy",
  version: "1.0.0",
  allowedArtifactTypes: ["ActivatedTransactionState"],
  allowedScopes: ["financial"],
};

const created = controller.createGovernedArtifact({
  actor,
  policy,
  request: {
    action: "emit",
    artifactType: "ActivatedTransactionState",
    scope: "financial",
  },
  payload: {
    transactionId: "txn-002",
    amount: 1000,
    currency: "USD",
    state: "activated",
  },
});

const tampered = {
  ...created.envelope,
  payload: {
    ...created.envelope.payload,
    amount: 999999,
  },
};

const snapshot = controller.snapshot({
  envelope: tampered,
  authorizationApproved: created.receipt.decision === "approved",
});

if (!snapshot.isTampered) {
  throw new Error("Expected tampered payload to be detected.");
}

if (snapshot.canPropagate) {
  throw new Error("Expected tampered payload not to propagate.");
}

console.log("SMOKE_SHARED_TRUST_SPINE_TAMPER=PASS");