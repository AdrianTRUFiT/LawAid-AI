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
  anomalyPathReady: false,
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

if (!snapshot.refusal.approved) {
  console.error("LAW_AID_AI_HARDENING_REFUSAL_FAILED");
  console.error(JSON.stringify(snapshot.refusal, null, 2));
  process.exit(1);
}

if (!snapshot.financial.valid) {
  console.error("LAW_AID_AI_FINANCIAL_VALIDATION_FAILED");
  console.error(JSON.stringify(snapshot.financial, null, 2));
  process.exit(1);
}

if (snapshot.shellGate !== "active_workspace") {
  console.error("LAW_AID_AI_SHELL_GATE_FAILED");
  console.error(snapshot.shellGate);
  process.exit(1);
}

if (!snapshot.launchReady) {
  console.error("LAW_AID_AI_LAUNCH_READY_FAILED");
  console.error(JSON.stringify(snapshot, null, 2));
  process.exit(1);
}

console.log("LAW_AID_AI_HARDENING_STATUS=PASS");
console.log("REFUSAL_CODES=", snapshot.refusal.refusalCodes.length);
console.log("FINANCIAL_VALID=", snapshot.financial.valid);
console.log("SHELL_GATE=", snapshot.shellGate);
console.log("LAUNCH_READY=", snapshot.launchReady);
