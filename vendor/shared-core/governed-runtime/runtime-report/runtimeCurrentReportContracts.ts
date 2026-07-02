export type RuntimeCurrentReport = {
  artifactType: "runtime_current_report";
  generatedAt: string;
  sourceAuditFile?: string;
  sourceDeltaFiles?: {
    leftFile?: string;
    rightFile?: string;
  };
  runtimeClosureState: string;
  deterministicReplayKey: string;
  deterministicReplayStable: boolean;
  degradedIds: string[];
  overlapPairKeys: string[];
  reasons: string[];
  changed: {
    runtimeClosureState: boolean;
    deterministicReplayKey: boolean;
    overlapPairs: boolean;
    degradedIds: boolean;
    reasons: boolean;
  };
  unchanged: {
    runtimeClosureState: boolean;
    deterministicReplayKey: boolean;
    overlapPairs: boolean;
    degradedIds: boolean;
    reasons: boolean;
  };
  hilStateTags: string[];
  evidence: {
    supportStatus?: string;
    continuityStatus?: string;
    degradedCount: number;
    overlapPairCount: number;
  };
};
