import {
  buildLawAidAIHardeningSnapshot,
  buildLaunchBlockerReport,
  type FinancialWorkspaceSnapshot,
  type LawAidAIRefusalInput,
} from "../lib/lawaidai-hardening";

const refusalInput: LawAidAIRefusalInput = {
  expectedTargetEnvironment: "LawAidAI",
  fields: {
    matterId: "matter_001",
    userId: "user_001",
    shellId: "shell_001",
    targetEnvironment: "OtherEnv",
  },
  hasReviewedShell: true,
  hasActivatedTransactionState: true,
  isDuplicateActivation: false,
  contradictoryState: false,
  blocked: false,
  trapped: false,
  financialMappingValid: true,
  queueReady: true,
  confirmationReady: true,
  reconciliationValid: true,
};

const financialSnapshot: FinancialWorkspaceSnapshot = {
  payeeMapped: true,
  sourceMapped: true,
  queueReady: true,
  confirmationReady: true,
  anomalyPathReady: true,
  exactVsPartialReconciliationDefined: true,
};

const snapshot = buildLawAidAIHardeningSnapshot({
  refusalInput,
  financialSnapshot,
  governedState: {
    courseBlocked: false,
    courseTrapped: false,
    consequenceAuthorized: true,
    subscriptionState: "active_annual",
  },
});

const report = buildLaunchBlockerReport(snapshot);

if (snapshot.refusal.approved) {
  console.error("NEGATIVE_WRONG_TARGET_SHOULD_REFUSE");
  process.exit(1);
}

if (!snapshot.refusal.refusalCodes.includes("WRONG_TARGET")) {
  console.error("NEGATIVE_WRONG_TARGET_CODE_MISSING");
  process.exit(1);
}

if (report.blockerCount < 1) {
  console.error("NEGATIVE_WRONG_TARGET_REPORT_MISSING");
  process.exit(1);
}

console.log("LAW_AID_AI_NEGATIVE_WRONG_TARGET=PASS");
