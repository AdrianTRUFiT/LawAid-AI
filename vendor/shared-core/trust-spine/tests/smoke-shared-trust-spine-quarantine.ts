import {
  TrustSpineController,
  type ActorIdentity,
  type PolicySnapshot,
} from "../src/index.js";

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

if (snapshot.canPropagate) {
  throw new Error("Expected quarantined artifact not to propagate.");
}

console.log("SMOKE_SHARED_TRUST_SPINE_QUARANTINE=PASS");