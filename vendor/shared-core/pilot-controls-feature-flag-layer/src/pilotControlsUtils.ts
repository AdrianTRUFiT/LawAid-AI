export function nowIso(): string {
  return new Date().toISOString();
}

export function makePilotControlId(paymentRailId: string): string {
  return `pilot_control_${paymentRailId}`;
}

export function includesIgnoreCase(values: string[] | undefined, target: string): boolean {
  if (!values) return false;
  const normalized = target.trim().toUpperCase();
  return values.map(v => v.trim().toUpperCase()).includes(normalized);
}