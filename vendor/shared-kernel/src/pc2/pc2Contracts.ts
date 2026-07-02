export type PainSeverity = "low" | "moderate" | "high";

export interface PainRecord {
  painId: string;
  sourceDomain: string;
  description: string;
  severity: PainSeverity;
  createdAt: string;
}

export interface PatternRecord {
  patternId: string;
  painId: string;
  repeatedSignals: string[];
  inferredPattern: string;
  confidence: number;
  createdAt: string;
}

export type CodeIntentDecisionType =
  | "file_change"
  | "workflow_change"
  | "contract_change"
  | "ui_change"
  | "no_build";

export interface ClarityRecord {
  clarityId: string;
  patternId: string;
  clarifiedProblem: string;
  acceptedUnknowns: string[];
  nextDecisionType: CodeIntentDecisionType;
  createdAt: string;
}

export type CodeIntentActionType =
  | "create"
  | "update"
  | "split"
  | "refuse";

export interface CodeIntent {
  codeIntentId: string;
  clarityId: string;
  targetModule: string;
  targetFiles: string[];
  actionType: CodeIntentActionType;
  rationale: string;
  createdAt: string;
}

export interface Pc2Input {
  sourceDomain: string;
  description: string;
  repeatedSignals?: string[];
  targetModule: string;
  targetFiles?: string[];
}

export interface Pc2Result {
  pain: PainRecord;
  pattern: PatternRecord;
  clarity: ClarityRecord;
  codeIntent: CodeIntent;
}
