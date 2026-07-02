import {
  createPaymentObligation,
  mintPaymentInstructionGuard,
  submitProcessorEvent,
  verifyInstructionGuard,
  getInstructionGuard,
  getInstructionGuards,
  getObligations,
  getSubmissions,
  getVerificationResults,
} from "../../lib/fundtracker/obligation";

export function createPaymentObligationApi(body: Parameters<typeof createPaymentObligation>[0]) {
  return {
    ok: true,
    artifactType: "PaymentObligation",
    payload: createPaymentObligation(body),
  };
}

export function mintPaymentInstructionGuardApi(body: Parameters<typeof mintPaymentInstructionGuard>[0]) {
  return {
    ok: true,
    artifactType: "PaymentInstructionGuard",
    payload: mintPaymentInstructionGuard(body),
  };
}

export function submitProcessorEventApi(body: Parameters<typeof submitProcessorEvent>[0]) {
  return {
    ok: true,
    artifactType: "ProcessorSubmission",
    payload: submitProcessorEvent(body),
  };
}

export function verifyInstructionGuardApi(body: Parameters<typeof verifyInstructionGuard>[0]) {
  return {
    ok: true,
    artifactType: "GuardVerificationResult",
    payload: verifyInstructionGuard(body),
  };
}

export function listPaymentObligationsApi() {
  return {
    ok: true,
    artifactType: "PaymentObligationList",
    payload: getObligations(),
  };
}

export function listInstructionGuardsApi() {
  return {
    ok: true,
    artifactType: "PaymentInstructionGuardList",
    payload: getInstructionGuards(),
  };
}

export function listConsumedInstructionGuardsApi() {
  return {
    ok: true,
    artifactType: "ConsumedPaymentInstructionGuardList",
    payload: getInstructionGuards().filter((item) => Boolean(item.consumedAt)),
  };
}

export function getInstructionGuardApi(instructionId: string) {
  const guard = getInstructionGuard(instructionId);

  if (!guard) {
    return {
      ok: false,
      message: `No instruction guard found for instructionId=${instructionId}`,
    };
  }

  return {
    ok: true,
    artifactType: "PaymentInstructionGuard",
    payload: guard,
  };
}

export function listProcessorSubmissionsApi() {
  return {
    ok: true,
    artifactType: "ProcessorSubmissionList",
    payload: getSubmissions(),
  };
}

export function listGuardVerificationResultsApi() {
  return {
    ok: true,
    artifactType: "GuardVerificationResultList",
    payload: getVerificationResults(),
  };
}

