export function nowIso(): string {
  return new Date().toISOString();
}

export function makePaymentRailId(subjectId: string, provider: string, railType: string): string {
  return `payment_rail_${subjectId}_${provider}_${railType}`;
}

export function normalizeLower(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizeUpper(value: string): string {
  return value.trim().toUpperCase();
}