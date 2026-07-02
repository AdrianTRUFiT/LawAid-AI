import fs from "node:fs";
import path from "node:path";
import type { ReviewQueueItem } from "./reviewQueue";
import type { ReviewAuditRecord, ReviewOutcome } from "./reviewAudit";

export interface FundTrackerReviewPersistenceState {
  reviewQueue: ReviewQueueItem[];
  reviewAuditLog: ReviewAuditRecord[];
  permanentRefusals: NonNullable<ReviewOutcome["permanentRefusalRecord"]>[];
}

const dataDir = path.resolve(process.cwd(), "records", "fundtracker");
const dataFile = path.join(dataDir, "review-governance.json");

function ensureStore(): void {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(
      dataFile,
      JSON.stringify(
        {
          reviewQueue: [],
          reviewAuditLog: [],
          permanentRefusals: [],
        },
        null,
        2,
      ),
      "utf8",
    );
  }
}

function readStore(): FundTrackerReviewPersistenceState {
  ensureStore();
  return JSON.parse(
    fs.readFileSync(dataFile, "utf8"),
  ) as FundTrackerReviewPersistenceState;
}

function writeStore(state: FundTrackerReviewPersistenceState): void {
  ensureStore();
  fs.writeFileSync(dataFile, JSON.stringify(state, null, 2), "utf8");
}

export function getPersistedReviewGovernanceState(): FundTrackerReviewPersistenceState {
  return readStore();
}

export function resetPersistedReviewGovernanceState(): void {
  writeStore({
    reviewQueue: [],
    reviewAuditLog: [],
    permanentRefusals: [],
  });
}

export function savePersistedReviewQueue(
  reviewQueue: ReviewQueueItem[],
): ReviewQueueItem[] {
  const state = readStore();
  state.reviewQueue = reviewQueue;
  writeStore(state);
  return reviewQueue;
}

export function savePersistedReviewAuditLog(
  reviewAuditLog: ReviewAuditRecord[],
): ReviewAuditRecord[] {
  const state = readStore();
  state.reviewAuditLog = reviewAuditLog;
  writeStore(state);
  return reviewAuditLog;
}

export function savePersistedPermanentRefusals(
  permanentRefusals: NonNullable<ReviewOutcome["permanentRefusalRecord"]>[],
): NonNullable<ReviewOutcome["permanentRefusalRecord"]>[] {
  const state = readStore();
  state.permanentRefusals = permanentRefusals;
  writeStore(state);
  return permanentRefusals;
}
