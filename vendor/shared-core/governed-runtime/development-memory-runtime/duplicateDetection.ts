import { loadAllMemoryObjects } from "./memoryIndex";
import type { MemoryObject } from "./memoryTypes";

export interface DuplicateCandidate {
  primaryId: string;
  duplicateId: string;
  rationale: string[];
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

export function findDuplicateCandidates(): DuplicateCandidate[] {
  const objects = loadAllMemoryObjects();
  const results: DuplicateCandidate[] = [];

  for (let i = 0; i < objects.length; i += 1) {
    for (let j = i + 1; j < objects.length; j += 1) {
      const a = objects[i];
      const b = objects[j];

      const sameTitle = normalize(a.title) === normalize(b.title);
      const sameContent = normalize(a.content) === normalize(b.content);

      if (sameTitle || sameContent) {
        results.push({
          primaryId: a.id,
          duplicateId: b.id,
          rationale: [
            ...(sameTitle ? ["same_title"] : []),
            ...(sameContent ? ["same_content"] : [])
          ]
        });
      }
    }
  }

  return results;
}
