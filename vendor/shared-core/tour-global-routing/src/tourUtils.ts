export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return "[" + value.map(stableStringify).join(",") + "]";
  }

  const record = value as Record<string, unknown>;
  const keys = Object.keys(record).sort();

  return "{" + keys.map((key) => JSON.stringify(key) + ":" + stableStringify(record[key])).join(",") + "}";
}

export function portableDigest(value: unknown): string {
  const text = stableStringify(value);
  let hash = 2166136261;

  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return "portable-fnv1a-" + (hash >>> 0).toString(16).padStart(8, "0");
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function isExpired(expiresAt: string, requestedAt: string): boolean {
  return new Date(expiresAt).getTime() < new Date(requestedAt).getTime();
}
