import crypto from "node:crypto";
import type {
  GuardVerificationResult,
  PaymentInstructionGuard,
  PaymentObligation,
  ProcessorSubmission,
  ValueStoreType,
} from "./obligationContracts";
import {
  addInstructionGuard,
  addObligation,
  addSubmission,
  addVerificationResult,
  countSubmissionsForInstruction,
  getInstructionGuard,
  hasSubmissionReplay,
  updateInstructionGuard,
  updateObligation,
} from "./obligationStore";

function nowIso(): string {
  return new Date().toISOString();
}

function futureIso(minutes: number): string {
  return new Date(Date.now() + minutes * 60_000).toISOString();
}

function id(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

function nonce(): string {
  return crypto.randomBytes(16).toString("hex");
}

function secret(): string {
  return process.env.FUNDTRACKER_GUARD_SECRET ?? "fundtracker-local-dev-secret";
}

function buildCommitmentPayload(input: {
  obligationId: string;
  merchantId: string;
  consumerRef: string;
  amount: number;
  currency: string;
  destinationRef: string;
  nonce: string;
  expiresAt: string;
}) {
  return [
    input.obligationId,
    input.merchantId,
    input.consumerRef,
    input.amount.toFixed(2),
    input.currency,
    input.destinationRef,
    input.nonce,
    input.expiresAt,
  ].join("|");
}

function hmac(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex");
}

export function createPaymentObligation(input: {
  merchantId: string;
  consumerRef: string;
  valueStoreType: ValueStoreType;
  amount: number;
  currency: string;
  purpose: string;
  dueAt?: string;
  proofRequirements?: string[];
}): PaymentObligation {
  const obligation: PaymentObligation = {
    obligationId: id("obl"),
    merchantId: input.merchantId,
    consumerRef: input.consumerRef,
    valueStoreType: input.valueStoreType,
    amount: input.amount,
    currency: input.currency,
    purpose: input.purpose,
    dueAt: input.dueAt,
    createdAt: nowIso(),
    status: "created",
    proofRequirements: input.proofRequirements ?? [],
  };

  return addObligation(obligation);
}

export function mintPaymentInstructionGuard(input: {
  obligationId: string;
  merchantId: string;
  consumerRef: string;
  amount: number;
  currency: string;
  destinationRef: string;
  ttlMinutes?: number;
}): PaymentInstructionGuard {
  const expiresAt = futureIso(input.ttlMinutes ?? 15);
  const guardNonce = nonce();

  const commitmentPayload = buildCommitmentPayload({
    obligationId: input.obligationId,
    merchantId: input.merchantId,
    consumerRef: input.consumerRef,
    amount: input.amount,
    currency: input.currency,
    destinationRef: input.destinationRef,
    nonce: guardNonce,
    expiresAt,
  });

  const guard: PaymentInstructionGuard = {
    instructionId: id("instr"),
    obligationId: input.obligationId,
    merchantId: input.merchantId,
    consumerRef: input.consumerRef,
    amount: input.amount,
    currency: input.currency,
    destinationRef: input.destinationRef,
    nonce: guardNonce,
    expiresAt,
    commitmentHash: hmac(commitmentPayload),
    createdAt: nowIso(),
    status: "minted",
  };

  addInstructionGuard(guard);

  updateObligation(input.obligationId, (obligation) => ({
    ...obligation,
    status: "instruction_minted",
  }));

  return guard;
}

export function submitProcessorEvent(
  submission: ProcessorSubmission,
): ProcessorSubmission {
  addSubmission(submission);

  updateInstructionGuard(submission.instructionId, (guard) => ({
    ...guard,
    status: guard.status === "minted" ? "submitted" : guard.status,
  }));

  return submission;
}

export function verifyInstructionGuard(
  submission: ProcessorSubmission,
): GuardVerificationResult {
  const guard = getInstructionGuard(submission.instructionId);
  const reasons: string[] = [];

  if (!guard) {
    const result: GuardVerificationResult = {
      allowed: false,
      status: "refused",
      reasons: ["unknown_instruction"],
      evaluatedAt: nowIso(),
    };
    addVerificationResult(submission.instructionId, result);
    return result;
  }

  const replayDetected = hasSubmissionReplay(submission);
  const submissionCount = countSubmissionsForInstruction(submission.instructionId);

  if (guard.consumedAt) {
    reasons.push("instruction_already_consumed");
  }

  if (submissionCount > 1) {
    reasons.push("duplicate_submission");
  }

  if (replayDetected) {
    reasons.push("replay_detected");
  }

  const expired = new Date(guard.expiresAt).getTime() < Date.now();
  if (expired) {
    reasons.push("instruction_expired");
  }

  if (guard.amount !== submission.amount) {
    reasons.push("amount_mismatch");
  }

  if (guard.currency !== submission.currency) {
    reasons.push("currency_mismatch");
  }

  if (guard.destinationRef !== submission.destinationRef) {
    reasons.push("destination_mismatch");
  }

  if (guard.merchantId !== submission.merchantId) {
    reasons.push("merchant_mismatch");
  }

  const recomputedPayload = buildCommitmentPayload({
    obligationId: guard.obligationId,
    merchantId: guard.merchantId,
    consumerRef: guard.consumerRef,
    amount: guard.amount,
    currency: guard.currency,
    destinationRef: guard.destinationRef,
    nonce: guard.nonce,
    expiresAt: guard.expiresAt,
  });

  const expectedHash = hmac(recomputedPayload);
  if (expectedHash !== guard.commitmentHash) {
    reasons.push("commitment_hash_mismatch");
  }

  const result: GuardVerificationResult = {
    allowed: reasons.length === 0,
    status: expired ? "expired" : reasons.length === 0 ? "verified" : "refused",
    reasons,
    evaluatedAt: nowIso(),
  };

  updateInstructionGuard(submission.instructionId, (current) => ({
    ...current,
    status: result.status,
    consumedAt: result.allowed ? nowIso() : current.consumedAt,
  }));

  updateObligation(guard.obligationId, (obligation) => ({
    ...obligation,
    status: result.status,
  }));

  addVerificationResult(submission.instructionId, result);

  return result;
}
