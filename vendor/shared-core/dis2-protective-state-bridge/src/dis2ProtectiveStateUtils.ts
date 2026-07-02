export function nowIso(): string {
  return new Date().toISOString();
}

export function makeProtectiveStateId(flowId: string): string {
  return `dis2_state_${flowId}`;
}