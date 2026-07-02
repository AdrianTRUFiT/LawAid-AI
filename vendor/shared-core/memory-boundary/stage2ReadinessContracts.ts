export type Stage2ReadinessStatus =
  | "STAGE_2_READY_FOR_CONTRACT_DESIGN"
  | "STAGE_2_BLOCKED";

export interface Stage2ReadinessInput {
  gap1SoulBaseAuthoritySealed: boolean;
  gap2CustodyTaxonomyReady: boolean;
  gap3BoundaryEnforcementReady: boolean;
  gap4SoulMemoryGovernanceReady: boolean;
  stage2ContractExplicitlyAuthorized: boolean;
}

export interface Stage2ReadinessDecision {
  status: Stage2ReadinessStatus;
  canOpenStage2ContractDesign: boolean;
  blockedReasons: string[];
  nextAuthorizedStep: string;
  boundary: {
    readinessIsNotContract: true;
    readinessIsNotPaymentAuthority: true;
    readinessIsNotActivation: true;
    readinessIsNotCustodyTransfer: true;
    fundTrackerAIRemainsFinancialTruth: true;
    soulBaseAIRemainsMemorySubstrate: true;
    soulVaultRemainsCustodyPlane: true;
  };
}





