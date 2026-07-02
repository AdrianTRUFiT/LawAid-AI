export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return "[" + value.map((item) => stableStringify(item)).join(",") + "]";
  }

  const objectValue = value as Record<string, unknown>;
  const keys = Object.keys(objectValue).sort();

  return "{" + keys.map((key) => JSON.stringify(key) + ":" + stableStringify(objectValue[key])).join(",") + "}";
}

export function deterministicHash(value: unknown): string {
  const input = stableStringify(value);
  let hash = 2166136261;

  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return "psh_" + (hash >>> 0).toString(16).padStart(8, "0");
}

export function isBlank(value: unknown): boolean {
  return typeof value !== "string" || value.trim().length === 0;
}

export function isValidDestinationFormat(value: string): boolean {
  return /^(acct|bank|wallet)_[a-zA-Z0-9_]{6,}$/.test(value.trim());
}