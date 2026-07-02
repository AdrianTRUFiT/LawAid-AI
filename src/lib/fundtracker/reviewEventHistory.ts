import fs from "node:fs";
import path from "node:path";

export type ReviewEventType =
  | "review_created"
  | "review_status_updated"
  | "review_approved"
  | "review_rejected"
  | "permanent_refusal_recorded"
  | "activated_from_review";

export interface ReviewEventRecord {
  eventId: string;
  reviewId: string;
  transactionId: string;
  eventType: ReviewEventType;
  reviewerId?: string;
  reviewerNote?: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

const dataDir = path.resolve(process.cwd(), "records", "fundtracker");
const dataFile = path.join(dataDir, "review-event-history.json");

function nowIso(): string {
  return new Date().toISOString();
}

function buildEventId(reviewId: string): string {
  return `event_${reviewId}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

function ensureStore(): void {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify([], null, 2), "utf8");
  }
}

function readStore(): ReviewEventRecord[] {
  ensureStore();
  return JSON.parse(fs.readFileSync(dataFile, "utf8")) as ReviewEventRecord[];
}

function writeStore(events: ReviewEventRecord[]): void {
  ensureStore();
  fs.writeFileSync(dataFile, JSON.stringify(events, null, 2), "utf8");
}

export function getReviewEventHistory(): ReviewEventRecord[] {
  return readStore();
}

export function resetReviewEventHistory(): void {
  writeStore([]);
}

export function appendReviewEvent(
  reviewId: string,
  transactionId: string,
  eventType: ReviewEventType,
  payload: Record<string, unknown>,
  reviewerId?: string,
  reviewerNote?: string,
): ReviewEventRecord {
  const events = readStore();

  const record: ReviewEventRecord = {
    eventId: buildEventId(reviewId),
    reviewId,
    transactionId,
    eventType,
    reviewerId,
    reviewerNote,
    payload,
    createdAt: nowIso(),
  };

  events.push(record);
  writeStore(events);
  return record;
}
