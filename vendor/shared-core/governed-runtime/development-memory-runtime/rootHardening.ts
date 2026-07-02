import * as fs from "node:fs";
import * as path from "node:path";
import type { MemoryObject, PromotionStatus, VerificationStatus } from "./memoryTypes";
import { inspectMemoryContext } from "./lineageGraph";

export interface RootHardeningDecision {
  memoryId: string;
  action: "accept" | "activate" | "archive";
  approvedBy: string;
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

function memoryDir(): string {
  const dir = path.resolve(process.cwd(), "shared-core", "governed-runtime", "store", "memory");
  ensureDir(dir);
  return dir;
}

function hardeningDir(): string {
  const dir = path.resolve(process.cwd(), "shared-core", "governed-runtime", "store", "root-hardening");
  ensureDir(dir);
  return dir;
}

function saveDecision(decision: RootHardeningDecision, contextSummary: object): string {
  const filePath = path.join(
    hardeningDir(),
    `${decision.memoryId}__${decision.action}.root-hardening.json`
  );
  fs.writeFileSync(filePath, JSON.stringify({
    decision,
    contextSummary
  }, null, 2), "utf8");
  return filePath;
}

function resolveNext(
  action: RootHardeningDecision["action"]
): { promotion: PromotionStatus; verification: VerificationStatus } {
  switch (action) {
    case "accept":
      return { promotion: "accepted", verification: "reviewed" };
    case "activate":
      return { promotion: "active", verification: "reviewed" };
    case "archive":
      return { promotion: "archived", verification: "reviewed" };
  }
}

export function hardenRootMemory(decision: RootHardeningDecision): {
  memoryPath: string;
  decisionPath: string;
  before: { promotion: PromotionStatus; verification: VerificationStatus };
  after: { promotion: PromotionStatus; verification: VerificationStatus };
  downstreamChildrenCount: number;
} {
  const filePath = path.join(memoryDir(), `${decision.memoryId}.memory.json`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`root_memory_not_found:${decision.memoryId}`);
  }

  const memory = readJsonFile<MemoryObject>(filePath);
  const context = inspectMemoryContext(decision.memoryId);

  const next = resolveNext(decision.action);

  const updated: MemoryObject = {
    ...memory,
    promotion: next.promotion,
    verification: next.verification,
    updatedAt: new Date().toISOString()
  };

  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf8");

  const decisionPath = saveDecision(decision, {
    upstreamPath: context.upstreamPath,
    directLinks: context.directLinks,
    downstreamTree: context.downstreamTree
  });

  return {
    memoryPath: filePath,
    decisionPath,
    before: {
      promotion: memory.promotion,
      verification: memory.verification
    },
    after: next,
    downstreamChildrenCount: context.downstreamTree?.children?.length ?? 0
  };
}
