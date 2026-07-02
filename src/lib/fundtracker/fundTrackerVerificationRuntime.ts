import crypto from "node:crypto";
import {
  DEFAULT_GTIS_POLICY,
  GTIS_STATES,
  type ActivatedTransactionStateArtifact,
  type ActorId,
  type CorrelationId,
  type CurrencyCode,
  type GTISPolicy,
  type HumanReviewRequestedArtifact,
  type Instruction,
  type InstructionArtifact,
  type Obligation,
  type ObligationArtifact,
  type RefusalArtifact,
  type Submission,
  type SubmissionArtifact,
  type VerificationArtifact,
  makeId,
  nowIso,
  secureEqual,
  sha256,
} from "../gtis/gtisContracts";
import { GTISArtifactStore } from "../gtis/gtisArtifactStore";

export class FundTrackerVerificationRuntime {
  private readonly store: GTISArtifactStore;
  private readonly policy: GTISPolicy;
  private readonly consumedInstructionNonces = new Set<string>();
  private readonly consumedIdempotencyKeys = new Map<string, string>();

  constructor(store: GTISArtifactStore, policy: Partial<GTISPolicy> = {}) {
    this.store = store;
    this.policy = {
      ...DEFAULT_GTIS_POLICY,
      ...policy,
    };
  }

  createObligation(input: {
    correlationId: CorrelationId;
    actorId: ActorId;
    merchantId: string;
    amountMinor: number;
    currency: CurrencyCode;
    destinationRef: string;
    expiresAt: string;
    purpose: string;
    policyVersion: string;
  }): ObligationArtifact {
    const obligation: Obligation = {
      obligationId: makeId<"ObligationId">("obl"),
      correlationId: input.correlationId,
      actorId: input.actorId,
      merchantId: input.merchantId,
      amountMinor: input.amountMinor,
      currency: input.currency,
      destinationRef: input.destinationRef,
      createdAt: nowIso(),
      expiresAt: input.expiresAt,
      purpose: input.purpose,
      policyVersion: input.policyVersion,
      obligationHash: "",
    };

    obligation.obligationHash = sha256({
      correlationId: obligation.correlationId,
      actorId: obligation.actorId,
      merchantId: obligation.merchantId,
      amountMinor: obligation.amountMinor,
      currency: obligation.currency,
      destinationRef: obligation.destinationRef,
      expiresAt: obligation.expiresAt,
      purpose: obligation.purpose,
      policyVersion: obligation.policyVersion,
    });

    return this.store.append<ObligationArtifact>({
      type: "ObligationArtifact",
      correlationId: obligation.correlationId,
      state: GTIS_STATES.OBLIGATION_CREATED,
      payload: obligation,
    });
  }

  mintInstruction(obligationArtifact: ObligationArtifact): InstructionArtifact {
    const obligation = obligationArtifact.payload;

    const instruction: Instruction = {
      instructionId: makeId<"InstructionId">("ins"),
      obligationId: obligation.obligationId,
      correlationId: obligation.correlationId,
      actorId: obligation.actorId,
      amountMinor: obligation.amountMinor,
      currency: obligation.currency,
      destinationRef: obligation.destinationRef,
      createdAt: nowIso(),
      expiresAt: obligation.expiresAt,
      nonce: crypto.randomBytes(16).toString("hex"),
      integritySeal: "",
    };

    instruction.integritySeal = sha256({
      obligationId: instruction.obligationId,
      correlationId: instruction.correlationId,
      actorId: instruction.actorId,
      amountMinor: instruction.amountMinor,
      currency: instruction.currency,
      destinationRef: instruction.destinationRef,
      expiresAt: instruction.expiresAt,
      nonce: instruction.nonce,
    });

    return this.store.append<InstructionArtifact>({
      type: "InstructionArtifact",
      correlationId: instruction.correlationId,
      state: GTIS_STATES.INSTRUCTION_MINTED,
      payload: instruction,
    });
  }

  receiveSubmission(
    instructionArtifact: InstructionArtifact,
    input: {
      processorEventId: string;
      amountMinor: number;
      currency: CurrencyCode;
      destinationRef: string;
      idempotencyKey: string;
      processorStatus: "initiated" | "callback_received" | "charge_succeeded" | "charge_failed";
    }
  ): SubmissionArtifact {
    const submission: Submission = {
      submissionId: makeId<"SubmissionId">("sub"),
      instructionId: instructionArtifact.payload.instructionId,
      correlationId: instructionArtifact.payload.correlationId,
      processorEventId: input.processorEventId,
      receivedAt: nowIso(),
      amountMinor: input.amountMinor,
      currency: input.currency,
      destinationRef: input.destinationRef,
      idempotencyKey: input.idempotencyKey,
      processorStatus: input.processorStatus,
      payloadDigest: "",
    };

    submission.payloadDigest = sha256({
      processorEventId: submission.processorEventId,
      amountMinor: submission.amountMinor,
      currency: submission.currency,
      destinationRef: submission.destinationRef,
      idempotencyKey: submission.idempotencyKey,
      processorStatus: submission.processorStatus,
    });

    return this.store.append<SubmissionArtifact>({
      type: "SubmissionArtifact",
      correlationId: submission.correlationId,
      state: GTIS_STATES.SUBMISSION_RECEIVED,
      payload: submission,
    });
  }

