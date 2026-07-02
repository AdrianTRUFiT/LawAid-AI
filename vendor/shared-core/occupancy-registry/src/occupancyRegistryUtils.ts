export function nowIso(): string {
  return new Date().toISOString();
}

export function isValidWindow(startAt: string, endAt?: string): boolean {
  if (!endAt) {
    return true;
  }

  return new Date(startAt).getTime() <= new Date(endAt).getTime();
}