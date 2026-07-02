export type AimProductBrand = "AIM â€” AI MarketIntel";
export type AimInternalDoctrine = "Awareness + Infrastructure Mapping";

export type AimInfrastructureLayer =
  | "Compute"
  | "Memory / HBM"
  | "Networking / Optical"
  | "Power / Grid"
  | "Cooling / Thermal"
  | "Fabrication / Equipment"
  | "Sovereign / Defense"
  | "Quantum / Frontier Compute"
  | "Data / Licensing"
  | "Land / Permitting"
  | "Advanced Packaging";

export type AimBottleneckPhase =
  | "Dormant"
  | "Watch"
  | "Tightening"
  | "Confirmed Bottleneck"
  | "Momentum Expansion"
  | "Exhaustion Risk"
  | "Oversupply Risk"
  | "Thesis Broken"
  | "Narrative Only â€” Not Confirmed";

export type AimEvidenceLabel =
  | "Confirmed public filing"
  | "Company announcement"
  | "Reputable reporting"
  | "Industry inference"
  | "Speculation"
  | "Rumor / Ignore";

export type AimChokepointControlSignalType =
  | "supplier acquisition"
  | "long-term supply agreement"
  | "exclusive partnership"
  | "power purchase agreement"
  | "compute reservation"
  | "HBM allocation"
  | "foundry reservation"
  | "advanced packaging allocation"
  | "data licensing deal"
  | "sovereign cloud contract"
  | "fiber route control"
  | "energy infrastructure control"
  | "rare earth / metals offtake"
  | "strategic investment"
  | "talent acquisition";

export type AimStrategicDenialEffect =
  | "None"
  | "Low"
  | "Moderate"
  | "High"
  | "Critical";

export type AimPaiSafeReadinessState =
  | "Review Ready"
  | "Hold For Confirmation"
  | "Insufficient Evidence"
  | "Contradiction Detected";

export interface AimBottleneckSignalSet {
  leadTimesExpanding: boolean;
  pricingPowerIncreasing: boolean;
  capacityExpansionAnnounced: boolean;
  longTermAgreementsOrBacklogConfirmed: boolean;
}

export interface AimPressureSignal {
  signalId: string;
  observedAt: string;
  signalObserved: string;
  infrastructureLayer: AimInfrastructureLayer;
  dependencyMapped: string;
  evidenceLabel: AimEvidenceLabel;
  bottleneckSignals: AimBottleneckSignalSet;
  chokepointSignalType: AimChokepointControlSignalType;
  strategicDenialEffect: AimStrategicDenialEffect;
  thesisNote: string;
  contradictionNote?: string;
}

export interface AimDoctrineContract {
  productBrand: AimProductBrand;
  internalDoctrine: AimInternalDoctrine;
  publicPositioningLine: "AIM helps structure directional clarity before capital, resources, or action moves.";
  doctrineLine: "AIM detects pressure and maps dependency before PAI-SAFE tests readiness.";
  coreLoop: ["Pressure", "Dependency", "Readiness", "Consequence", "Review", "Adaptation"];
  legalBoundary: string;
  prohibitedBehaviors: string[];
}

export interface AimDependencyMap {
  signalId: string;
  infrastructureLayer: AimInfrastructureLayer;
  dependencyMapped: string;
  pressureDetected: boolean;
  mappedAt: string;
}

export interface AimEvidenceClassification {
  label: AimEvidenceLabel;
  verifiedTruth: boolean;
  reviewEligible: boolean;
  note: string;
}

export interface AimBottleneckClassification {
  phase: AimBottleneckPhase;
  tighteningSignalCount: number;
  ruleApplied: "2-of-4 tightening rule";
}

export interface AimChokepointClassification {
  signalType: AimChokepointControlSignalType;
  descriptiveOnly: true;
}

export interface AimPaiSafeReadinessHandoffPacket {
  source: "AIM";
  destination: "PAI-SAFE";
  readinessState: AimPaiSafeReadinessState;
  infrastructureLayer: AimInfrastructureLayer;
  dependencyMapped: string;
  evidenceLabel: AimEvidenceLabel;
  bottleneckPhase: AimBottleneckPhase;
  humanReviewRequired: boolean;
  note: string;
}

export interface AimJournalReadyDecisionRecord {
  dateTime: string;
  signalObserved: string;
  infrastructureLayer: AimInfrastructureLayer;
  dependencyMapped: string;
  evidenceStatus: AimEvidenceLabel;
  bottleneckPhase: AimBottleneckPhase;
  chokepointSignalType: AimChokepointControlSignalType;
  strategicDenialEffect: AimStrategicDenialEffect;
  paiSafeReadinessStatus: AimPaiSafeReadinessState;
  thesisNote: string;
  contradictionNote: string;
  humanReviewRequired: boolean;
  finalAction: "";
}

export interface AimOutputPacket {
  productBrand: AimProductBrand;
  internalDoctrine: AimInternalDoctrine;
  pressureSignal: AimPressureSignal;
  dependencyMap: AimDependencyMap;
  evidenceClassification: AimEvidenceClassification;
  bottleneckClassification: AimBottleneckClassification;
  chokepointClassification: AimChokepointClassification;
  paiSafeReadinessHandoff: AimPaiSafeReadinessHandoffPacket;
  journalReadyDecisionRecord: AimJournalReadyDecisionRecord;
  humanFinalAuthority: true;
  tradeRecommendation: null;
  executionAction: null;
}