  verify(
    obligationArtifact: ObligationArtifact,
    instructionArtifact: InstructionArtifact,
    submissionArtifact: SubmissionArtifact
  ): VerificationArtifact {
    const obligation = obligationArtifact.payload;
    const instruction = instructionArtifact.payload;
    const submission = submissionArtifact.payload;

    const reasons: string[] = [];
    let refusalCode: VerificationArtifact["payload"]["refusalCode"];
    let classification: VerificationArtifact["payload"]["classification"] = "VALID";
    let approved = true;
    let confidence = 0.99;

    const expectedObligationHash = sha256({
      correlationId: obligation.correlationId,
      actorId: obligation.actorId,
      merchantId: obligation.merchantId,
      amountMinor: obligation.amountMinor,
      currency: obligation.currency,
      destinationRef: obligation.destinationRef,
      expiresAt: obligation.expiresAt,
      purpose: obligation.purpose,
      policyVersion: obligation.policyVersion,
    });

    if (!secureEqual(expectedObligationHash, obligation.obligationHash)) {
      refusalCode = "OBLIGATION_INVALID";
      reasons.push("Obligation hash mismatch.");
    }

    const expectedInstructionSeal = sha256({
      obligationId: instruction.obligationId,
      correlationId: instruction.correlationId,
      actorId: instruction.actorId,
      amountMinor: instruction.amountMinor,
      currency: instruction.currency,
      destinationRef: instruction.destinationRef,
      expiresAt: instruction.expiresAt,
      nonce: instruction.nonce,
    });

    if (!secureEqual(expectedInstructionSeal, instruction.integritySeal)) {
      refusalCode ??= "INSTRUCTION_MUTATED";
      reasons.push("Instruction integrity seal mismatch.");
      this.store.updateMetrics((m) => ({
        ...m,
        mutationRefusalCount: m.mutationRefusalCount + 1,
      }));
    }

    const nowMs = Date.now();
    const obligationExpiryMs = Date.parse(obligation.expiresAt);
    const instructionExpiryMs = Date.parse(instruction.expiresAt);
    const submissionMs = Date.parse(submission.receivedAt);
    const instructionCreatedMs = Date.parse(instruction.createdAt);

    if (
      nowMs - this.policy.clockSkewMs > obligationExpiryMs ||
      nowMs - this.policy.clockSkewMs > instructionExpiryMs
    ) {
      refusalCode ??= "TIMING_EXPIRED";
      reasons.push("Instruction or obligation expired.");
    }

    if (
      submissionMs < instructionCreatedMs - this.policy.clockSkewMs ||
      submissionMs > obligationExpiryMs + this.policy.clockSkewMs
    ) {
      refusalCode ??= "TIMING_OUTSIDE_WINDOW";
      reasons.push("Submission is outside valid timing window.");
    }

    if (nowMs - submissionMs > this.policy.staleSubmissionWindowMs) {
      refusalCode ??= "STALE_SUBMISSION";
      reasons.push("Submission is stale.");
      this.store.updateMetrics((m) => ({
        ...m,
        staleSubmissionRefusalCount: m.staleSubmissionRefusalCount + 1,
      }));
    }

    if (
      submission.amountMinor !== obligation.amountMinor ||
      submission.amountMinor !== instruction.amountMinor
    ) {
      refusalCode ??= "AMOUNT_MISMATCH";
      reasons.push("Submission amount mismatch.");
    }

    if (
      submission.destinationRef !== obligation.destinationRef ||
      submission.destinationRef !== instruction.destinationRef
    ) {
      refusalCode ??= "DESTINATION_MISMATCH";
      reasons.push("Submission destination mismatch.");
    }

    if (this.consumedInstructionNonces.has(instruction.nonce)) {
      refusalCode ??= "REPLAY_DETECTED";
      reasons.push("Instruction nonce already consumed.");
      this.store.updateMetrics((m) => ({
        ...m,
        replayRefusalCount: m.replayRefusalCount + 1,
      }));
    }

    const priorForKey = this.consumedIdempotencyKeys.get(submission.idempotencyKey);
    if (priorForKey && priorForKey !== submission.submissionId) {
      refusalCode ??= "DUPLICATE_SUBMISSION";
      reasons.push("Idempotency key already consumed.");
      this.store.updateMetrics((m) => ({
        ...m,
        duplicateRefusalCount: m.duplicateRefusalCount + 1,
      }));
    }

    if (refusalCode) {
      classification = "REFUSED";
      approved = false;
      confidence = 0.99;
    } else if (submission.processorStatus !== "charge_succeeded") {
      classification = "REVIEW_REQUIRED";
      approved = false;
      confidence = 0.62;
      reasons.push("Processor signal insufficient for automatic consequence.");
    } else {
      reasons.push("Submission verified into trusted state.");
    }

    return this.store.append<VerificationArtifact>({
      type: "VerificationArtifact",
      correlationId: obligation.correlationId,
      state: GTIS_STATES.VERIFICATION_DECISION_MADE,
      payload: {
        approved,
        refusalCode,
        reasons,
        classification,
        confidence,
      },
    });
  }

