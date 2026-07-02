import type { LwiHilEvaluation, LwiHilInput } from "./lwiHilContracts";
import { LWI_HIL_DOCTRINE } from "./lwiHilDoctrine";

export function evaluateLwiHil(input: LwiHilInput): LwiHilEvaluation {
  const refusalReasons: string[] = [];
  const requiredCorrections: string[] = [];

  if (!input.decisionId || input.decisionId.trim().length === 0) {
    refusalReasons.push("DECISION_ID_MISSING");
    requiredCorrections.push("Provide a decisionId before evaluation.");
  }

  if (!input.actionDescription || input.actionDescription.trim().length === 0) {
    refusalReasons.push("ACTION_DESCRIPTION_MISSING");
    requiredCorrections.push("Describe the action before execution.");
  }

  if (input.availableContext.length === 0) {
    refusalReasons.push("CONTEXT_MISSING");
    requiredCorrections.push("Gather available context before proceeding.");
  }

  if (input.authorityLayer === "UNKNOWN") {
    refusalReasons.push("AUTHORITY_LAYER_UNKNOWN");
    requiredCorrections.push("Identify the correct authority layer before action.");
  }

  if (!input.sourceTruthVerified) {
    refusalReasons.push("SOURCE_TRUTH_NOT_VERIFIED");
    requiredCorrections.push("Verify source truth before action, promotion, exposure, or execution.");
  }

  if (!input.humanControlPreserved) {
    refusalReasons.push("HUMAN_CONTROL_NOT_PRESERVED");
    requiredCorrections.push("Restore authorized human control before proceeding.");
  }

  if (input.architecturalDriftRisk === "HIGH") {
    refusalReasons.push("HIGH_ARCHITECTURAL_DRIFT_RISK");
    requiredCorrections.push("Reconcile architecture before proceeding.");
  }

  if (input.exposureRisk === "HIGH") {
    refusalReasons.push("HIGH_EXPOSURE_RISK");
    requiredCorrections.push("Reduce unnecessary exposure before proceeding.");
  }

  if (input.consequenceRisk === "HIGH") {
    refusalReasons.push("HIGH_CONSEQUENCE_RISK");
    requiredCorrections.push("Map consequences and authority before proceeding.");
  }

  const canProceed = refusalReasons.length === 0;

  return {
    decisionId: input.decisionId,
    status: canProceed ? "LWI_HIL_ACCEPTED" : "LWI_HIL_REQUIRES_HIGHER_CONTEXT",
    highestAvailableIntelligenceLayer: LWI_HIL_DOCTRINE.hil,
    canProceed,
    refusalReasons,
    requiredCorrections,
    governingLine: LWI_HIL_DOCTRINE.finalDoctrineLine,
    boundary: {
      lwiIsNotProduct: true,
      lwiIsNotUmbrella: true,
      lwiIsNotRateEngine: true,
      lwiIsNotDashboard: true,
      lwiIsNotAuthorityOverride: true,
      hilDoesNotOutrunAuthority: true,
      humanControlRequired: true
    }
  };
}
