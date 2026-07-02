import type { ProcessorEvent, TransactionIntent } from "../../lib/fundtracker/types";
import {
  buildActivatedTransactionState,
  buildHeldDecision,
  buildRefusedDecision,
  recordActivatedTransactionArtifact,
  recordVerificationDecisionArtifact,
  verifyCommitment,
} from "../../lib/fundtracker";
import { addToReviewQueueApi } from "./reviewQueue";

export function verifyCommitmentApi(
  intent: TransactionIntent,
  processorEvent: ProcessorEvent,
) {
  const decision = verifyCommitment(intent, processorEvent);
  recordVerificationDecisionArtifact(decision);

  if (!decision.allowed) {
    const refusal =
      decision.verificationStatus === "refused"
        ? buildRefusedDecision(decision.reasons, decision.evaluatedAt)
        : buildHeldDecision(decision.reasons, decision.evaluatedAt);

    recordVerificationDecisionArtifact(refusal);
    const review = addToReviewQueueApi(intent, processorEvent, refusal);

    return {
      ok: false,
      artifactType: "VerificationDecision",
      payload: refusal,
      reviewQueueItem: review.payload,
    };
  }

  const activatedTransactionState = buildActivatedTransactionState(
    intent,
    processorEvent,
    decision,
  );
  recordActivatedTransactionArtifact(activatedTransactionState);

  return {
    ok: true,
    artifactType: "ActivatedTransactionState",
    payload: activatedTransactionState,
  };
}
