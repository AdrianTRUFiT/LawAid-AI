export interface FailureRecord {
  failureId: string;
  sourceDomain: string;
  relatedArtifactId?: string;
  failureType: string;
  description: string;
  createdAt: string;
}

export interface AnalysisRecord {
  analysisId: string;
  failureId: string;
  findings: string[];
  likelyCause: string;
  recommendedAction: string;
  createdAt: string;
}

export type CorrectionType = "patch" | "rollback" | "reroute" | "guard_added";

export interface CorrectionRecord {
  correctionId: string;
  analysisId: string;
  changedFiles: string[];
  correctionType: CorrectionType;
  approvedBy?: string;
  createdAt: string;
}

export type TestedResult = "passed" | "failed" | "partial";

export interface TestedRecord {
  testedId: string;
  correctionId: string;
  verificationMethod: string[];
  result: TestedResult;
  recordedAt: string;
}

export interface Fact2Input {
  sourceDomain: string;
  failureType: string;
  description: string;
  relatedArtifactId?: string;
  changedFiles?: string[];
  verificationMethod?: string[];
}

export interface Fact2Result {
  failure: FailureRecord;
  analysis: AnalysisRecord;
  correction: CorrectionRecord;
  tested: TestedRecord;
}
