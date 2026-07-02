export type RuntimeClosureState =
  | "CLEARED"
  | "CONSTRAINED"
  | "HELD"
  | "REFUSED";

export type RuntimeHilStateTag =
  | "HIGHEST_VALID_CURRENT_STATE"
  | "HELD_STILL_INTELLIGENT"
  | "DORMANT_REUSABLE"
  | "TRAPPED_DEPLETED"
  | "RECATEGORIZABLE"
  | "CLOSURE_READY"
  | "NON_PRODUCTIVE_RESIDUE";

export type RuntimeHilStateInput = {
  runtimeClosureState: RuntimeClosureState;
  deterministicReplayStable: boolean;
  supportStatus?: string;
  continuityStatus?: string;
  degradedIds?: string[];
  overlapPairKeys?: string[];
  reasons?: string[];
};

export type RuntimeHilStateSummary = {
  artifactType: "runtime_hil_state_summary";
  generatedAt: string;
  sourceAuditFile?: string;
  sourceDeltaFiles?: {
    leftFile?: string;
    rightFile?: string;
  };
  runtimeClosureState: RuntimeClosureState;
  deterministicReplayStable: boolean;
  emittedTags: RuntimeHilStateTag[];
  evidence: {
    supportStatus?: string;
    continuityStatus?: string;
    degradedCount: number;
    overlapPairCount: number;
    reasons: string[];
  };
};
