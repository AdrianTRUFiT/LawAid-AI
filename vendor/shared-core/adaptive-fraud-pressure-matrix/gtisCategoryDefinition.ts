import type { GTISCategoryDefinition } from "./adaptiveFraudPressureContracts";

export const GTIS_CATEGORY_DEFINITION: GTISCategoryDefinition = {
  categoryName: "TRANSACTION_TRUTH_GOVERNANCE",
  plainLanguageName: "Transaction Truth Governance",
  categoryClaim:
    "Transaction Truth Governance governs whether a transaction should become commercial reality before downstream consequence is allowed.",
  checkmateLine:
    "Every payment fraud system in the world is built to clean up after the transaction. GTIS governs whether the transaction should have happened.",
  categoryDistinction:
    "Fraud detection asks whether fraud occurred after movement. Transaction Truth Governance asks whether consequence should be authorized before movement becomes trusted reality.",
  notFraudDetection: true,
  notPaymentProcessing: true,
  notChargebackRecovery: true,
  governsPreActivationSeam: true,
  boundary: {
    transportIsNotTruth: true,
    processorSuccessIsNotTruth: true,
    artifactGovernedConsequenceIsTruth: true,
    humanAuthorizationRequiredAtExecutionBoundary: true
  }
};

