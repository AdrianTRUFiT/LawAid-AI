import * as fs from "node:fs";
import * as path from "node:path";

export interface RetirementDecision {
  memoryId: string;
  retiredInFavorOf?: string;
  rationale: string[];
  approvedBy: string;
  createdAt: string;
}

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

function readJsonFile<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw) as T;
}

function retirementDir(): string {
  const dir = path.resolve(process.cwd(), "shared-core", "governed-runtime", "store", "retirement");
  ensureDir(dir);
  return dir;
}

export function saveRetirementDecision(decision: RetirementDecision): string {
  const filePath = path.join(
    retirementDir(),
    `${decision.memoryId}.retirement.json`
  );
  fs.writeFileSync(filePath, JSON.stringify(decision, null, 2), "utf8");
  return filePath;
}

export function loadAllRetirementDecisions(): RetirementDecision[] {
  const dir = retirementDir();
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".retirement.json"));
  return files.map((f) => readJsonFile<RetirementDecision>(path.join(dir, f)));
}
