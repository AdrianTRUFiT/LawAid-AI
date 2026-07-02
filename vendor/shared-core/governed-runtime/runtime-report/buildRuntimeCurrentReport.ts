import type { RuntimeCurrentReport } from "./runtimeCurrentReportContracts";

function sortStrings(values: string[]): string[] {
  return [...values].sort((a, b) => a.localeCompare(b));
}

export function buildRuntimeCurrentReport(input: {
  normalized: {
    sourceAuditFile?: string;
    latest: {
      runtimeClosureState: string;
      deterministicReplayKey: string;
      degradedIds?: string[];
      overlapPairKeys?: string[];
      reasons?: string[];
    };
  };
  delta: {
    leftFile?: string;
    rightFile?: string;
    changed?: {
      runtimeClosureState?: boolean;
      deterministicReplayKey?: boolean;
      overlapPairs?: boolean;
      degradedIds?: boolean;
      reasons?: boolean;
    };
    unchanged?: {
      runtimeClosureState?: boolean;
      deterministicReplayKey?: boolean;
      overlapPairs?: boolean;
      degradedIds?: boolean;
      reasons?: boolean;
    };
  };
  hil: {
    emittedTags?: string[];
    evidence?: {
      supportStatus?: string;
      continuityStatus?: string;
      degradedCount?: number;
      overlapPairCount?: number;
    };
  };
}): RuntimeCurrentReport {
  const latest = input.normalized.latest;
  const delta = input.delta;
  const hil = input.hil;

  return {
    artifactType: "runtime_current_report",
    generatedAt: new Date().toISOString(),
    sourceAuditFile: input.normalized.sourceAuditFile,
    sourceDeltaFiles: {
      leftFile: delta.leftFile,
      rightFile: delta.rightFile
    },
    runtimeClosureState: latest.runtimeClosureState,
    deterministicReplayKey: latest.deterministicReplayKey,
    deterministicReplayStable: !!delta.unchanged?.deterministicReplayKey,
    degradedIds: sortStrings(latest.degradedIds ?? []),
    overlapPairKeys: sortStrings(latest.overlapPairKeys ?? []),
    reasons: sortStrings(latest.reasons ?? []),
    changed: {
      runtimeClosureState: !!delta.changed?.runtimeClosureState,
      deterministicReplayKey: !!delta.changed?.deterministicReplayKey,
      overlapPairs: !!delta.changed?.overlapPairs,
      degradedIds: !!delta.changed?.degradedIds,
      reasons: !!delta.changed?.reasons
    },
    unchanged: {
      runtimeClosureState: !!delta.unchanged?.runtimeClosureState,
      deterministicReplayKey: !!delta.unchanged?.deterministicReplayKey,
      overlapPairs: !!delta.unchanged?.overlapPairs,
      degradedIds: !!delta.unchanged?.degradedIds,
      reasons: !!delta.unchanged?.reasons
    },
    hilStateTags: sortStrings(hil.emittedTags ?? []),
    evidence: {
      supportStatus: hil.evidence?.supportStatus,
      continuityStatus: hil.evidence?.continuityStatus,
      degradedCount: hil.evidence?.degradedCount ?? (latest.degradedIds ?? []).length,
      overlapPairCount: hil.evidence?.overlapPairCount ?? (latest.overlapPairKeys ?? []).length
    }
  };
}
