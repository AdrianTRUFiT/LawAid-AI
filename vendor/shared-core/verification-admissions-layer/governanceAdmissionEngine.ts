import type {
  AdmissionIntakeState,
  GovernanceAdmissionDecision,
  GovernanceAdmissionInput
} from "./governanceAdmissionContracts";

function hasState(states: AdmissionIntakeState[], state: AdmissionIntakeState): boolean {
  return states.includes(state);
}

export function evaluateGovernanceAdmission(
  input: GovernanceAdmissionInput
): GovernanceAdmissionDecision {
  const reasons: string[] = [];

  const unreadable = hasState(input.admissionStates, "ADMISSION_UNREADABLE");
  const divergence = hasState(input.admissionStates, "ADMISSION_DIVERGENCE_DETECTED");
  const normalized = hasState(input.admissionStates, "ADMISSION_NORMALIZED");
  const readable = hasState(input.admissionStates, "ADMISSION_READABLE");

  if (!input.originalPreserved) {
    reasons.push("ORIGINAL_NOT_PRESERVED");
  }

  if (unreadable) {
    reasons.push("UNREADABLE_INTAKE");
    return {
      intakeId: input.intakeId,
      governanceResult: "GOVERNANCE_PENDING_RECOVERY",
      reportable: true,
      unresolved: true,
      recoveryRequired: true,
      reasonCodes: reasons,
      nextQueue: "bounded_pending_recovery",
      createdAt: new Date().toISOString()
    };
  }

  if (divergence) {
    reasons.push("DIVERGENCE_DETECTED");
    return {
      intakeId: input.intakeId,
      governanceResult: "GOVERNANCE_HOLD_DIVERGENCE",
      reportable: true,
      unresolved: true,
      recoveryRequired: false,
      reasonCodes: reasons,
      nextQueue: "bounded_governance_review",
      createdAt: new Date().toISOString()
    };
  }

  if (normalized && !input.normalizationComplete) {
    reasons.push("PARTIAL_NORMALIZATION_UNRESOLVED");
    return {
      intakeId: input.intakeId,
      governanceResult: "GOVERNANCE_PENDING_RECOVERY",
      reportable: true,
      unresolved: true,
      recoveryRequired: true,
      reasonCodes: reasons,
      nextQueue: "bounded_pending_recovery",
      createdAt: new Date().toISOString()
    };
  }

  if (normalized && !input.normalizedRepresentationLinked) {
    reasons.push("NORMALIZED_LINK_MISSING");
    return {
      intakeId: input.intakeId,
      governanceResult: "GOVERNANCE_PENDING_RECOVERY",
      reportable: true,
      unresolved: true,
      recoveryRequired: true,
      reasonCodes: reasons,
      nextQueue: "bounded_pending_recovery",
      createdAt: new Date().toISOString()
    };
  }

  if (readable && normalized && input.normalizationComplete && input.normalizedRepresentationLinked) {
    reasons.push("READABLE_NORMALIZED_ELIGIBLE");
    return {
      intakeId: input.intakeId,
      governanceResult: "GOVERNANCE_ADMIT",
      reportable: true,
      unresolved: false,
      recoveryRequired: false,
      reasonCodes: reasons,
      nextQueue: "normal_admission_flow",
      createdAt: new Date().toISOString()
    };
  }

  if (readable) {
    reasons.push("READABLE_UNRESOLVED");
    return {
      intakeId: input.intakeId,
      governanceResult: "GOVERNANCE_HOLD_UNREADABLE",
      reportable: true,
      unresolved: true,
      recoveryRequired: false,
      reasonCodes: reasons,
      nextQueue: "bounded_governance_review",
      createdAt: new Date().toISOString()
    };
  }

  reasons.push("UNCLASSIFIED_INTAKE");
  return {
    intakeId: input.intakeId,
    governanceResult: "GOVERNANCE_PENDING_RECOVERY",
    reportable: true,
    unresolved: true,
    recoveryRequired: true,
    reasonCodes: reasons,
    nextQueue: "bounded_pending_recovery",
    createdAt: new Date().toISOString()
  };
}
