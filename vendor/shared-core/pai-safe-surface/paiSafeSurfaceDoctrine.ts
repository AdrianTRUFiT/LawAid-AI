export const PAI_SAFE_SURFACE_DOCTRINE = {
  name: "PAI-SAFE",
  class: "BRANDED_CONSUMER_FACING_SURFACE",
  scope: "PRODUCT_MARKET_SURFACE",
  authority: "NONE",
  truthSource: "FundTrackerAI + shared-core artifacts",
  oversightConsumer: "FinTechionAI",
  status: "APPROVED_AS_BRANDED_SURFACE_NOT_CANONICAL_AUTHORITY_LAYER",
  consumerPromise:
    "When you PAI-SAFE, the transaction was governed before it moved.",
  architectureSafeDefinition:
    "PAI-SAFE surfaces a governed payment experience where transaction movement is checked through FundTrackerAI before downstream activation is allowed.",
  oneLineSummary:
    "PAI-SAFE is the consumer-facing promise; FundTrackerAI is the transaction truth; FinTechionAI is operator oversight; shared-core / GTIS is the governed infrastructure that keeps all of it bounded.",
  boundary: {
    paiSafeIsNotAuthorityLayer: true,
    paiSafeIsNotTransactionTruthEngine: true,
    paiSafeIsNotFinTechionAI: true,
    paiSafeIsNotUmbrellaOverFundTrackerAI: true,
    fundTrackerAIRemainsTransactGovernorInsideRATE: true,
    finTechionAIConsumesAndInterpretsButDoesNotCommandTransactionTruth: true,
    gtisIsInfrastructureDescriptorOnlyUnlessSeparatelyVerified: true
  }
} as const;

export const CANONICAL_PAYMENT_LAW = {
  processorEventIsNotTransactionTruth: true,
  paymentMovementIsNotVerifiedCommitment: true,
  checkoutSuccessIsNotActivationAuthority: true,
  fundTrackerAIVerifiesCommitment: true,
  activatedTransactionStateUnlocksDownstreamEligibility: true
} as const;

