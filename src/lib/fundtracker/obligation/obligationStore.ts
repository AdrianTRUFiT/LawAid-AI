import type {
  GuardVerificationResult,
  PaymentInstructionGuard,
  PaymentObligation,
  ProcessorSubmission,
} from "./obligationContracts";

const obligations: PaymentObligation[] = [];
const instructionGuards: PaymentInstructionGuard[] = [];
const submissions: ProcessorSubmission[] = [];
const verificationResults: Array<{
  instructionId: string;
  result: GuardVerificationResult;
}> = [];

export function resetObligationStore(): void {
  obligations.length = 0;
  instructionGuards.length = 0;
  submissions.length = 0;
  verificationResults.length = 0;
}

export function addObligation(obligation: PaymentObligation): PaymentObligation {
  obligations.push(obligation);
  return obligation;
}

export function addInstructionGuard(guard: PaymentInstructionGuard): PaymentInstructionGuard {
  instructionGuards.push(guard);
  return guard;
}

export function addSubmission(submission: ProcessorSubmission): ProcessorSubmission {
  submissions.push(submission);
  return submission;
}

export function addVerificationResult(
  instructionId: string,
  result: GuardVerificationResult,
) {
  verificationResults.push({ instructionId, result });
}

export function getObligation(obligationId: string): PaymentObligation | null {
  return obligations.find((item) => item.obligationId === obligationId) ?? null;
}

export function getInstructionGuard(instructionId: string): PaymentInstructionGuard | null {
  return instructionGuards.find((item) => item.instructionId === instructionId) ?? null;
}

export function getObligations(): PaymentObligation[] {
  return [...obligations];
}

export function getInstructionGuards(): PaymentInstructionGuard[] {
  return [...instructionGuards];
}

export function getSubmissions(): ProcessorSubmission[] {
  return [...submissions];
}

export function getVerificationResults() {
  return [...verificationResults];
}

export function countSubmissionsForInstruction(instructionId: string): number {
  return submissions.filter((item) => item.instructionId === instructionId).length;
}

export function hasSubmissionReplay(
  submission: ProcessorSubmission,
): boolean {
  const matches = submissions.filter((item) =>
    item.instructionId === submission.instructionId &&
    item.processorReference === submission.processorReference &&
    item.transactionId === submission.transactionId,
  );

  return matches.length > 1;
}

export function updateInstructionGuard(
  instructionId: string,
  updater: (guard: PaymentInstructionGuard) => PaymentInstructionGuard,
): PaymentInstructionGuard | null {
  const index = instructionGuards.findIndex((item) => item.instructionId === instructionId);
  if (index < 0) {
    return null;
  }

  instructionGuards[index] = updater(instructionGuards[index]);
  return instructionGuards[index];
}

export function updateObligation(
  obligationId: string,
  updater: (obligation: PaymentObligation) => PaymentObligation,
): PaymentObligation | null {
  const index = obligations.findIndex((item) => item.obligationId === obligationId);
  if (index < 0) {
    return null;
  }

  obligations[index] = updater(obligations[index]);
  return obligations[index];
}

