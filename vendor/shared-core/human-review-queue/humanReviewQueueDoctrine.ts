export const HUMAN_REVIEW_QUEUE_DOCTRINE = {
  name: "Human Review Queue",
  class: "AUTHORIZED_REVIEW_AND_ESCALATION_BOUNDARY",
  purpose:
    "Bridge machine refusal into authorized human custody without allowing machine-only consequence.",
  operatingLaw:
    "Machines may refuse instantly. Machines may not authorize consequence. Human review may resolve toward a FundTrackerAI handoff, but cannot create payment authority, transaction truth, custody transfer, or runtime activation.",
  boundary: {
    machineCanRefuse: true,
    machineCannotAuthorizeConsequence: true,
    humanAuthorizationRequiredForConsequence: true,
    fundTrackerAIRemainsTransactionTruth: true,
    paiSafeRemainsDisplayOnly: true,
    finTechionAIRemainsOversightOnly: true,
    reviewQueueIsNotPaymentAuthority: true,
    reviewQueueIsNotTransactionTruth: true,
    reviewQueueIsNotCustodyTransfer: true,
    reviewQueueIsNotRuntimeActivation: true
  }
} as const;
