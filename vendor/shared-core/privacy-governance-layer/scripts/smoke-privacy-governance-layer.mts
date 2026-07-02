import {
  LAWFUL_BASIS,
  createIdentityRef,
  createConsentRecord,
  verifyPrivacyPermission,
  requestErasure,
  minimizeSignalPayload
} from "../src/privacyGovernanceLayer.mjs";

const identity = createIdentityRef({
  username: "reddit_user_mock",
  email: "mock@example.com"
});

if (!identity.accepted) {
  console.error("IDENTITY FAILED", identity);
  process.exit(1);
}

const consent = createConsentRecord({
  identityRef: identity.identityId,
  lawfulBasis: LAWFUL_BASIS.CONSENT,
  scopes: ["lead_processing", "merchant_activation"]
});

if (!consent.accepted) {
  console.error("CONSENT FAILED", consent);
  process.exit(1);
}

const permission = verifyPrivacyPermission({
  identityRef: identity.identityId,
  lawfulBasis: LAWFUL_BASIS.CONSENT,
  requiredScope: "lead_processing"
});

if (!permission.accepted) {
  console.error("PERMISSION FAILED", permission);
  process.exit(1);
}

const minimized = minimizeSignalPayload({
  source: "Reddit",
  sourceId: "mock-thread-001",
  username: "should_not_carry_forward",
  email: "should_not_carry_forward@example.com",
  content: "Stripe chargeback destroyed my weekend camp revenue.",
  detectedNeed: "merchant needs proof-backed payment protection",
  painCategory: "chargeback anxiety",
  urgency: "high",
  decisionReadinessScore: 87,
  recommendedAIOPPath: "TPS / PBP merchant readiness",
  lawfulBasis: LAWFUL_BASIS.CONSENT,
  identityRef: identity.identityId
});

if (minimized.username || minimized.email) {
  console.error("MINIMIZATION FAILED", minimized);
  process.exit(1);
}

const erasure = requestErasure(identity.identityId);

if (!erasure.accepted) {
  console.error("ERASURE FAILED", erasure);
  process.exit(1);
}

const blocked = verifyPrivacyPermission({
  identityRef: identity.identityId,
  lawfulBasis: LAWFUL_BASIS.CONSENT,
  requiredScope: "lead_processing"
});

if (blocked.accepted) {
  console.error("ERASURE SHOULD BLOCK PROCESSING", blocked);
  process.exit(1);
}

console.log("PRIVACY GOVERNANCE LAYER PASS");
console.log("Identity:", identity.identityId);
console.log("Consent:", consent.consentId);
console.log("Permission:", permission.privacyState);
console.log("Minimized carries identityRef:", minimized.identityRef);
console.log("Erasure:", erasure.status);
console.log("Post-erasure refusal:", blocked.refusalType);
