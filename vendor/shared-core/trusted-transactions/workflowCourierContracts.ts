import type { TrustedTransactionFinalState } from "./trustedTransactionContracts";

export type WorkflowCourierCheckpointEvent = {
  checkpointId: string;
  state: TrustedTransactionFinalState;
  timestamp: string;
  proofReference?: string;
  note: string;
};

export type WorkflowCourierTransportRecord = {
  transportId: string;
  micId: string;
  miPlanId: string;
  checkpointEvents: WorkflowCourierCheckpointEvent[];
  currentLocation: string;
  currentState: TrustedTransactionFinalState;
  lastVerifiedCheckpoint?: string;
  transportProofs: string[];
  exceptionEvents: string[];
  finalTransportStatus?: "NOT_FINAL" | "COMPLETED" | "HELD" | "REFUSED" | "REPLAY_BLOCKED";
  createsTruth: false;
};

export function assertTransportBoundary(record: WorkflowCourierTransportRecord): true {
  if (record.createsTruth !== false) {
    throw new Error("WFC_BOUNDARY_BREACH: transport must not create truth.");
  }
  return true;
}
