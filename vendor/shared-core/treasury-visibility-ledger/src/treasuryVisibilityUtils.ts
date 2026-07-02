export function nowIso(): string {
  return new Date().toISOString();
}

export function makeTreasuryRecordId(settlementPolicyId: string): string {
  return `treasury_record_${settlementPolicyId}`;
}