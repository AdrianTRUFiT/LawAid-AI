import { buildLawAidAIIntegrationSnapshot } from "../lib/lawaidai-integration";

const snapshot = buildLawAidAIIntegrationSnapshot({
  course: {
    onboardingComplete: true,
    trialStarted: true,
    paidPending: true,
    activated: true,
    complete: true,
    blocked: false,
    trapped: false,
    consequenceCheckpointId: "cp_192",
  },
  subscription: {
    planId: "annual_pro",
    subscriptionState: "active_annual",
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
    hasActivatedTransactionState: true,
    isDuplicateActivation: false,
    contradictoryState: false,
    blocked: false,
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
    anomalyPathReady: false,
    exactVsPartialReconciliationDefined: true,
  },
  consequenceAuthorized: true,
});

if (snapshot.shellMode !== "active") {
  console.error("LAW_AID_AI_INTEGRATION_ACTIVE_MODE_FAILED");
  console.error(snapshot.shellMode);
  process.exit(1);
}

if (!snapshot.visibleSections.overview || !snapshot.visibleSections.timeline || !snapshot.visibleSections.evidence) {
  console.error("LAW_AID_AI_INTEGRATION_ACTIVE_SECTIONS_FAILED");
  process.exit(1);
}

if (!snapshot.canEdit || !snapshot.canUseAI || snapshot.isReadOnly) {
  console.error("LAW_AID_AI_INTEGRATION_ACTIVE_PERMISSIONS_FAILED");
  process.exit(1);
}

console.log("LAW_AID_AI_INTEGRATION_ACTIVE=PASS");
console.log("SHELL_MODE=", snapshot.shellMode);
console.log("LAUNCH_READY=", snapshot.launchReady);
