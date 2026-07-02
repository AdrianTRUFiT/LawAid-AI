import { loadAllMemoryObjectsDirect } from "./memoryDiskReader";

type MemoryObject = ReturnType<typeof loadAllMemoryObjectsDirect>[number];

export type DerivativeFamilySnapshot = {
  familyKey: string;
  members: Array<{
    id: string;
    promotion: string;
    verification: string;
    truthLane: string;
    derivativeDepth: number;
    createdAt?: string;
    isFamilyTip: boolean;
  }>;
  counts: {
    accepted: number;
    active: number;
    retired: number;
    captured: number;
    archived: number;
  };
};

function isDerivative(m: MemoryObject): boolean {
  return Boolean(
    m.tags?.includes("accepted_derivative") ||
    m.id.includes("_accepted_derivative")
  );
}

function derivativeDepth(id: string): number {
  const matches = id.match(/_accepted_derivative/g);
  return matches ? matches.length : 0;
}

function familyKeyFor(id: string): string {
  return id.replace(/(_accepted_derivative)+$/, "");
}

export function buildDerivativeFamilySnapshots(): DerivativeFamilySnapshot[] {
  const all = loadAllMemoryObjectsDirect().filter(isDerivative);

  const families = new Map<string, MemoryObject[]>();

  for (const item of all) {
    const key = familyKeyFor(item.id);
    const existing = families.get(key) ?? [];
    existing.push(item);
    families.set(key, existing);
  }

  return Array.from(families.entries())
    .map(([familyKey, members]) => {
      const normalized = members
        .map((m) => ({
          id: m.id,
          promotion: m.promotion,
          verification: m.verification,
          truthLane: m.truthLane,
          derivativeDepth: derivativeDepth(m.id),
          createdAt: m.createdAt
        }))
        .sort((a, b) => {
          if (a.derivativeDepth !== b.derivativeDepth) {
            return a.derivativeDepth - b.derivativeDepth;
          }
          return (a.createdAt ?? "").localeCompare(b.createdAt ?? "");
        });

      const maxDepth = normalized.reduce((max, m) => Math.max(max, m.derivativeDepth), 0);

      const withTip = normalized.map((m) => ({
        ...m,
        isFamilyTip: m.derivativeDepth === maxDepth
      }));

      return {
        familyKey,
        members: withTip,
        counts: {
          accepted: withTip.filter((m) => m.promotion === "accepted").length,
          active: withTip.filter((m) => m.promotion === "active").length,
          retired: withTip.filter((m) => m.promotion === "retired").length,
          captured: withTip.filter((m) => m.promotion === "captured").length,
          archived: withTip.filter((m) => m.promotion === "archived").length
        }
      };
    })
    .sort((a, b) => a.familyKey.localeCompare(b.familyKey));
}
