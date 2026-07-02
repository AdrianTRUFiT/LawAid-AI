export function nowIso(): string {
  return new Date().toISOString();
}

export function makeActivatedTransactionStateEmissionId(subjectId: string): string {
  return `activated_tx_state_${subjectId}`;
}