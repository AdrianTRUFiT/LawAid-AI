export type FundTrackerTruthSeal = {
  truthSealId: string;
  verifiedOpportunityId: string;
  micId: string;
  processorEventReferences: string[];
  commitmentState: "VERIFIED" | "HELD" | "REFUSED";
  financialTruthState: "SEALED" | "NOT_SEALED";
  entitlementState: "ELIGIBLE" | "NOT_ELIGIBLE";
  activationEligibility: "ELIGIBLE_FOR_ACTIVATED_TRANSACTION_STATE" | "NOT_ELIGIBLE";
  sealTimestamp: string;
  proofReferences: string[];
  activatedTransactionStateId?: string;
  sealedBy: "FundTrackerAI";
};

export type SoulMarkProofStamp = {
  soulMarkId: string;
  trustedTransactionId: string;
  stampedAt: string;
  proofHash: string;
  createsFinancialTruth: false;
};

export type SoulRegistryRecordPointer = {
  soulRegistryReference: string;
  trustedTransactionId: string;
  recordedAt: string;
  preserved: true;
  createsFinancialTruth: false;
};

export function assertFundTrackerSealIsTruth(seal: FundTrackerTruthSeal): true {
  if (seal.sealedBy !== "FundTrackerAI") {
    throw new Error("FUNDTRACKER_BOUNDARY_BREACH: only FundTrackerAI seals financial truth.");
  }
  if (seal.financialTruthState !== "SEALED") {
    throw new Error("FUNDTRACKER_TRUTH_NOT_SEALED");
  }
  return true;
}
