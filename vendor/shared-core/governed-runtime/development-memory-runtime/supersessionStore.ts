import * as fs from "node:fs";
import * as path from "node:path";

export interface SupersessionRecord {
  priorId: string;
  nextId: string;
  rationale: string[];
  createdAt: string;
}

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

function readJsonFile<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw) as T;
}

function supersessionDir(): string {
  const dir = path.resolve(process.cwd(), "shared-core", "governed-runtime", "store", "supersession");
  ensureDir(dir);
  return dir;
}

export function saveSupersession(record: SupersessionRecord): string {
  const filePath = path.join(
    supersessionDir(),
    `${record.priorId}__superseded_by__${record.nextId}.supersession.json`
  );
  fs.writeFileSync(filePath, JSON.stringify(record, null, 2), "utf8");
  return filePath;
}

export function loadAllSupersessions(): SupersessionRecord[] {
  const dir = supersessionDir();
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".supersession.json"));
  return files.map((f) => readJsonFile<SupersessionRecord>(path.join(dir, f)));
}
