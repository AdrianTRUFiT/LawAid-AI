export type InputSourceClass =
  | "live"
  | "synthetic"
  | "historical"
  | "simulated"
  | "operator"
  | "external_feed";

export type TrustClass =
  | "production_trusted"
  | "conditionally_trusted"
  | "observational_only"
  | "synthetic_only"
  | "quarantined";

export type AdmissionStatus =
  | "ADMITTED"
  | "QUARANTINED"
  | "REFUSED";

export type DataShapeClass =
  | "movement"
  | "position"
  | "event"
  | "signal"
  | "generic";

export interface RawInputEnvelope {
  envelopeId: string;
  sourceId: string;
  sourceClass: InputSourceClass;
  dataShapeClass: DataShapeClass;
  payload: Record<string, unknown>;
  receivedAt: string;
  metadata?: Record<string, string>;
}

export interface SchemaConformanceResult {
  conforms: boolean;
  requiredKeys: string[];
  missingKeys: string[];
  unexpectedKeys: string[];
}

export interface NormalizedArtifact {
  envelopeId: string;
  sourceId: string;
  sourceClass: InputSourceClass;
  dataShapeClass: DataShapeClass;
  normalizedPayload: {
    subjectId: string;
    direction: "up" | "down" | "neutral" | "unknown";
    stateLabel: string;
    magnitude: number;
    ageBars: number;
    timestamp: string;
    attributes: Record<string, unknown>;
  };
}

export interface ValidationReport {
  valid: boolean;
  issues: string[];
  warnings: string[];
}

export interface TrustClassification {
  trustClass: TrustClass;
  productionEligible: boolean;
  weighting: number;
  reason: string;
}

export interface AdmissionDecision {
  status: AdmissionStatus;
  admitted: boolean;
  route: "mesh" | "quarantine" | "refused";
  reason: string;
}

export interface VerificationAdmissionsResult {
  rawInput: RawInputEnvelope;
  schemaConformance: SchemaConformanceResult;
  normalizedArtifact: NormalizedArtifact | null;
  validationReport: ValidationReport | null;
  trustClassification: TrustClassification | null;
  admissionDecision: AdmissionDecision;
}