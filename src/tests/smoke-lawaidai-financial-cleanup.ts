import {
  buildFinancialCleanupSummary,
  type FinancialWorkspaceSnapshot,
} from "../lib/lawaidai-hardening";

const snapshot: FinancialWorkspaceSnapshot = {
  payeeMapped: false,
  sourceMapped: true,
  queueReady: false,
  confirmationReady: false,
  anomalyPathReady: false,
  exactVsPartialReconciliationDefined: false,
};

const summary = buildFinancialCleanupSummary(snapshot);

if (summary.valid) {
  console.error("FINANCIAL_CLEANUP_SUMMARY_SHOULD_BE_INVALID");
  process.exit(1);
}

if (summary.remediationItems.length < 4) {
  console.error("FINANCIAL_CLEANUP_SUMMARY_REMEDIATION_TOO_SMALL");
  process.exit(1);
}

console.log("LAW_AID_AI_FINANCIAL_CLEANUP_SUMMARY=PASS");
