import type { ClosureDecisionEnvelope, ClosureReason, ProposedAction, RuntimeClosureState } from "./closureStateContracts";

export type ClosureEnvelopeInput = {
  proposalId: string;
  proposedAction: ProposedAction;
  runtimeClosureState: RuntimeClosureState;
  runtimeReasons: ClosureReason[];
  continuityStatus: ClosureDecisionEnvelope["continuityStatus"];
  supportStatus: ClosureDecisionEnvelope["supportStatus"];
  hazardStatus: ClosureDecisionEnvelope["hazardStatus"];
  maturityStatus: ClosureDecisionEnvelope["maturityStatus"];
  connectionHonorable: boolean;
  proofRequired: boolean;
  timestamp: string;
};

function makeReplayKey(input: ClosureEnvelopeInput): string {
  return [
    input.proposalId,
    input.proposedAction,
    input.runtimeClosureState,
    input.runtimeReasons.slice().sort().join("|"),
    input.continuityStatus,
    input.supportStatus,
    input.hazardStatus,
    input.maturityStatus,
    input.connectionHonorable ? "1" : "0",
    input.proofRequired ? "1" : "0"
  ].join("::");
}

export function makeClosureDecisionEnvelope(input: ClosureEnvelopeInput): ClosureDecisionEnvelope {
  return {
    ...input,
    runtimeReasons: input.runtimeReasons.slice().sort(),
    deterministicReplayKey: makeReplayKey(input)
  };
}
