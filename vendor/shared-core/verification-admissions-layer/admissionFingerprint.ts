import { createHash } from "node:crypto";

function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableSerialize(item)).join(",")}]`;
  }

  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj).sort((a, b) => a.localeCompare(b));
  return `{${keys.map((k) => `${JSON.stringify(k)}:${stableSerialize(obj[k])}`).join(",")}}`;
}

function sha256(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .map((x) => x.trim())
    .filter(Boolean);
}

export function buildAdmissionFingerprint(rawText: string, normalizedText: string) {
  const visibleCharCount = [...normalizedText].filter((c) => !/\s/u.test(c)).length;
  const printableChars = [...rawText].filter((c) => {
    const code = c.codePointAt(0) ?? 0;
    return code === 9 || code === 10 || code === 13 || (code >= 32 && code <= 126) || code > 159;
  }).length;
  const printableRatio = rawText.length === 0 ? 0 : printableChars / rawText.length;

  const tokenSet = Array.from(new Set(tokenize(normalizedText))).sort((a, b) => a.localeCompare(b));

  return {
    rawHash: sha256(rawText),
    normalizedHash: sha256(normalizedText),
    tokenSetHash: sha256(stableSerialize(tokenSet)),
    visibleCharCount,
    printableRatio: Number(printableRatio.toFixed(6)),
    tokenCount: tokenSet.length
  };
}

export function buildTokenSet(text: string): Set<string> {
  return new Set(tokenize(text));
}
