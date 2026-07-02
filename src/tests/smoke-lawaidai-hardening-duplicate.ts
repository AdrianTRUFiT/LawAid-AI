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
  isDuplicateActivation: true,
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

if (snapshot.refusal.approved) {
  console.error("NEGATIVE_DUPLICATE_SHOULD_REFUSE");
  process.exit(1);
}

if (!snapshot.refusal.refusalCodes.includes("DUPLICATE_ACTIVATION")) {
  console.error("NEGATIVE_DUPLICATE_CODE_MISSING");
  process.exit(1);
}

console.log("LAW_AID_AI_NEGATIVE_DUPLICATE=PASS");
