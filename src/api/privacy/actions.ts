import {
  applyRedactionPolicy,
  exportSubjectAccessBundleToFile,
  getPrivacyPolicyExceptions,
  resetPrivacyPolicyExceptions,
  runRetentionSweep,
} from "../../lib/privacy/actions";
import {
  buildPrivacyDashboardSnapshot,
  createChargebackHold,
  getChargebackHolds,
  getPrivacyActionReceipts,
  getPrivacyApprovalQueue,
  releaseChargebackHold,
  resetChargebackHolds,
  resetPrivacyActionReceipts,
  resetPrivacyApprovalQueue,
  updatePrivacyApprovalStatus,
} from "../../lib/privacy/governance";

export function applyRedactionPolicyApi(
  artifactType: string,
  payload: Record<string, unknown>,
) {
  return {
    ok: true,
    artifactType: "PrivacyRedactionResult",
    payload: applyRedactionPolicy(artifactType, payload),
  };
}

export function runRetentionSweepApi(referenceDate?: string) {
  return {
    ok: true,
    artifactType: "RetentionSweepResult",
    payload: runRetentionSweep(referenceDate),
  };
}

export function getPrivacyPolicyExceptionsApi() {
  return {
    ok: true,
    artifactType: "PrivacyPolicyExceptionList",
    payload: getPrivacyPolicyExceptions(),
  };
}

export function resetPrivacyPolicyExceptionsApi() {
  resetPrivacyPolicyExceptions();
  return {
    ok: true,
    artifactType: "PrivacyPolicyExceptionReset",
    payload: { reset: true },
  };
}

export function exportSubjectAccessBundleToFileApi(subjectId: string) {
  return {
    ok: true,
    artifactType: "SubjectAccessExportFile",
    payload: exportSubjectAccessBundleToFile(subjectId),
  };
}

export function getPrivacyActionReceiptsApi() {
  return {
    ok: true,
    artifactType: "PrivacyActionReceiptList",
    payload: getPrivacyActionReceipts(),
  };
}

export function resetPrivacyActionReceiptsApi() {
  resetPrivacyActionReceipts();
  return {
    ok: true,
    artifactType: "PrivacyActionReceiptReset",
    payload: { reset: true },
  };
}

export function getPrivacyApprovalQueueApi() {
  return {
    ok: true,
    artifactType: "PrivacyApprovalQueue",
    payload: getPrivacyApprovalQueue(),
  };
}

export function resetPrivacyApprovalQueueApi() {
  resetPrivacyApprovalQueue();
  return {
    ok: true,
    artifactType: "PrivacyApprovalQueueReset",
    payload: { reset: true },
  };
}

export function updatePrivacyApprovalStatusApi(
  approvalId: string,
  status: "approved" | "rejected",
) {
  const item = updatePrivacyApprovalStatus(approvalId, status);

  if (!item) {
    return {
      ok: false,
      message: `No privacy approval item found for approvalId=${approvalId}`,
    };
  }

  return {
    ok: true,
    artifactType: "PrivacyApprovalStatusUpdate",
    payload: item,
  };
}

export function createChargebackHoldApi(
  transactionId: string,
  reason: string,
  artifactType?: string,
) {
  return {
    ok: true,
    artifactType: "ChargebackHoldRecord",
    payload: createChargebackHold(transactionId, reason, artifactType),
  };
}

export function getChargebackHoldsApi() {
  return {
    ok: true,
    artifactType: "ChargebackHoldList",
    payload: getChargebackHolds(),
  };
}

export function releaseChargebackHoldApi(holdId: string) {
  const hold = releaseChargebackHold(holdId);

  if (!hold) {
    return {
      ok: false,
      message: `No chargeback hold found for holdId=${holdId}`,
    };
  }

  return {
    ok: true,
    artifactType: "ChargebackHoldRelease",
    payload: hold,
  };
}

export function resetChargebackHoldsApi() {
  resetChargebackHolds();
  return {
    ok: true,
    artifactType: "ChargebackHoldReset",
    payload: { reset: true },
  };
}

export function getPrivacyDashboardSnapshotApi() {
  return {
    ok: true,
    artifactType: "PrivacyDashboardSnapshot",
    payload: buildPrivacyDashboardSnapshot(),
  };
}
