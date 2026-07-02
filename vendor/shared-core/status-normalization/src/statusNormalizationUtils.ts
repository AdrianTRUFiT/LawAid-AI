export function normalizeRawStatus(rawStatus: string): string {
  return rawStatus.trim().toLowerCase().replace(/\s+/g, "_");
}