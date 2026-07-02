import * as fs from "node:fs";
import * as path from "node:path";

export interface RootHardeningArtifact {
  decision: {
    memoryId: string;
    action: "accept" | "activate" | "archive";
    approvedBy: string;
    rationale: string[];
    createdAt: string;
  };
  contextSummary: {
    upstreamPath: string[];
    directLinks: unknown[];
    downstreamTree: unknown;
  };
}

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

function readJsonFile<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw) as T;
}

function hardeningDir(): string {
  const dir = path.resolve(process.cwd(), "shared-core", "governed-runtime", "store", "root-hardening");
  ensureDir(dir);
  return dir;
}

export function loadRootHardeningArtifacts(memoryId: string): RootHardeningArtifact[] {
  const dir = hardeningDir();
  const files = fs.readdirSync(dir)
    .filter((f) => f.startsWith(`${memoryId}__`) && f.endsWith(".root-hardening.json"));

  return files.map((f) => readJsonFile<RootHardeningArtifact>(path.join(dir, f)));
}
