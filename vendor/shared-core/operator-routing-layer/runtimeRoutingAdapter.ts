import type { RoutingRuntimeContext } from "./routingRuntimeContextContracts";

function sortStrings(values: string[]): string[] {
  return [...values].sort((a, b) => a.localeCompare(b));
}

export function buildRoutingRuntimeContext(input: {
  sourceRuntimeReportFile?: string;
  runtimeClosureState: string;
  deterministicReplayStable: boolean;
  hilStateTags?: string[];
  degradedIds?: string[];
  overlapPairKeys?: string[];
  reasons?: string[];
}): RoutingRuntimeContext {
  return {
    artifactType: "ROUTING_RUNTIME_CONTEXT",
    generatedAt: new Date().toISOString(),
    sourceRuntimeReportFile: input.sourceRuntimeReportFile,
    runtimeClosureState: input.runtimeClosureState,
    deterministicReplayStable: input.deterministicReplayStable,
    hilStateTags: sortStrings(input.hilStateTags ?? []),
    degradedSupportCount: (input.degradedIds ?? []).length,
    overlapPairCount: (input.overlapPairKeys ?? []).length,
    reasons: sortStrings(input.reasons ?? [])
  };
}
