import {
  buildSurfaceValidationPacket,
  buildSurfaceValidationReadiness,
  buildTenUserReadOnlyTestScript,
  summarizeValidationSignals,
  SURFACE_VALIDATION_PACKET_DOCTRINE
} from "../surface-validation-packet";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

assert(SURFACE_VALIDATION_PACKET_DOCTRINE.boundary.validationOnly === true, "Doctrine locks validation only");
assert(SURFACE_VALIDATION_PACKET_DOCTRINE.boundary.notLaunch === true, "Doctrine locks not launch");
assert(SURFACE_VALIDATION_PACKET_DOCTRINE.boundary.noLiveRails === true, "Doctrine locks no live rails");
assert(SURFACE_VALIDATION_PACKET_DOCTRINE.boundary.noLegalAdvice === true, "Doctrine locks no legal advice");
assert(SURFACE_VALIDATION_PACKET_DOCTRINE.boundary.noProcessorWorkAuthorized === true, "Doctrine blocks processor work");
assert(SURFACE_VALIDATION_PACKET_DOCTRINE.boundary.phase2RequiresHumanDecision === true, "Doctrine requires human Phase 2 decision");

const packet = buildSurfaceValidationPacket();

assert(packet.status === "SURFACE_VALIDATION_PACKET_READY", "Surface validation packet ready");
assert(packet.userCountTarget === 10, "User count target is 10");
assert(packet.scope.readOnlyDemo === true, "Packet is read-only demo");
assert(packet.scope.noLiveRails === true, "Packet uses no live rails");
assert(packet.scope.noLegalAdvice === true, "Packet is not legal advice");
assert(packet.scope.noInternalStackExposure === true, "Packet exposes no internal stack");
assert(packet.phase2Gate.processorSelectionBlocked === true, "Processor selection blocked");
assert(packet.phase2Gate.merchantAccountBlocked === true, "Merchant account blocked");
assert(packet.phase2Gate.pciScopeBlocked === true, "PCI scope blocked");
assert(packet.phase2Gate.phase2RequiresHumanDecision === true, "Phase 2 requires human decision");
assert(packet.boundary.packetDoesNotAuthorizeProcessorWork === true, "Packet does not authorize processor work");

const script = buildTenUserReadOnlyTestScript();

assert(script.boundary.scriptIsReadOnly === true, "Script is read-only");
assert(script.boundary.scriptIsNotLegalAdvice === true, "Script is not legal advice");
assert(script.boundary.scriptUsesNoLiveRails === true, "Script uses no live rails");
assert(script.boundary.scriptCreatesNoAuthority === true, "Script creates no authority");
assert(script.questions.length >= 8, "Script includes validation questions");
assert(script.prohibitedClaims.includes("This processes your payment."), "Script blocks payment-processing claim");
assert(script.prohibitedClaims.includes("This gives legal advice."), "Script blocks legal-advice claim");

const readiness = buildSurfaceValidationReadiness();

assert(readiness.status === "SURFACE_VALIDATION_PACKET_READY", "Surface validation readiness ready");
assert(readiness.boundary.readinessCreatesNoLaunch === true, "Readiness creates no launch");
assert(readiness.boundary.readinessCreatesNoProcessorAuthorization === true, "Readiness creates no processor authorization");
assert(readiness.boundary.readinessCreatesNoPaymentAuthority === true, "Readiness creates no payment authority");
assert(readiness.boundary.readinessCreatesNoRuntimeActivation === true, "Readiness creates no runtime activation");

const strongSignals = Array.from({ length: 10 }).map((_, index) => ({
  userId: `user_${index + 1}`,
  completedWorkflow: true,
  completionSignal: "completed_without_help" as const,
  trustSignal: index < 8 ? "trusted" as const : "somewhat_trusted" as const,
  neededFounderExplanation: false,
  timeToCompleteBand: "3_to_7_min" as const,
  valueUnderstood: true
}));

const strongSummary = summarizeValidationSignals(strongSignals);

assert(strongSummary.totalUsers === 10, "Strong summary has 10 users");
assert(strongSummary.completedWithoutHelp === 10, "Strong summary completed without help");
assert(strongSummary.recommendedPhase2Decision === "expand_to_paid_beta", "Strong signal recommends paid beta");
assert(strongSummary.boundary.summaryDoesNotAuthorizeLaunch === true, "Summary does not authorize launch");
assert(strongSummary.boundary.summaryDoesNotAuthorizeProcessorWork === true, "Summary does not authorize processor work");
assert(strongSummary.boundary.humanDecisionStillRequired === true, "Human decision still required");

const weakSignals = Array.from({ length: 10 }).map((_, index) => ({
  userId: `weak_user_${index + 1}`,
  completedWorkflow: index < 3,
  completionSignal: index < 3 ? "completed_with_major_confusion" as const : "blocked_by_flow" as const,
  trustSignal: "unclear" as const,
  neededFounderExplanation: true,
  timeToCompleteBand: index < 3 ? "over_15_min" as const : "not_completed" as const,
  valueUnderstood: false
}));

const weakSummary = summarizeValidationSignals(weakSignals);

assert(weakSummary.recommendedPhase2Decision === "repair_surface_and_retest", "Weak signal recommends surface repair");
assert(weakSummary.abandonedOrBlocked >= 7, "Weak summary detects blocked users");
assert(weakSummary.boundary.humanDecisionStillRequired === true, "Weak summary still requires human decision");

console.log("");
console.log("SURFACE_VALIDATION_PACKET_SMOKE=PASS");
