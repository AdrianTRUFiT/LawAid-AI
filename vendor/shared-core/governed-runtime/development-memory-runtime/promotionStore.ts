import * as fs from "node:fs";
import * as path from "node:path";

export interface PromotionDecision {
  memoryId: string;
  promoteTo: "candidate" | "accepted" | "active" | "superseded" | "archived";
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

function promotionDir(): string {
  const dir = path.resolve(process.cwd(), "shared-core", "governed-runtime", "store", "promotion");
  ensureDir(dir);
  return dir;
}

export function savePromotionDecision(decision: PromotionDecision): string {
  const filePath = path.join(
    promotionDir(),
    `${decision.memoryId}__${decision.promoteTo}.promotion.json`
  );
  fs.writeFileSync(filePath, JSON.stringify(decision, null, 2), "utf8");
  return filePath;
}

export function loadAllPromotionDecisions(): PromotionDecision[] {
  const dir = promotionDir();
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".promotion.json"));
  return files.map((f) => readJsonFile<PromotionDecision>(path.join(dir, f)));
}
