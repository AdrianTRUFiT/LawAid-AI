import { inspectMemoryContext } from "./lineageGraph";
import { loadRootHardeningArtifacts } from "./rootHardeningStore";
import { loadAllMemoryLinks } from "./lineageStore";
import { loadAllMemoryObjectsDirect } from "./memoryDiskReader";

type Link = {
  fromId: string;
  toId: string;
  relation: string;
};

type MemoryObject = ReturnType<typeof loadAllMemoryObjectsDirect>[number];

function flattenDownstream(startId: string, links: Link[]): string[] {
  const results: string[] = [];
  const queue: string[] = [startId];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);

    const children = links.filter((link) => link.toId === current);
    for (const child of children) {
      results.push(child.fromId);
      queue.push(child.fromId);
    }
  }

  return results;
}

export function inspectFullLineageContext(memoryId: string) {
  const context = inspectMemoryContext(memoryId);
  const links = loadAllMemoryLinks();
  const all = loadAllMemoryObjectsDirect();
  const map = new Map(all.map((m) => [m.id, m] as const));

  const directChildren = links
    .filter((l) => l.toId === memoryId)
    .map((l) => ({ childId: l.fromId, relation: l.relation }));

  const descendants = flattenDownstream(memoryId, links);
  const descendantObjects = descendants
    .map((id) => map.get(id))
    .filter(Boolean) as MemoryObject[];

  const rootHardening = loadRootHardeningArtifacts(memoryId);

  return {
    memoryId,
    memory: context.memory,
    upstreamPath: context.upstreamPath,
    directLinks: context.directLinks,
    directChildren,
    downstream: {
      directChildrenCount: directChildren.length,
      totalDescendants: descendants.length,
      activeDescendants: descendantObjects.filter((m) => m.promotion === "active").length,
      acceptedDescendants: descendantObjects.filter((m) => m.promotion === "accepted").length,
      retiredDescendants: descendantObjects.filter((m) => m.promotion === "retired").length,
      capturedDescendants: descendantObjects.filter((m) => m.promotion === "captured").length,
      archivedDescendants: descendantObjects.filter((m) => m.promotion === "archived").length,
      descendantIds: descendants
    },
    downstreamTree: context.downstreamTree,
    rootHardening
  };
}
