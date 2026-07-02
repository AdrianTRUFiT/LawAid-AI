import { loadAllMemoryLinks } from "./lineageStore";
import { loadAllMemoryObjects } from "./memoryIndex";

type MemoryObject = {
  id: string;
  title: string;
  summary: string;
  content: string;
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

type Link = {
  fromId: string;
  toId: string;
  relation: string;
};

export type DescendantTree = {
  memoryId: string;
  children: DescendantTree[];
};

export type MemoryContextSnapshot = {
  memory: MemoryObject | null;
  upstreamPath: string[];
  downstreamTree: DescendantTree | null;
  directLinks: Link[];
};

function findMemory(memoryId: string): MemoryObject | null {
  return loadAllMemoryObjects(true).find((obj) => obj.id === memoryId) ?? null;
}

function walkUpChain(startId: string, links: Link[]): string[] {
  const path: string[] = [startId];
  const visited = new Set<string>([startId]);

  let current = startId;

  while (true) {
    const parentLink = links.find((link) => link.fromId === current);
    if (!parentLink) break;

    current = parentLink.toId;

    if (visited.has(current)) {
      path.push(`[cycle:${current}]`);
      break;
    }

    visited.add(current);
    path.push(current);
  }

  return path;
}

function buildDescendantTree(
  startId: string,
  links: Link[],
  visited = new Set<string>()
): DescendantTree {
  if (visited.has(startId)) {
    return {
      memoryId: `[cycle:${startId}]`,
      children: []
    };
  }

  const nextVisited = new Set(visited);
  nextVisited.add(startId);

  const childLinks = links.filter((link) => link.toId === startId);

  return {
    memoryId: startId,
    children: childLinks.map((link) =>
      buildDescendantTree(link.fromId, links, nextVisited)
    )
  };
}

function findDirectLinks(memoryId: string, links: Link[]): Link[] {
  return links.filter((link) => link.fromId === memoryId || link.toId === memoryId);
}

export function inspectMemoryContext(memoryId: string): MemoryContextSnapshot {
  const links = loadAllMemoryLinks();
  const memory = findMemory(memoryId);

  return {
    memory,
    upstreamPath: walkUpChain(memoryId, links),
    downstreamTree: buildDescendantTree(memoryId, links),
    directLinks: findDirectLinks(memoryId, links)
  };
}
