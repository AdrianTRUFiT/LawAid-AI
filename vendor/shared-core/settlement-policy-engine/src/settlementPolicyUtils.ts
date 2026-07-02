export function nowIso(): string {
  return new Date().toISOString();
}

export function makeSettlementPolicyId(paymentRailId: string): string {
  return `settlement_policy_${paymentRailId}`;
}

export function includesIgnoreCase(values: string[] | undefined, target: string): boolean {
  if (!values) return false;
  const normalized = target.trim().toUpperCase();
  return values.map(v => v.trim().toUpperCase()).includes(normalized);
}