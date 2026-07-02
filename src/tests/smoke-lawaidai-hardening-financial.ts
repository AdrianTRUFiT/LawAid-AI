import {
  buildLawAidAIHardeningSnapshot,
  type FinancialWorkspaceSnapshot,
  type LawAidAIRefusalInput,
} from "../lib/lawaidai-hardening";

const refusalInput: LawAidAIRefusalInput = {
  expectedTargetEnvironment: "LawAidAI",
  fields: {
    matterId: "matter_001",
    userId: "user_001",
    shellId: "shell_001",
    targetEnvironment: "LawAidAI",
  },
  hasReviewedShell: true,
  hasActivatedTransactionState: true,
  isDuplicateActivation: false,
  contradictoryState: false,
  blocked: false,
  trapped: false,
  financialMappingValid: false,
  queueReady: false,
  confirmationReady: false,
  reconciliationValid: false,
};

const financialSnapshot: FinancialWorkspaceSnapshot = {
  payeeMapped: false,
  sourceMapped: false,
  queueReady: false,
  confirmationReady: false,
  anomalyPathReady: false,
  exactVsPartialReconciliationDefined: false,
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

if (snapshot.refusal.approved) {
  console.error("NEGATIVE_FINANCIAL_REFUSAL_SHOULD_REFUSE");
  process.exit(1);
}

if (snapshot.financial.valid) {
  console.error("NEGATIVE_FINANCIAL_VALIDATION_SHOULD_FAIL");
  process.exit(1);
}

if (snapshot.launchReady) {
  console.error("NEGATIVE_FINANCIAL_LAUNCH_READY_SHOULD_BE_FALSE");
  process.exit(1);
}

console.log("LAW_AID_AI_NEGATIVE_FINANCIAL=PASS");
