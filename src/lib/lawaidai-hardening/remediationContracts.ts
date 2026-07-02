import type {
  FinancialWorkspaceValidation,
  LawAidAIHardeningSnapshot,
  LawAidAIRefusalCode,
} from "./hardeningContracts";

export type RemediationSeverity = "high" | "medium" | "low";

export interface RemediationItem {
  id: string;
  code: LawAidAIRefusalCode | "ANOMALY_PATH_INCOMPLETE";
  title: string;
  description: string;
  severity: RemediationSeverity;
  owner: "workflow" | "financial" | "activation" | "shell";
}

export interface FinancialCleanupSummary {
  valid: boolean;
  blockers: string[];
  warnings: string[];
  remediationItems: RemediationItem[];
}

export interface LaunchBlockerReport {
  launchReady: boolean;
  blockerCount: number;
  warningCount: number;
  blockers: string[];
  warnings: string[];
  remediationItems: RemediationItem[];
  shellGate: LawAidAIHardeningSnapshot["shellGate"];
}