  conclude(
    obligationArtifact: ObligationArtifact,
    instructionArtifact: InstructionArtifact,
    submissionArtifact: SubmissionArtifact,
    verificationArtifact: VerificationArtifact
  ): {
    finalArtifact: ActivatedTransactionStateArtifact | RefusalArtifact | HumanReviewRequestedArtifact;
    evidenceArtifactId: string;
  } {
    const obligation = obligationArtifact.payload;
    const instruction = instructionArtifact.payload;
    const submission = submissionArtifact.payload;
    const verification = verificationArtifact.payload;

    let finalArtifact:
      | ActivatedTransactionStateArtifact
      | RefusalArtifact
      | HumanReviewRequestedArtifact;

    if (verification.classification === "VALID") {
      this.consumedInstructionNonces.add(instruction.nonce);
      this.consumedIdempotencyKeys.set(submission.idempotencyKey, submission.submissionId);

      this.store.updateMetrics((m) => ({
        ...m,
        validFirstPassCount: m.validFirstPassCount + 1,
        activationCount: m.activationCount + 1,
      }));

      finalArtifact = this.store.append<ActivatedTransactionStateArtifact>({
        type: "ActivatedTransactionStateArtifact",
        correlationId: obligation.correlationId,
        state: GTIS_STATES.ACTIVATED_TRANSACTION_STATE_ISSUED,
        payload: {
          obligationId: obligation.obligationId,
          instructionId: instruction.instructionId,
          submissionId: submission.submissionId,
          processorEventId: submission.processorEventId,
          activationReason: "VERIFIED_TRUSTED_STATE",
        },
      });
    } else if (verification.classification === "REFUSED") {
      this.store.updateMetrics((m) => ({
        ...m,
        refusalCount: m.refusalCount + 1,
      }));

      finalArtifact = this.store.append<RefusalArtifact>({
        type: "RefusalArtifact",
        correlationId: obligation.correlationId,
        state: GTIS_STATES.REFUSAL_ARTIFACT_ISSUED,
        payload: {
          obligationId: obligation.obligationId,
          instructionId: instruction.instructionId,
          submissionId: submission.submissionId,
          refusalCode: verification.refusalCode ?? "AMBIGUOUS_STATE",
          reasons: verification.reasons,
        },
      });
    } else {
      this.store.updateMetrics((m) => ({
        ...m,
        humanReviewCount: m.humanReviewCount + 1,
      }));

      finalArtifact = this.store.append<HumanReviewRequestedArtifact>({
        type: "HumanReviewRequestedArtifact",
        correlationId: obligation.correlationId,
        state: GTIS_STATES.HUMAN_REVIEW_REQUIRED,
        payload: {
          obligationId: obligation.obligationId,
          instructionId: instruction.instructionId,
          submissionId: submission.submissionId,
          reviewReason: "CONTRADICTORY_SIGNAL",
          reasons: verification.reasons,
        },
      });
    }

    const evidence = this.store.bindEvidence(obligation.correlationId, [
      obligationArtifact.artifactId,
      instructionArtifact.artifactId,
      submissionArtifact.artifactId,
      verificationArtifact.artifactId,
      finalArtifact.artifactId,
    ]);

    return {
      finalArtifact,
      evidenceArtifactId: evidence.artifactId,
    };
  }

  assertConsequenceAuthorized(correlationId: CorrelationId): ActivatedTransactionStateArtifact {
    return this.store.assertConsequenceAuthorized(correlationId);
  }

  getStore(): GTISArtifactStore {
    return this.store;
  }
}
