import {
  TrustSpineController,
  type ActorIdentity,
  type PolicySnapshot,
} from "../lib/trust-spine";

const controller = new TrustSpineController();

const actor: ActorIdentity = {
  actorId: "operator-main",
  role: "operator",
  scope: ["legal"],
  keyId: "key-main-001",
};

const policy: PolicySnapshot = {
  policyId: "trust-policy",
  version: "1.0.0",
  allowedArtifactTypes: ["LiveSystemRecord"],
  allowedScopes: ["legal"],
};

const created = controller.createGovernedArtifact({
  actor,
  policy,
  request: {
    action: "emit",
    artifactType: "LiveSystemRecord",
    scope: "legal",
  },
  payload: {
    liveRecordId: "live-001",
    caseId: "case-001",
    state: "active",
  },
});

const quarantined = controller.quarantine(
  created.envelope,
  "quarantined",
  "Contradictory downstream state detected.",
);

const snapshot = controller.snapshot({
  envelope: quarantined,
  authorizationApproved: created.receipt.decision === "approved",
});

console.log("TRUST_SPINE_QUARANTINE");
console.log(`QUARANTINE_STATE=${snapshot.quarantineState}`);
console.log(`CAN_PROPAGATE=${snapshot.canPropagate}`);
console.log(`REGISTRY_VALID=${controller.getRegistry().verifyChain()}`);
