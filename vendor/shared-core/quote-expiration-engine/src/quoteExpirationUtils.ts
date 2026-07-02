export function nowIso(): string {
  return new Date().toISOString();
}

export function makeQuoteId(paymentRailId: string): string {
  return `quote_${paymentRailId}`;
}

export function addSeconds(iso: string, seconds: number): string {
  const base = new Date(iso);
  return new Date(base.getTime() + seconds * 1000).toISOString();
}

export function secondsBetween(aIso: string, bIso: string): number {
  const a = new Date(aIso).getTime();
  const b = new Date(bIso).getTime();
  return Math.floor((b - a) / 1000);
}