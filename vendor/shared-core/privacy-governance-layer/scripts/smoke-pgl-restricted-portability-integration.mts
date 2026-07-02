import {
  LAWFUL_BASIS,
  RESTRICTION_REASONS,
  createIdentityRef,
  createConsentRecord,
  restrictProcessing,
  liftRestriction,
  exportPortabilityPacket,
  requestErasure
} from "../src/privacyGovernanceLayer.mjs";

import { createPrivacyGovernedCapturedSignal } from "file:///D:/DEV/AIVA/RATES/DICE/src/privacy/dicePrivacyGovernedCapture.mjs";
import { persistCapturedSignal } from "file:///D:/DEV/AIVA/RATES/DICE/src/persistence/capturedSignalPersistence.mjs";
import { approveCapturedSignal } from "file:///D:/DEV/AIVA/RATES/DICE/src/approval/capturedSignalApprovalGate.mjs";
import { privacyGovernedAIOPIntake } from "file:///D:/DEV/AIVA/RATES/AIOP/src/privacy/aiopPrivacyGovernedIntake.mjs";

const identity = createIdentityRef({ username: "eu_user_mock", email: "eu@example.com" });
const consent = createConsentRecord({
  identityRef: identity.identityId,
  lawfulBasis: LAWFUL_BASIS.CONSENT,
  scopes: ["lead_processing", "merchant_activation"]
});

if (!identity.accepted || !consent.accepted) {
  console.error("PGL SETUP FAILED", { identity, consent });
  process.exit(1);
}

const restriction = restrictProcessing({
  identityRef: identity.identityId,
  restrictionReason: RESTRICTION_REASONS.COMPLIANCE_REVIEW,
  restrictionTrigger: "EU_PRIVACY_REVIEW",
  restrictedBy: "PGL_SMOKE_TEST",
  exitCondition: "COMPLIANCE_REVIEW_CLEARED",
  exitAuthority: "PRIVACY_AUTHORITY",
  reviewDueAt: new Date(Date.now() + 86400000).toISOString()
});

if (!restriction.accepted) {
  console.error("RESTRICTION FAILED", restriction);
  process.exit(1);
}

const blockedDice = createPrivacyGovernedCapturedSignal({
  source: "Reddit",
  sourceId: `restricted_${Date.now()}`,
  content: "Stripe chargeback wiped out my weekend camp revenue.",
  detectedNeed: "merchant needs proof-backed payment protection",
  painCategory: "chargeback anxiety",
  urgency: "high",
  decisionReadinessScore: 87,
  recommendedAIOPPath: "TPS / PBP merchant readiness",
  lawfulBasis: LAWFUL_BASIS.CONSENT,
  identityRef: identity.identityId
});

if (blockedDice.accepted !== false || blockedDice.refusalType !== "PROCESSING_RESTRICTED") {
  console.error("RESTRICTED DICE BLOCK FAILED", blockedDice);
  process.exit(1);
}

const portability = exportPortabilityPacket(identity.identityId);
if (!portability.accepted) {
  console.error("PORTABILITY FAILED", portability);
  process.exit(1);
}

const lifted = liftRestriction(identity.identityId);
if (!lifted.accepted) {
  console.error("LIFT FAILED", lifted);
  process.exit(1);
}

process.chdir("D:/DEV/AIVA/RATES/DICE");

const signal = createPrivacyGovernedCapturedSignal({
  source: "Reddit",
  sourceId: `permitted_${Date.now()}`,
  content: "Square is holding my money and payroll is due tomorrow.",
  detectedNeed: "merchant needs immediate payment access and proof-backed transaction review",
  painCategory: "held funds / processor frustration",
  urgency: "immediate",
  decisionReadinessScore: 91,
  recommendedIntervention: "Offer TPS/PBP readiness path.",
  recommendedAIOPPath: "TPS / PBP merchant readiness",
  lawfulBasis: LAWFUL_BASIS.CONSENT,
  identityRef: identity.identityId
});

if (!signal.accepted) {
  console.error("PERMITTED DICE CREATE FAILED", signal);
  process.exit(1);
}

const persisted = persistCapturedSignal(signal.artifact);
const approval = approveCapturedSignal(signal.artifact.artifactId, "ADRIAN_AUTHORIZED_REVIEW");

if (!persisted.accepted || !approval.accepted) {
  console.error("DICE PERSIST/APPROVAL FAILED", { persisted, approval });
  process.exit(1);
}

process.chdir("D:/DEV/AIVA/RATES/AIOP");

const aiop = privacyGovernedAIOPIntake(signal.artifact.artifactId, {
  identityRef: identity.identityId,
  lawfulBasis: LAWFUL_BASIS.CONSENT,
  requiredScope: "merchant_activation"
}, {
  expectedClassification: "TPS_MERCHANT_READINESS"
});

if (!aiop.accepted) {
  console.error("AIOP PRIVACY INTAKE FAILED", aiop);
  process.exit(1);
}

const erased = requestErasure(identity.identityId);
const blockedAiop = privacyGovernedAIOPIntake(signal.artifact.artifactId, {
  identityRef: identity.identityId,
  lawfulBasis: LAWFUL_BASIS.CONSENT,
  requiredScope: "merchant_activation"
});

if (!erased.accepted || blockedAiop.accepted !== false || blockedAiop.refusalType !== "ERASURE_REQUEST_ACTIVE") {
  console.error("ERASURE AIOP BLOCK FAILED", { erased, blockedAiop });
  process.exit(1);
}

console.log("PGL RESTRICTED PORTABILITY REFUSAL INTEGRATION PASS");
console.log("Identity:", identity.identityId);
console.log("Restriction:", restriction.privacyStatus, restriction.restrictionReason);
console.log("Restricted DICE refusal:", blockedDice.refusalType);
console.log("Portability packet:", portability.packetId);
console.log("AIOP Verified Opportunity:", aiop.artifactId);
console.log("Post-erasure AIOP refusal:", blockedAiop.refusalType);
