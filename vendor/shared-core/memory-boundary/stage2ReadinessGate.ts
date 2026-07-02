import type {
  Stage2ReadinessDecision,
  Stage2ReadinessInput
} from "./stage2ReadinessContracts";

export function evaluateStage2Readiness(input: Stage2ReadinessInput): Stage2ReadinessDecision {
  const blockedReasons: string[] = [];

  if (!input.gap1SoulBaseAuthoritySealed) {
    blockedReasons.push("GAP_1_SOULBASEAI_AUTHORITY_NOT_SEALED");
  }

  if (!input.gap2CustodyTaxonomyReady) {
    blockedReasons.push("GAP_2_CUSTODY_TAXONOMY_NOT_READY");
  }

  if (!input.gap3BoundaryEnforcementReady) {
    blockedReasons.push("GAP_3_BOUNDARY_ENFORCEMENT_NOT_READY");
  }

  if (!input.gap4SoulMemoryGovernanceReady) {
    blockedReasons.push("GAP_4_SOULMEMORY_GOVERNANCE_NOT_READY");
  }

  if (!input.stage2ContractExplicitlyAuthorized) {
    blockedReasons.push("STAGE_2_CONTRACT_NOT_EXPLICITLY_AUTHORIZED");
  }

  const canOpenStage2ContractDesign = blockedReasons.length === 0;

  return {
    status: canOpenStage2ContractDesign
      ? "STAGE_2_READY_FOR_CONTRACT_DESIGN"
      : "STAGE_2_BLOCKED",
    canOpenStage2ContractDesign,
    blockedReasons,
    nextAuthorizedStep: canOpenStage2ContractDesign
      ? "Open Stage 2 — FundTrackerAI ? SoulBaseAI Artifact Contract."
      : "Do not open Stage 2 until all gaps are resolved and explicit authorization exists.",
    boundary: {
      readinessIsNotContract: true,
      readinessIsNotPaymentAuthority: true,
      readinessIsNotActivation: true,
      readinessIsNotCustodyTransfer: true,
      fundTrackerAIRemainsFinancialTruth: true,
      soulBaseAIRemainsMemorySubstrate: true,
      soulVaultRemainsCustodyPlane: true
    }
  };
}





