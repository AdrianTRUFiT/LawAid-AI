import fs from "node:fs";
import path from "node:path";
import type {
  ActivatedTransactionState,
  ProcessorEvent,
  TransactionIntent,
  VerificationDecision,
  VerifiedOpportunity,
} from "./types";

export interface FundTrackerJsonArtifacts {
  verifiedOpportunities: VerifiedOpportunity[];
  processorEvents: ProcessorEvent[];
  transactionIntents: TransactionIntent[];
  verificationDecisions: VerificationDecision[];
  activatedTransactionStates: ActivatedTransactionState[];
}

const dataDir = path.resolve(process.cwd(), "records", "fundtracker");
const dataFile = path.join(dataDir, "artifacts.json");

function ensureStore(): void {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(
      dataFile,
      JSON.stringify(
        {
          verifiedOpportunities: [],
          processorEvents: [],
          transactionIntents: [],
          verificationDecisions: [],
          activatedTransactionStates: [],
        },
        null,
        2,
      ),
      "utf8",
    );
  }
}

function readStore(): FundTrackerJsonArtifacts {
  ensureStore();
  return JSON.parse(fs.readFileSync(dataFile, "utf8")) as FundTrackerJsonArtifacts;
}

function writeStore(store: FundTrackerJsonArtifacts): void {
  ensureStore();
  fs.writeFileSync(dataFile, JSON.stringify(store, null, 2), "utf8");
}

export function getFundTrackerJsonArtifacts(): FundTrackerJsonArtifacts {
  return readStore();
}

export function resetFundTrackerJsonArtifacts(): void {
  writeStore({
    verifiedOpportunities: [],
    processorEvents: [],
    transactionIntents: [],
    verificationDecisions: [],
    activatedTransactionStates: [],
  });
}

export function appendVerifiedOpportunityJson(
  artifact: VerifiedOpportunity,
): VerifiedOpportunity {
  const store = readStore();
  store.verifiedOpportunities.push(artifact);
  writeStore(store);
  return artifact;
}

export function appendProcessorEventJson(
  artifact: ProcessorEvent,
): ProcessorEvent {
  const store = readStore();
  store.processorEvents.push(artifact);
  writeStore(store);
  return artifact;
}

export function appendTransactionIntentJson(
  artifact: TransactionIntent,
): TransactionIntent {
  const store = readStore();
  store.transactionIntents.push(artifact);
  writeStore(store);
  return artifact;
}

export function appendVerificationDecisionJson(
  artifact: VerificationDecision,
): VerificationDecision {
  const store = readStore();
  store.verificationDecisions.push(artifact);
  writeStore(store);
  return artifact;
}

export function appendActivatedTransactionStateJson(
  artifact: ActivatedTransactionState,
): ActivatedTransactionState {
  const store = readStore();
  const existing = store.activatedTransactionStates.find(
    (item) => item.transactionId === artifact.transactionId,
  );

  if (existing) {
    throw new Error(
      `Duplicate activation refused for transactionId=${artifact.transactionId}`,
    );
  }

  store.activatedTransactionStates.push(artifact);
  writeStore(store);
  return artifact;
}
