import * as fs from "node:fs";
import * as path from "node:path";
import { loadAllMemoryObjectsDirect } from "./memoryDiskReader";

type MemoryObject = ReturnType<typeof loadAllMemoryObjectsDirect>[number];

export type DerivativeFamilyCloseoutDecision = {
  memoryId: string;
  decision: "activate_pending" | "retire_pending" | "preserve_pending";
  approvedBy: string;
  rationale: string[];
  createdAt: string;
};

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

function memoryDir(): string {
  const dir = path.resolve(process.cwd(), "shared-core", "governed-runtime", "store", "memory");
  ensureDir(dir);
  return dir;
}

function reviewDir(): string {
  const dir = path.resolve(process.cwd(), "shared-core", "governed-runtime", "store", "derivative-family-review");
  ensureDir(dir);
  return dir;
}

function readJsonFile<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
  return JSON.parse(raw) as T;
}

function saveDecision(decision: DerivativeFamilyCloseoutDecision, before: MemoryObject, after: MemoryObject): string {
  const filePath = path.join(
    reviewDir(),
    `${decision.memoryId}__${decision.decision}.derivative-family-review.json`
  );

  fs.writeFileSync(filePath, JSON.stringify({
    decision,
    before: {
      promotion: before.promotion,
      verification: before.verification
    },
    after: {
      promotion: after.promotion,
      verification: after.verification
    }
  }, null, 2), "utf8");

  return filePath;
}

function resolveNext(decision: DerivativeFamilyCloseoutDecision["decision"]) {
  switch (decision) {
    case "activate_pending":
      return { promotion: "active", verification: "reviewed" };
    case "retire_pending":
      return { promotion: "retired", verification: "reviewed" };
    case "preserve_pending":
      return { promotion: "accepted", verification: "reviewed" };
  }
}

export function reviewDerivativeFamilyPending(decision: DerivativeFamilyCloseoutDecision) {
  const filePath = path.join(memoryDir(), `${decision.memoryId}.memory.json`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`derivative_family_memory_not_found:${decision.memoryId}`);
  }

  const memory = readJsonFile<MemoryObject>(filePath);

  if (memory.promotion !== "accepted") {
    throw new Error(`derivative_family_review_requires_accepted_state:${memory.id}:${memory.promotion}`);
  }

  const next = resolveNext(decision.decision);

  const updated: MemoryObject = {
    ...memory,
    promotion: next.promotion,
    verification: next.verification,
    updatedAt: new Date().toISOString()
  };

  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf8");

  const reviewPath = saveDecision(decision, memory, updated);

  return {
    memoryPath: filePath,
    reviewPath,
    before: {
      promotion: memory.promotion,
      verification: memory.verification
    },
    after: {
      promotion: updated.promotion,
      verification: updated.verification
    }
  };
}
