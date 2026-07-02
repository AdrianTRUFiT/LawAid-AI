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
  trapped: true,
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
    courseTrapped: true,
    consequenceAuthorized: true,
    subscriptionState: "active_annual",
  },
});

if (snapshot.refusal.approved) {
  console.error("NEGATIVE_TRAPPED_SHOULD_REFUSE");
  process.exit(1);
}

if (snapshot.shellGate !== "blocked") {
  console.error("NEGATIVE_TRAPPED_SHELL_GATE_SHOULD_BE_BLOCKED");
  process.exit(1);
}

console.log("LAW_AID_AI_NEGATIVE_TRAPPED=PASS");
