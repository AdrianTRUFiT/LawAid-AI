export function nowIso(): string {
  return new Date().toISOString();
}

export function makeTransactionIntentCandidateId(subjectId: string): string {
  return `tx_intent_candidate_${subjectId}`;
}