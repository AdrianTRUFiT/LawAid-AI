import { GIRRuntimeResult } from "./girContracts";

export interface GIRAuditRecord {
  timestamp: string;
  domain: string;
  transition: string;
  resultState: string;
  eligibleToProceed: boolean;
  refusalReasons: string[];
  doctrine: string;
}

export function createGIRAuditRecord(result: GIRRuntimeResult): GIRAuditRecord {
  return {
    timestamp: new Date().toISOString(),
    domain: result.domain,
    transition: `${result.currentStage}->${result.targetStage}`,
    resultState: result.resultState,
    eligibleToProceed: result.eligibleToProceed,
    refusalReasons: result.refusalReasons,
    doctrine: "GIR evaluates transition eligibility only. GIR does not authorize consequence."
  };
}
