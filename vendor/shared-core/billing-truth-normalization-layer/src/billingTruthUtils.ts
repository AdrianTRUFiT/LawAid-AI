export function nowIso(): string {
  return new Date().toISOString();
}

export function normalizeEventType(value: string): string {
  return value.trim();
}

export function normalizeCurrency(value?: string): string | null {
  if (!value) return null;
  return value.trim().toUpperCase();
}