export function nowIso(): string {
  return new Date().toISOString();
}

export function makeContinuityBridgeId(homeBaseId: string, releasedNodeId: string): string {
  return `continuity_bridge_${homeBaseId}_${releasedNodeId}`;
}