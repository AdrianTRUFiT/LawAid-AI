import type { FinancialWorkspaceSnapshot } from "./hardeningContracts";
import type { FinancialCleanupSummary, RemediationItem } from "./remediationContracts";
import { mapRefusalCodesToRemediation } from "./remediationMap";
import { validateFinancialWorkspace } from "./financialWorkspaceValidators";

export function buildFinancialCleanupSummary(
  snapshot: FinancialWorkspaceSnapshot
): FinancialCleanupSummary {
  const validation = validateFinancialWorkspace(snapshot);
  const warnings: string[] = [];
  const remediationItems: RemediationItem[] = [
    ...mapRefusalCodesToRemediation(validation.codes),
  ];

  if (!snapshot.anomalyPathReady) {
    warnings.push("Anomaly resolution path is not yet complete.");
    remediationItems.push({
      id: "rem_anomaly_path_incomplete",
      code: "ANOMALY_PATH_INCOMPLETE",
      title: "Complete anomaly path",
      description: "Anomaly resolution exists conceptually but still needs implementation completion.",
      severity: "medium",
      owner: "financial",
    });
  }

  return {
    valid: validation.valid,
    blockers: validation.explanation.filter((item) => item !== "Anomaly resolution path is not yet complete."),
    warnings,
    remediationItems,
  };
}
