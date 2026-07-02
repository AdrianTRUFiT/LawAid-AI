import type {
  ActivatedTransactionState,
  ProcessorEvent,
  TransactionIntent,
  VerificationDecision,
  VerifiedOpportunity,
} from "./types";

export interface FundTrackerArtifacts {
  verifiedOpportunities: VerifiedOpportunity[];
  processorEvents: ProcessorEvent[];
  transactionIntents: TransactionIntent[];
  verificationDecisions: VerificationDecision[];
  activatedTransactionStates: ActivatedTransactionState[];
}

function emptyArtifacts(): FundTrackerArtifacts {
  return {
    verifiedOpportunities: [],
    processorEvents: [],
    transactionIntents: [],
    verificationDecisions: [],
    activatedTransactionStates: [],
  };
}

const store = emptyArtifacts();

export function getFundTrackerArtifacts(): FundTrackerArtifacts {
  return {
    verifiedOpportunities: [...store.verifiedOpportunities],
    processorEvents: [...store.processorEvents],
    transactionIntents: [...store.transactionIntents],
    verificationDecisions: [...store.verificationDecisions],
    activatedTransactionStates: [...store.activatedTransactionStates],
  };
}

export function resetFundTrackerArtifacts(): void {
  store.verifiedOpportunities.length = 0;
  store.processorEvents.length = 0;
  store.transactionIntents.length = 0;
  store.verificationDecisions.length = 0;
  store.activatedTransactionStates.length = 0;
}

export function recordVerifiedOpportunity(
  artifact: VerifiedOpportunity,
): VerifiedOpportunity {
  store.verifiedOpportunities.push(artifact);
  return artifact;
}

export function recordProcessorArtifact(
  artifact: ProcessorEvent,
): ProcessorEvent {
  store.processorEvents.push(artifact);
  return artifact;
}

export function recordTransactionIntentArtifact(
  artifact: TransactionIntent,
): TransactionIntent {
  store.transactionIntents.push(artifact);
  return artifact;
}

export function recordVerificationDecisionArtifact(
  artifact: VerificationDecision,
): VerificationDecision {
  store.verificationDecisions.push(artifact);
  return artifact;
}

export function recordActivatedTransactionArtifact(
  artifact: ActivatedTransactionState,
): ActivatedTransactionState {
  const existing = store.activatedTransactionStates.find(
    (item) => item.transactionId === artifact.transactionId,
  );

  if (existing) {
    throw new Error(
      `Duplicate activation refused for transactionId=${artifact.transactionId}`,
    );
  }

  store.activatedTransactionStates.push(artifact);
  return artifact;
}
