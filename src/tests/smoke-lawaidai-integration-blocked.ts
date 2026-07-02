import { buildLawAidAIIntegrationSnapshot } from "../lib/lawaidai-integration";

const snapshot = buildLawAidAIIntegrationSnapshot({
  course: {
    onboardingComplete: true,
    trialStarted: false,
    paidPending: false,
    activated: false,
    complete: false,
    blocked: true,
    trapped: false,
    consequenceCheckpointId: "cp_192",
  },
  subscription: {
    planId: "monthly_flex",
    subscriptionState: "none",
  },
  refusalInput: {
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
    blocked: true,
    trapped: false,
    financialMappingValid: true,
    queueReady: true,
    confirmationReady: true,
    reconciliationValid: true,
  },
  financialSnapshot: {
    payeeMapped: true,
    sourceMapped: true,
    queueReady: true,
    confirmationReady: true,
    anomalyPathReady: true,
    exactVsPartialReconciliationDefined: true,
  },
  consequenceAuthorized: false,
});

if (snapshot.shellMode !== "blocked") {
  console.error("LAW_AID_AI_INTEGRATION_BLOCKED_MODE_FAILED");
  console.error(snapshot.shellMode);
  process.exit(1);
}

if (!snapshot.visibleSections.billing || !snapshot.visibleSections.activation) {
  console.error("LAW_AID_AI_INTEGRATION_BLOCKED_SECTIONS_FAILED");
  process.exit(1);
}

if (snapshot.canEdit || snapshot.canUseAI) {
  console.error("LAW_AID_AI_INTEGRATION_BLOCKED_PERMISSIONS_FAILED");
  process.exit(1);
}

console.log("LAW_AID_AI_INTEGRATION_BLOCKED=PASS");
console.log("SHELL_MODE=", snapshot.shellMode);
