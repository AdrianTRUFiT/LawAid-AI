import fs from "node:fs";
import path from "node:path";
import type { ActivatedTransactionState } from "./types";

export interface ApprovedReviewRecord {
  reviewId: string;
  transactionId: string;
  reviewerId: string;
  reviewerNote: string;
  approvedAt: string;
  activatedTransactionState: ActivatedTransactionState;
}

const dataDir = path.resolve(process.cwd(), "records", "fundtracker");
const dataFile = path.join(dataDir, "approved-reviews.json");

function ensureStore(): void {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify([], null, 2), "utf8");
  }
}

function readStore(): ApprovedReviewRecord[] {
  ensureStore();
  return JSON.parse(fs.readFileSync(dataFile, "utf8")) as ApprovedReviewRecord[];
}

function writeStore(records: ApprovedReviewRecord[]): void {
  ensureStore();
  fs.writeFileSync(dataFile, JSON.stringify(records, null, 2), "utf8");
}

export function getApprovedReviewRecords(): ApprovedReviewRecord[] {
  return readStore();
}

export function resetApprovedReviewRecords(): void {
  writeStore([]);
}

export function appendApprovedReviewRecord(
  record: ApprovedReviewRecord,
): ApprovedReviewRecord {
  const records = readStore();
  records.push(record);
  writeStore(records);
  return record;
}
