import * as fs from "node:fs";
import * as path from "node:path";

export type MemoryObject = {
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

function memoryDir(): string {
  return path.resolve(process.cwd(), "shared-core", "governed-runtime", "store", "memory");
}

function readJsonFile<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw) as T;
}

export function loadAllMemoryObjectsDirect(): MemoryObject[] {
  const dir = memoryDir();

  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs.readdirSync(dir)
    .filter((f) => f.endsWith(".memory.json"))
    .map((f) => readJsonFile<MemoryObject>(path.join(dir, f)))
    .sort((a, b) => a.id.localeCompare(b.id));
}
