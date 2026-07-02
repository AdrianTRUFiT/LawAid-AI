export type AdmissionIntakeState =
  | "ADMISSION_READABLE"
  | "ADMISSION_UNREADABLE"
  | "ADMISSION_NORMALIZED"
  | "ADMISSION_DIVERGENCE_DETECTED";

export type GovernanceAdmissionResult =
  | "GOVERNANCE_ADMIT"
  | "GOVERNANCE_HOLD_UNREADABLE"
  | "GOVERNANCE_HOLD_DIVERGENCE"
  | "GOVERNANCE_PENDING_RECOVERY";

export type GovernanceAdmissionInput = {
  intakeId: string;
  admissionStates: AdmissionIntakeState[];
  normalizationComplete: boolean;
  originalPreserved: boolean;
  normalizedRepresentationLinked: boolean;
  fingerprint: string;
  sourcePath?: string;
  createdAt: string;
};

export type GovernanceAdmissionDecision = {
  intakeId: string;
  governanceResult: GovernanceAdmissionResult;
  reportable: boolean;
  unresolved: boolean;
  recoveryRequired: boolean;
  reasonCodes: string[];
  nextQueue:
    | "normal_admission_flow"
    | "bounded_governance_review"
    | "bounded_pending_recovery";
  createdAt: string;
};

export type GovernanceAdmissionPendingRecord = {
  pendingId: string;
  intakeId: string;
  governanceResult: GovernanceAdmissionResult;
  reasonCodes: string[];
  status: "pending";
  queue: "bounded_pending_recovery" | "bounded_governance_review";
  createdAt: string;
};
