import type { ActivatedTransactionState } from "../fundtracker/types";
import type {
  GovernedFinancialOversightState,
  OversightBuildInput,
} from "./types";

export interface FinTechionIngestTransactionSummaryContract {
  version: "1.0.0";
  artifactType: "ActivatedTransactionState";
  payload: ActivatedTransactionState;
}

export interface FinTechionOversightBuildContract {
  version: "1.0.0";
  artifactType: "OversightBuildInput";
  payload: OversightBuildInput;
}

export interface FinTechionOversightArtifact {
  version: "1.0.0";
  artifactType: "GovernedFinancialOversightState";
  payload: GovernedFinancialOversightState;
}

export interface FinTechionAnomalyArtifact {
  version: "1.0.0";
  artifactType: "FinTechionAnomalyState";
  payload: {
    period: string;
    anomalyCodes: string[];
    recommendedActions: string[];
    generatedAt: string;
  };
}

export type FinTechionContractEnvelope =
  | FinTechionIngestTransactionSummaryContract
  | FinTechionOversightBuildContract
  | FinTechionOversightArtifact
  | FinTechionAnomalyArtifact;
