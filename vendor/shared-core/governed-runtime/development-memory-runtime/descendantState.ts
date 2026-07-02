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

export type DescendantStateRecord = {
  id: string;
  title: string;
  promotion: string;
  verification: string;
  truthLane: string;
  objectClass: string;
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

export function listDescendantsByState(rootId: string) {
  const memoryMap = findMemoryMap();
  const context = inspectMemoryContext(rootId);
  const descendantIds = flattenDescendants(context.downstreamTree);

  const descendants = descendantIds
    .map((id) => memoryMap.get(id))
    .filter((m): m is MemoryObject => Boolean(m));

  return {
    rootId,
    all: descendants,
    captured: descendants.filter((d) => d.promotion === "captured"),
    candidate: descendants.filter((d) => d.promotion === "candidate"),
    accepted: descendants.filter((d) => d.promotion === "accepted"),
    active: descendants.filter((d) => d.promotion === "active"),
    archived: descendants.filter((d) => d.promotion === "archived"),
    unverified: descendants.filter((d) => d.verification === "unverified")
  };
}
