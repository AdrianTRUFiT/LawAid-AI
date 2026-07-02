export function nowIso(): string {
  return new Date().toISOString();
}

export function makeTransactionQualificationId(subjectId: string): string {
  return `transaction_qualification_${subjectId}`;
}