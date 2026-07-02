import * as fs from "node:fs";
import * as path from "node:path";
import type { MemoryObject } from "./memoryTypes";
import { saveMemoryLink } from "./lineageStore";

function readJsonFile<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw) as T;
}

function memoryDir(): string {
  return path.resolve(process.cwd(), "shared-core", "governed-runtime", "store", "memory");
}

function shouldLinkRef(ref: string): boolean {
  return ref.startsWith("mem_") || /^ollama_candidate_\d+_memory$/.test(ref);
}

export function linkCandidateToSources(memoryId: string): string[] {
  const filePath = path.join(memoryDir(), `${memoryId}.memory.json`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`candidate_memory_not_found:${memoryId}`);
  }

  const memory = readJsonFile<MemoryObject>(filePath);
  const outputs: string[] = [];

  for (const ref of memory.sourceRefs ?? []) {
    if (typeof ref === "string" && shouldLinkRef(ref)) {
      outputs.push(
        saveMemoryLink({
          fromId: memory.id,
          toId: ref,
          relation: "supports"
        })
      );
    }
  }

  return outputs;
}
