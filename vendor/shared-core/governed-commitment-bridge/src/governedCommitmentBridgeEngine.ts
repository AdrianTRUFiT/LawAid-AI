import type {
  GovernedCommitmentBridgeInput,
  GovernedCommitmentBridgeResult,
} from "./governedCommitmentTypes.js";
import { buildGovernedCommitmentArtifact } from "./commitmentArtifactBuilder.js";
import { deriveGovernedCommitmentRefusal } from "./refusalLogic.js";

export function runGovernedCommitmentBridge(
  input: GovernedCommitmentBridgeInput,
): GovernedCommitmentBridgeResult {
  const refusal = deriveGovernedCommitmentRefusal(input);

  if (refusal) {
    return {
      status: "REFUSED",
      commitmentArtifact: null,
      refusal,
      inputSummary: {
        agreementStatus: input.agreementResult?.status ?? "missing",
        bookingStatus: input.bookingResult?.status ?? "missing",
        agreementId: input.agreementResult?.sealedArtifact?.agreementId,
        bookingId: input.bookingResult?.bookingArtifact?.bookingId,
        queryId: input.bookingResult?.bookingArtifact?.queryId,
      },
    };
  }

  const commitmentArtifact = buildGovernedCommitmentArtifact(input);

  return {
    status: "COMMITMENT_READY",
    commitmentArtifact,
    refusal: null,
    inputSummary: {
      agreementStatus: input.agreementResult.status,
      bookingStatus: input.bookingResult.status,
      agreementId: input.agreementResult.sealedArtifact?.agreementId,
      bookingId: input.bookingResult.bookingArtifact?.bookingId,
      queryId: input.bookingResult.bookingArtifact?.queryId,
    },
  };
}