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
    liveRecordId: "live-002",
    caseId: "case-002",
    state: "active",
  },
});

const quarantined = controller.quarantine(
  created.envelope,
  "blocked",
  "Policy mismatch found during verification.",
);

const repaired = controller.repair({
  envelope: quarantined,
  reason: "Manual re-verification completed.",
  repairType: "reverify",
});

const snapshot = controller.snapshot({
  envelope: repaired.repairedEnvelope,
  authorizationApproved: created.receipt.decision === "approved",
});

console.log("TRUST_SPINE_REPAIR");
console.log(`TRUST_STATE=${snapshot.trustState}`);
console.log(`QUARANTINE_STATE=${snapshot.quarantineState}`);
console.log(`CAN_PROPAGATE=${snapshot.canPropagate}`);
console.log(`REGISTRY_VALID=${controller.getRegistry().verifyChain()}`);
