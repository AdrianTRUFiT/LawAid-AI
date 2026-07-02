export function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function isWithinWindow(input: {
  nowIso: string;
  startsAt: string;
  endsAt: string;
}): boolean {
  const now = new Date(input.nowIso).getTime();
  const start = new Date(input.startsAt).getTime();
  const end = new Date(input.endsAt).getTime();
  return now >= start && now <= end;
}