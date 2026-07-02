import { buildGateOverview } from "../development-memory-runtime/gateOverview";
import { buildDerivativeFamilySnapshots } from "../development-memory-runtime/derivativeFamilySnapshot";
import { loadAllMemoryObjectsDirect } from "../development-memory-runtime/memoryDiskReader";
import { loadAllMemoryLinks } from "../development-memory-runtime/lineageStore";
import type { ProposalContext, RuntimeTruthInput } from "./closureStateContracts";

type AnyGate = ReturnType<typeof buildGateOverview> & {
  lineageIssueRoots?: Array<{ id: string }>;
  activeRootsWithDescendants?: Array<{ id: string }>;
  candidates?: Array<{ id: string }>;
  acceptedNotActive?: Array<{ id: string }>;
};

export type RuntimeSupportOverlapPair = {
  pairKey: string;
  leftId: string;
  rightId: string;
  sharedSourceRefs: string[];
};

function sortStrings(values: string[]): string[] {
  return [...values].sort((a, b) => a.localeCompare(b));
}

function makePairKey(a: string, b: string): string {
  return sortStrings([a, b]).join("|");
}

function sharedRefs(a: string[], b: string[]): string[] {
  const setB = new Set(b);
  return sortStrings(a.filter((x) => setB.has(x)));
}

export function deriveRuntimeSupportOverlapPairs(): RuntimeSupportOverlapPair[] {
  const memories = loadAllMemoryObjectsDirect()
    .filter((m) => m.promotion === "active")
    .sort((a, b) => a.id.localeCompare(b.id));

  const links = loadAllMemoryLinks();
  const incomingIds = new Set(links.map((l) => l.fromId));
  const outgoingIds = new Set(links.map((l) => l.toId));

  const activeOrphans = memories.filter((m) => !incomingIds.has(m.id) && !outgoingIds.has(m.id));

  const pairs: RuntimeSupportOverlapPair[] = [];

  for (let i = 0; i < activeOrphans.length; i += 1) {
    for (let j = i + 1; j < activeOrphans.length; j += 1) {
      const left = activeOrphans[i];
      const right = activeOrphans[j];
      const overlap = sharedRefs(left.sourceRefs ?? [], right.sourceRefs ?? []);

      if (overlap.length > 0) {
        pairs.push({
          pairKey: makePairKey(left.id, right.id),
          leftId: left.id,
          rightId: right.id,
          sharedSourceRefs: overlap
        });
      }
    }
  }

  return pairs.sort((a, b) => a.pairKey.localeCompare(b.pairKey));
}

export function deriveRuntimeTruthFromCurrentRuntime(proposal: ProposalContext): RuntimeTruthInput {
  const gate = buildGateOverview() as AnyGate;
  const families = buildDerivativeFamilySnapshots();

  const lineageIssueRoots = gate.lineageIssueRoots ?? [];
  const activeRootsWithDescendants = gate.activeRootsWithDescendants ?? [];
  const candidates = gate.candidates ?? [];
  const acceptedNotActive = gate.acceptedNotActive ?? [];

  const overlapPairs = deriveRuntimeSupportOverlapPairs();
  const degradedIds = sortStrings(Array.from(new Set(
    overlapPairs.flatMap((p) => [p.leftId, p.rightId])
  )));

  const unresolvedFamilies = families.filter((f) => f.counts.accepted > 0);

  const supportStatus =
    degradedIds.length > 0 ? "DEGRADED" :
    lineageIssueRoots.length > 0 ? "DEGRADED" :
    "SUPPORTED";

  const continuityStatus =
    unresolvedFamilies.length > 0 ? "UNRESOLVED" :
    lineageIssueRoots.length > 0 ? "BROKEN" :
    "INTACT";

  const hazardStatus =
    overlapPairs.length > 0 ? "ELEVATED" :
    "CLEAR";

  const maturityStatus =
    activeRootsWithDescendants.length > 0 ? "SUFFICIENT" : "EARLY";

  return {
    runtimeState: {
      visibleReady: candidates.length === 0 && acceptedNotActive.length === 0,
      activeState: activeRootsWithDescendants.length > 0,
      reviewed: true,
      proposalAttachable: true
    },
    supportState: {
      supportStatus,
      supportingIds: sortStrings(activeRootsWithDescendants.map((x) => x.id)),
      degradedIds,
      orphanedIds: []
    },
    continuityState: {
      continuityStatus,
      lineageIntact: lineageIssueRoots.length === 0,
      unresolvedCount: unresolvedFamilies.length,
      brokenCount: lineageIssueRoots.length
    },
    timingState: {
      timingStatus: "VALID",
      windowOpen: true
    },
    hazardState: {
      hazardStatus,
      activeHazards: sortStrings(
        overlapPairs.map((p) => `duplicate_active_orphan_pair:${p.pairKey}`)
      )
    },
    maturityState: {
      maturityStatus,
      maturityScore: activeRootsWithDescendants.length > 0 ? 1 : 0.5
    },
    anomalyState: {
      anomalySignals: sortStrings(
        overlapPairs.flatMap((p) => [
          `source_ref_overlap_pair:${p.pairKey}`,
          `source_ref_overlap_count:${p.pairKey}:${p.sharedSourceRefs.length}`
        ])
      )
    }
  };
}
