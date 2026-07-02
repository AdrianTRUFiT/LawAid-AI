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
  hasActivatedTransactionState: false,
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
    consequenceAuthorized: false,
    subscriptionState: "active_annual",
  },
});

if (snapshot.refusal.approved) {
  console.error("NEGATIVE_MISSING_ATS_SHOULD_REFUSE");
  process.exit(1);
}

if (!snapshot.refusal.refusalCodes.includes("MISSING_ACTIVATED_TRANSACTION_STATE")) {
  console.error("NEGATIVE_MISSING_ATS_CODE_MISSING");
  process.exit(1);
}

if (snapshot.launchReady) {
  console.error("NEGATIVE_MISSING_ATS_LAUNCH_READY_SHOULD_BE_FALSE");
  process.exit(1);
}

console.log("LAW_AID_AI_NEGATIVE_MISSING_ATS=PASS");
