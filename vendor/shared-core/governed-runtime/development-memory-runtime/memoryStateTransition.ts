import * as fs from "node:fs";
import * as path from "node:path";
import type { MemoryObject, PromotionStatus, VerificationStatus } from "./memoryTypes";

export interface MemoryStateTransition {
  memoryId: string;
  fromPromotion: PromotionStatus;
  toPromotion: "accepted" | "active" | "archived";
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

function transitionDir(): string {
  const dir = path.resolve(process.cwd(), "shared-core", "governed-runtime", "store", "state-transition");
  ensureDir(dir);
  return dir;
}

function saveTransition(decision: MemoryStateTransition): string {
  const filePath = path.join(
    transitionDir(),
    `${decision.memoryId}__${decision.fromPromotion}__to__${decision.toPromotion}.transition.json`
  );
  fs.writeFileSync(filePath, JSON.stringify(decision, null, 2), "utf8");
  return filePath;
}

function allowedNext(current: PromotionStatus, target: string): boolean {
  const map: Record<string, string[]> = {
    candidate: ["accepted", "active", "archived"],
    accepted: ["active", "archived"],
    active: ["archived"],
    captured: [],
    superseded: [],
    archived: []
  };

  return (map[current] ?? []).includes(target);
}

function resolveVerification(current: VerificationStatus, target: "accepted" | "active" | "archived"): VerificationStatus {
  if (target === "active") return "reviewed";
  if (target === "accepted") return "reviewed";
  if (target === "archived") return current === "unverified" ? "reviewed" : current;
  return current;
}

export function transitionMemoryState(
  memoryId: string,
  target: "accepted" | "active" | "archived",
  approvedBy: string,
  rationale: string[]
): { transitionPath: string; memoryPath: string; from: PromotionStatus; to: PromotionStatus } {
  const filePath = path.join(memoryDir(), `${memoryId}.memory.json`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`memory_not_found:${memoryId}`);
  }

  const memory = readJsonFile<MemoryObject>(filePath);

  if (!allowedNext(memory.promotion, target)) {
    throw new Error(`invalid_state_transition:${memory.promotion}->${target}`);
  }

  const transitionPath = saveTransition({
    memoryId,
    fromPromotion: memory.promotion,
    toPromotion: target,
    approvedBy,
    rationale,
    createdAt: new Date().toISOString()
  });

  const updated: MemoryObject = {
    ...memory,
    promotion: target,
    verification: resolveVerification(memory.verification, target),
    updatedAt: new Date().toISOString()
  };

  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf8");

  return {
    transitionPath,
    memoryPath: filePath,
    from: memory.promotion,
    to: target
  };
}
