import * as fs from "node:fs";
import * as path from "node:path";
import type { MemoryObject, PromotionStatus, VerificationStatus } from "./memoryTypes";

export interface CandidateReviewDecision {
  memoryId: string;
  action: "accept" | "activate" | "reject" | "archive";
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

function reviewDir(): string {
  const dir = path.resolve(process.cwd(), "shared-core", "governed-runtime", "store", "candidate-review");
  ensureDir(dir);
  return dir;
}

function retirementDir(): string {
  const dir = path.resolve(process.cwd(), "shared-core", "governed-runtime", "store", "retirement");
  ensureDir(dir);
  return dir;
}

function saveReviewDecision(decision: CandidateReviewDecision): string {
  const filePath = path.join(
    reviewDir(),
    `${decision.memoryId}__${decision.action}.review.json`
  );
  fs.writeFileSync(filePath, JSON.stringify(decision, null, 2), "utf8");
  return filePath;
}

function saveRetirement(memoryId: string, approvedBy: string, rationale: string[]): string {
  const filePath = path.join(retirementDir(), `${memoryId}.retirement.json`);
  fs.writeFileSync(filePath, JSON.stringify({
    memoryId,
    rationale,
    approvedBy,
    createdAt: new Date().toISOString()
  }, null, 2), "utf8");
  return filePath;
}

function resolveStatuses(
  action: CandidateReviewDecision["action"]
): { promotion: PromotionStatus; verification: VerificationStatus } {
  switch (action) {
    case "accept":
      return { promotion: "accepted", verification: "reviewed" };
    case "activate":
      return { promotion: "active", verification: "reviewed" };
    case "archive":
      return { promotion: "archived", verification: "reviewed" };
    case "reject":
      return { promotion: "archived", verification: "reviewed" };
  }
}

export function reviewCandidateMemory(decision: CandidateReviewDecision): {
  reviewPath: string;
  memoryPath?: string;
  retirementPath?: string;
} {
  const filePath = path.join(memoryDir(), `${decision.memoryId}.memory.json`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`candidate_memory_not_found:${decision.memoryId}`);
  }

  const memory = readJsonFile<MemoryObject>(filePath);

  if (memory.promotion !== "candidate") {
    throw new Error(`candidate_review_requires_candidate_status:${memory.promotion}`);
  }

  const reviewPath = saveReviewDecision(decision);

  if (decision.action === "reject") {
    const retirementPath = saveRetirement(
      decision.memoryId,
      decision.approvedBy,
      ["candidate_rejected", ...decision.rationale]
    );
    return { reviewPath, retirementPath };
  }

  const next = resolveStatuses(decision.action);
  const updated: MemoryObject = {
    ...memory,
    promotion: next.promotion,
    verification: next.verification,
    updatedAt: new Date().toISOString()
  };

  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf8");
  return { reviewPath, memoryPath: filePath };
}
