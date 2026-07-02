import type {
  RuntimeHilStateInput,
  RuntimeHilStateSummary,
  RuntimeHilStateTag
} from "./runtimeHilStateContracts";

function sortStrings(values: string[]): string[] {
  return [...values].sort((a, b) => a.localeCompare(b));
}

function uniqueTags(tags: RuntimeHilStateTag[]): RuntimeHilStateTag[] {
  return Array.from(new Set(tags)).sort((a, b) => a.localeCompare(b));
}

export function classifyRuntimeHilState(
  input: RuntimeHilStateInput,
  context?: {
    sourceAuditFile?: string;
    sourceDeltaFiles?: {
      leftFile?: string;
      rightFile?: string;
    };
  }
): RuntimeHilStateSummary {
  const degradedCount = (input.degradedIds ?? []).length;
  const overlapPairCount = (input.overlapPairKeys ?? []).length;
  const reasons = sortStrings(input.reasons ?? []);

  const hasUnresolvedContradiction =
    reasons.includes("CONTINUITY_BROKEN") ||
    reasons.includes("CONTINUITY_UNRESOLVED") ||
    input.continuityStatus === "BROKEN" ||
    input.continuityStatus === "UNRESOLVED";

  const tags: RuntimeHilStateTag[] = [];

  switch (input.runtimeClosureState) {
    case "CLEARED":
      tags.push("HIGHEST_VALID_CURRENT_STATE");
      if (input.deterministicReplayStable && !hasUnresolvedContradiction) {
        tags.push("CLOSURE_READY");
      }
      break;

    case "CONSTRAINED":
      if (input.deterministicReplayStable && input.supportStatus === "DEGRADED") {
        tags.push("HELD_STILL_INTELLIGENT");
      } else {
        tags.push("RECATEGORIZABLE");
      }

      if (!hasUnresolvedContradiction && input.deterministicReplayStable && degradedCount === 0 && overlapPairCount === 0) {
        tags.push("CLOSURE_READY");
      }
      break;

    case "HELD":
      if (input.deterministicReplayStable && !hasUnresolvedContradiction) {
        tags.push("HELD_STILL_INTELLIGENT");
      } else {
        tags.push("NON_PRODUCTIVE_RESIDUE");
      }

      if (degradedCount > 0 || overlapPairCount > 0) {
        tags.push("RECATEGORIZABLE");
      } else if (input.deterministicReplayStable) {
        tags.push("DORMANT_REUSABLE");
      }
      break;

    case "REFUSED":
      if (input.deterministicReplayStable) {
        tags.push("TRAPPED_DEPLETED");
      } else {
        tags.push("NON_PRODUCTIVE_RESIDUE");
      }
      break;
  }

  if (tags.length === 0) {
    tags.push("NON_PRODUCTIVE_RESIDUE");
  }

  return {
    artifactType: "runtime_hil_state_summary",
    generatedAt: new Date().toISOString(),
    sourceAuditFile: context?.sourceAuditFile,
    sourceDeltaFiles: context?.sourceDeltaFiles,
    runtimeClosureState: input.runtimeClosureState,
    deterministicReplayStable: input.deterministicReplayStable,
    emittedTags: uniqueTags(tags),
    evidence: {
      supportStatus: input.supportStatus,
      continuityStatus: input.continuityStatus,
      degradedCount,
      overlapPairCount,
      reasons
    }
  };
}
