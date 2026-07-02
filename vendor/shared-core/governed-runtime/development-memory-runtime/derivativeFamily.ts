import { loadAllMemoryObjects } from "./memoryIndex";

type MemoryObject = {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  objectClass: string;
  scope: string;
  verification: string;
  promotion: string;
  truthLane: string;
  tags?: string[];
  sourceRefs?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type DerivativeFamilyMember = {
  id: string;
  title: string;
  promotion: string;
  verification: string;
  truthLane: string;
  createdAt?: string;
  updatedAt?: string;
  derivativeDepth: number;
};

export type DerivativeFamily = {
  familyKey: string;
  members: DerivativeFamilyMember[];
  counts: {
    accepted: number;
    active: number;
    retired: number;
    captured: number;
    archived: number;
  };
};

function derivativeDepth(id: string): number {
  const matches = id.match(/_accepted_derivative/g);
  return matches ? matches.length : 0;
}

function familyKeyFor(id: string): string {
  return id.replace(/(_accepted_derivative)+$/, "");
}

function isDerivative(m: MemoryObject): boolean {
  return Boolean(
    m.tags?.includes("accepted_derivative") ||
    m.id.includes("_accepted_derivative") ||
    m.title.includes("[Accepted Derivative]")
  );
}

export function inspectDerivativeFamily(memoryId: string): DerivativeFamily {
  const all = loadAllMemoryObjects(true);
  const familyKey = familyKeyFor(memoryId);

  const members = all
    .filter((m) => isDerivative(m) && familyKeyFor(m.id) === familyKey)
    .map((m) => ({
      id: m.id,
      title: m.title,
      promotion: m.promotion,
      verification: m.verification,
      truthLane: m.truthLane,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
      derivativeDepth: derivativeDepth(m.id)
    }))
    .sort((a, b) => {
      if (a.derivativeDepth !== b.derivativeDepth) {
        return a.derivativeDepth - b.derivativeDepth;
      }
      return (a.createdAt ?? "").localeCompare(b.createdAt ?? "");
    });

  return {
    familyKey,
    members,
    counts: {
      accepted: members.filter((m) => m.promotion === "accepted").length,
      active: members.filter((m) => m.promotion === "active").length,
      retired: members.filter((m) => m.promotion === "retired").length,
      captured: members.filter((m) => m.promotion === "captured").length,
      archived: members.filter((m) => m.promotion === "archived").length
    }
  };
}

export function findLatestPendingDerivative(memoryId: string): DerivativeFamilyMember | null {
  const family = inspectDerivativeFamily(memoryId);
  const accepted = family.members.filter((m) => m.promotion === "accepted");

  if (accepted.length === 0) return null;

  return accepted.sort((a, b) => {
    if (a.derivativeDepth !== b.derivativeDepth) {
      return b.derivativeDepth - a.derivativeDepth;
    }
    return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
  })[0] ?? null;
}
