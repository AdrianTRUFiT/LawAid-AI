import type {
  ActivatedTransactionState,
  ProcessorEvent,
  TransactionIntent,
  VerificationDecision,
  VerifiedOpportunity,
} from "./types";

export interface FundTrackerInboundContract {
  version: "1.0.0";
  artifactType: "VerifiedOpportunity";
  payload: VerifiedOpportunity;
}

export interface FundTrackerProcessorEventContract {
  version: "1.0.0";
  artifactType: "ProcessorEvent";
  payload: ProcessorEvent;
}

export interface FundTrackerIntentArtifact {
  version: "1.0.0";
  artifactType: "TransactionIntent";
  payload: TransactionIntent;
}

export interface FundTrackerVerificationArtifact {
  version: "1.0.0";
  artifactType: "VerificationDecision";
  payload: VerificationDecision;
}

export interface FundTrackerOutboundContract {
  version: "1.0.0";
  artifactType: "ActivatedTransactionState";
  payload: ActivatedTransactionState;
}

export interface FundTrackerHeldArtifact {
  version: "1.0.0";
  artifactType: "HeldTransactionState";
  payload: {
    transactionId: string;
    verifiedOpportunityId: string;
    reasons: VerificationDecision["reasons"];
    evaluatedAt: string;
  };
}

export interface FundTrackerRefusedArtifact {
  version: "1.0.0";
  artifactType: "RefusedTransactionState";
  payload: {
    transactionId: string;
    verifiedOpportunityId: string;
    reasons: VerificationDecision["reasons"];
    evaluatedAt: string;
  };
}

export type FundTrackerContractEnvelope =
  | FundTrackerInboundContract
  | FundTrackerProcessorEventContract
  | FundTrackerIntentArtifact
  | FundTrackerVerificationArtifact
  | FundTrackerOutboundContract
  | FundTrackerHeldArtifact
  | FundTrackerRefusedArtifact;
