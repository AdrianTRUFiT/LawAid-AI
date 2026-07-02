import * as fs from "node:fs";
import * as path from "node:path";
import type { MemoryLink } from "./memoryTypes";

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

function readJsonFile<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw) as T;
}

function linkDir(): string {
  const dir = path.resolve(process.cwd(), "shared-core", "governed-runtime", "store", "lineage");
  ensureDir(dir);
  return dir;
}

export function saveMemoryLink(link: MemoryLink): string {
  const filePath = path.join(linkDir(), `${link.fromId}__${link.relation}__${link.toId}.link.json`);
  fs.writeFileSync(filePath, JSON.stringify(link, null, 2), "utf8");
  return filePath;
}

export function loadAllMemoryLinks(): MemoryLink[] {
  const dir = linkDir();
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".link.json"));
  return files.map((f) => readJsonFile<MemoryLink>(path.join(dir, f)));
}

export function findLinksFor(memoryId: string): MemoryLink[] {
  return loadAllMemoryLinks().filter((link) => link.fromId === memoryId || link.toId === memoryId);
}
