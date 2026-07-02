import {
  TrustSpineController,
  type ActorIdentity,
  type PolicySnapshot,
} from "../src/index.js";

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

if (created.receipt.decision !== "approved") {
  throw new Error("Expected approved authorization receipt.");
}

if (!snapshot.canPropagate) {
  throw new Error("Expected authorized artifact to propagate.");
}

console.log("SMOKE_SHARED_TRUST_SPINE_PASS=PASS");