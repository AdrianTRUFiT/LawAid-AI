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

if (snapshot.trustState !== "repaired") {
  throw new Error("Expected repaired trust state.");
}

if (!snapshot.canPropagate) {
  throw new Error("Expected repaired artifact to propagate.");
}

console.log("SMOKE_SHARED_TRUST_SPINE_REPAIR=PASS");