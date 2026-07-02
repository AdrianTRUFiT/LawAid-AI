export type RvrReceipt = {
  rvrReceiptId: string;
  trustedTransactionId: string;
  requestSummary: string;
  verificationSummary: string;
  recordSummary: string;
  soulMarkId: string;
  soulRegistryReference: string;
  receiptStatus: "RVR_COMPLETE";
  issuedAt: string;
  consumerSafeLanguage: string;
  displayCreatesTruth: false;
};

export type TrustedTransactionRecord = {
  trustedTransactionId: string;
  requestId: string;
  micId: string;
  tisEvaluationId: string;
  fundTrackerTruthSealId: string;
  rvrReceiptId: string;
  soulMarkId: string;
  soulRegistryReference: string;
  finalState: "RECORDED";
  createdAt: string;
  completedAt: string;
  auditSummary: string;
  createdFromRailSuccessOnly: false;
};

export function assertReceiptBoundary(receipt: RvrReceipt): true {
  if (receipt.displayCreatesTruth !== false) {
    throw new Error("RECEIPT_BOUNDARY_BREACH: display must not create truth.");
  }
  return true;
}
