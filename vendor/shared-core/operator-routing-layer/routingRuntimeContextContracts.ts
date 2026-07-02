export type RoutingRuntimeContext = {
  artifactType: "ROUTING_RUNTIME_CONTEXT";
  generatedAt: string;
  sourceRuntimeReportFile?: string;
  runtimeClosureState: string;
  deterministicReplayStable: boolean;
  hilStateTags: string[];
  degradedSupportCount: number;
  overlapPairCount: number;
  reasons: string[];
};
