export type TripwireSeam =
  | "PROCESSOR"
  | "FUNDTRACKER"
  | "PAI_SAFE"
  | "FINTECHIONAI_OVERSIGHT"
  | "SOULREGISTRY"
  | "PROJECTION_LEDGER"
  | "HUMAN_REVIEW"
  | "CONSEQUENCE_INTELLIGENCE"
  | "PREDICTIVE_FIREWALL";

export type TripwireSignalClass =
  | "FORECAST_ONLY"
  | "HASH_PRESSURE"
  | "AUTHORITY_CONFUSION"
  | "BOUNDARY_DOWNGRADE"
  | "PUBLIC_PRIVATE_LEAKAGE"
  | "REPLAY_PRESSURE"
  | "SYNTHETIC_AUTHORITY"
  | "TIME_WINDOW_DRIFT"
  | "PROOF_HEALTH_DEGRADATION"
  | "STATUS_MISMATCH";

export type TripwireSeverity =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export type TripwireRoute =
  | "CLEAR"
  | "WATCH"
  | "MACHINE_HOLD"
  | "HUMAN_REVIEW"
  | "CRITICAL_ESCALATION"
  | "INSTANT_REFUSE";

export type TripwireMeshStatus =
  | "TRIPWIRE_MESH_CLEAR"
  | "TRIPWIRE_MESH_WATCH"
  | "TRIPWIRE_MESH_PRE_BREACH_HOLD"
  | "TRIPWIRE_MESH_ESCALATED"
  | "TRIPWIRE_MESH_REFUSED";

export type TripwireRefusalCode =
  | "FORECAST_ONLY_CANNOT_REFUSE"
  | "ACTUAL_SIGNAL_REQUIRED_FOR_HOLD"
  | "SYNTHETIC_AUTHORITY_REFUSED"
  | "MULTI_SEAM_PRE_BREACH_DETECTED"
  | "TIME_WINDOW_EXPIRED"
  | "PROOF_HEALTH_DEGRADED"
  | "AUTHORITY_CONFUSION_DETECTED"
  | "BOUNDARY_DOWNGRADE_DETECTED"
  | "REPLAY_PRESSURE_DETECTED"
  | "PUBLIC_PRIVATE_LEAKAGE_DETECTED";

export interface TripwireSignal {
  signalId: string;
  transactionRef: string;
  seam: TripwireSeam;
  signalClass: TripwireSignalClass;
  severity: TripwireSeverity;
  observedAt: string;
  actualSignal: boolean;
  forecastOnly: boolean;
  evidenceRef: string;
  summary: string;
  boundary: {
    signalIsNotPaymentAuthority: true;
    signalIsNotTransactionTruth: true;
    signalIsNotCustodyTransfer: true;
    signalIsNotRuntimeActivation: true;
  };
}

export interface TripwireCorrelationCluster {
  clusterId: string;
  transactionRef: string;
  signalClass: TripwireSignalClass;
  seams: TripwireSeam[];
  signalIds: string[];
  actualSignalCount: number;
  forecastOnlyCount: number;
  highestSeverity: TripwireSeverity;
  firstObservedAt: string;
  lastObservedAt: string;
  preBreachLikely: boolean;
  boundary: {
    clusterIsNotEvidenceAlone: true;
    clusterRequiresActualSignalForHold: true;
    clusterDoesNotCreateAuthority: true;
  };
}

export interface TripwireMeshDecision {
  status: TripwireMeshStatus;
  route: TripwireRoute;
  transactionRef: string;
  evaluatedAt: string;
  clusters: TripwireCorrelationCluster[];
  refusalReasons: TripwireRefusalCode[];
  requiredCorrections: string[];
  explanation: string;
  boundary: {
    meshIsNotPaymentAuthority: true;
    meshIsNotTransactionTruth: true;
    meshIsNotCustodyTransfer: true;
    meshIsNotRuntimeActivation: true;
    forecastIsNotEvidence: true;
    predictionCannotRefuseTransactionAlone: true;
    fundTrackerAIRemainsTransactionTruth: true;
    consequenceIntelligenceRemainsPreConsequenceGate: true;
  };
}
