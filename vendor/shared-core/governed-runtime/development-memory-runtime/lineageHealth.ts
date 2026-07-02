import { loadAllMemoryObjects } from "./memoryIndex";
import { inspectMemoryContext } from "./lineageGraph";

type MemoryObject = {
  id: string;
  title: string;
  verification: string;
  promotion: string;
  truthLane: string;
  objectClass: string;
};

type DescendantTree = {
  memoryId: string;
  children: DescendantTree[];
};

export type LineageHealthRecord = {
  rootId: string;
  rootTitle: string;
  rootPromotion: string;
  rootVerification: string;
  totalDescendants: number;
  activeDescendants: number;
  acceptedDescendants: number;
  candidateDescendants: number;
  capturedDescendants: number;
  archivedDescendants: number;
  unverifiedDescendants: number;
  reviewedDescendants: number;
  descendantIds: string[];
  issues: string[];
};

function flattenDescendants(tree: DescendantTree | null): string[] {
  if (!tree) return [];
  const collected: string[] = [];

  function walk(node: DescendantTree): void {
    for (const child of node.children ?? []) {
      collected.push(child.memoryId);
      walk(child);
    }
  }

  walk(tree);
  return collected;
}

function findMemoryMap(): Map<string, MemoryObject> {
  const all = loadAllMemoryObjects(true);
  return new Map(all.map((m) => [m.id, m]));
}

export function inspectLineageHealth(rootId: string): LineageHealthRecord {
  const memoryMap = findMemoryMap();
  const root = memoryMap.get(rootId);

  if (!root) {
    throw new Error(`lineage_health_root_not_found:${rootId}`);
  }

  const context = inspectMemoryContext(rootId);
  const descendantIds = flattenDescendants(context.downstreamTree);

  const descendants = descendantIds
    .map((id) => memoryMap.get(id))
    .filter((m): m is MemoryObject => Boolean(m));

  const totalDescendants = descendants.length;
  const activeDescendants = descendants.filter((d) => d.promotion === "active").length;
  const acceptedDescendants = descendants.filter((d) => d.promotion === "accepted").length;
  const candidateDescendants = descendants.filter((d) => d.promotion === "candidate").length;
  const capturedDescendants = descendants.filter((d) => d.promotion === "captured").length;
  const archivedDescendants = descendants.filter((d) => d.promotion === "archived").length;
  const unverifiedDescendants = descendants.filter((d) => d.verification === "unverified").length;
  const reviewedDescendants = descendants.filter((d) => d.verification === "reviewed" || d.verification === "source_backed").length;

  const issues: string[] = [];
  if (candidateDescendants > 0) issues.push("candidate_descendants_present");
  if (capturedDescendants > 0) issues.push("captured_descendants_present");
  if (unverifiedDescendants > 0) issues.push("unverified_descendants_present");
  if (archivedDescendants > 0) issues.push("archived_descendants_in_chain");
  if (totalDescendants === 0) issues.push("no_descendants");

  return {
    rootId: root.id,
    rootTitle: root.title,
    rootPromotion: root.promotion,
    rootVerification: root.verification,
    totalDescendants,
    activeDescendants,
    acceptedDescendants,
    candidateDescendants,
    capturedDescendants,
    archivedDescendants,
    unverifiedDescendants,
    reviewedDescendants,
    descendantIds,
    issues
  };
}

export function inspectAllActiveRootLineageHealth(): LineageHealthRecord[] {
  const all = loadAllMemoryObjects(true);

  const activeRoots = all.filter((m) => {
    const context = inspectMemoryContext(m.id);
    const children = context.downstreamTree?.children?.length ?? 0;
    return m.promotion === "active" && children > 0;
  });

  return activeRoots.map((root) => inspectLineageHealth(root.id));
}
