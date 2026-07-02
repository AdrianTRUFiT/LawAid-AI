import * as fs from "node:fs";
import * as path from "node:path";
import type { MemoryObject, TruthLane } from "./memoryTypes";

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

function runtimeRoot(): string {
  return path.resolve(process.cwd(), "shared-core", "governed-runtime", "store");
}

function memoryDir(): string {
  const dir = path.join(runtimeRoot(), "memory");
  ensureDir(dir);
  return dir;
}

function retirementDir(): string {
  const dir = path.join(runtimeRoot(), "retirement");
  ensureDir(dir);
  return dir;
}

function readJsonFile<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw) as T;
}

function loadRetiredIds(): Set<string> {
  const dir = retirementDir();
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".retirement.json"));
  const ids = files.map((f) => {
    const parsed = readJsonFile<{ memoryId: string }>(path.join(dir, f));
    return parsed.memoryId;
  });
  return new Set(ids);
}

export function saveMemoryObject(obj: MemoryObject): string {
  const filePath = path.join(memoryDir(), `${obj.id}.memory.json`);
  fs.writeFileSync(filePath, JSON.stringify(obj, null, 2), "utf8");
  return filePath;
}

export function loadAllMemoryObjects(includeRetired = false): MemoryObject[] {
  const dir = memoryDir();
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".memory.json"));
  const all = files.map((f) =>
    readJsonFile<MemoryObject>(path.join(dir, f))
  );

  if (includeRetired) return all;

  const retiredIds = loadRetiredIds();
  return all.filter((obj) => !retiredIds.has(obj.id));
}

export function searchMemory(term: string, lane?: TruthLane, includeRetired = false): MemoryObject[] {
  const lowered = term.toLowerCase();
  return loadAllMemoryObjects(includeRetired).filter((obj) => {
    if (lane && obj.truthLane !== lane) return false;
    return [
      obj.title,
      obj.summary,
      obj.content,
      ...(obj.tags || [])
    ].join(" ").toLowerCase().includes(lowered);
  });
}
