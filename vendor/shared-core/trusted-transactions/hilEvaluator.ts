import {
  HILResult,
  RefusalCode,
  TrustedTransactionScenario
} from "./trustedTransactionContracts";

export function evaluateTrustedTransactionHIL(
  scenario: TrustedTransactionScenario,
  now: Date = new Date("2026-04-30T12:00:00.000Z")
): HILResult {
  const refusalCodes: RefusalCode[] = [];

  if (!scenario.mic) {
    refusalCodes.push("MIC_MISSING");
  }

  if (scenario.mic) {
    if (scenario.mic.integrityHash !== scenario.mic.expectedIntegrityHash) {
      refusalCodes.push("MIC_HASH_FAILED");
    }

    if (
      scenario.mic.sender !== scenario.mic.expectedSender ||
      scenario.mic.receiver !== scenario.mic.expectedReceiver
    ) {
      refusalCodes.push("MIC_PARTY_BINDING_MISMATCH");
    }

    if (new Date(scenario.mic.routeExpiresAt).getTime() <= now.getTime()) {
      refusalCodes.push("MIC_ROUTE_EXPIRED");
    }
  }

  if (!scenario.miPlan) {
    refusalCodes.push("MI_PLAN_MISSING");
  }

  if (scenario.transport) {
    const failedCheckpoint = scenario.transport.checkpointEvents.some(
      (event) => event.status !== "PASSED"
    );

    const completedWithoutValidChain =
      scenario.transport.finalTransportStatus === "COMPLETE" &&
      (scenario.transport.checkpointEvents.length === 0 || failedCheckpoint);

    if (completedWithoutValidChain) {
      refusalCodes.push("WFC_INVALID_CHECKPOINT_CHAIN");
    }
  }

  if (!scenario.tis) {
    refusalCodes.push("TIS_EVALUATION_MISSING");
  }

  if (
    scenario.tis?.decision === "APPROVED" &&
    scenario.fundSeal?.financialTruthState !== "SEALED"
  ) {
    refusalCodes.push("TIS_APPROVED_WITHOUT_FUNDTRACKER_SEAL");
  }

  if (scenario.processorSuccess && scenario.fundSeal?.financialTruthState !== "SEALED") {
    refusalCodes.push("PROCESSOR_SUCCESS_WITHOUT_VERIFIED_STATE");
  }

  if (scenario.replayAttempt || scenario.tis?.decision === "REPLAY_ATTACK") {
    refusalCodes.push("REPLAY_AUTHORIZATION");
  }

  if (scenario.rvr && !scenario.trustedRecord) {
    refusalCodes.push("RVR_BEFORE_RECORD");
  }

  if (scenario.soulMarkRequested && scenario.fundSeal?.financialTruthState !== "SEALED") {
    refusalCodes.push("SOULMARK_BEFORE_TRUTH");
  }

  if (scenario.soulRegistryRequested && scenario.fundSeal?.financialTruthState !== "SEALED") {
    refusalCodes.push("SOULREGISTRY_BEFORE_TRUTH_SEAL");
  }

  if (scenario.fintechionaiRequested && !scenario.trustedRecord) {
    refusalCodes.push("FINTECHIONAI_BEFORE_TRUSTED_RECORD");
  }

  if (
    scenario.beeatsRequested &&
    scenario.trustedRecord?.finalState !== "RECORDED"
  ) {
    refusalCodes.push("BEEATS_BEFORE_FINAL_STATE");
  }

  const allowed = refusalCodes.length === 0;

  return {
    scenario: scenario.name,
    allowed,
    refusalCodes,
    blockedConsequence: !allowed,
    rvrAllowed: allowed && Boolean(scenario.rvr),
    trustedRecordExists: Boolean(scenario.trustedRecord)
  };
}
