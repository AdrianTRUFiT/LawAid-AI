import crypto from "node:crypto";

export type Brand<T, K extends string> = T & { readonly __brand: K };

export type CorrelationId = Brand<string, "CorrelationId">;
export type ObligationId = Brand<string, "ObligationId">;
export type InstructionId = Brand<string, "InstructionId">;
export type SubmissionId = Brand<string, "SubmissionId">;
export type ArtifactId = Brand<string, "ArtifactId">;
export type ActorId = Brand<string, "ActorId">;
export type CurrencyCode = Brand<string, "CurrencyCode">;

export function makeId<T extends string>(prefix: string): Brand<string, T> {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}` as Brand<string, T>;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function sha256(input: unknown): string {
  return crypto.createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

export function secureEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(a, b);
}

export const GTIS_STATES = {
  OBLIGATION_CREATED: "OBLIGATION_CREATED",
  INSTRUCTION_MINTED: "INSTRUCTION_MINTED",
  SUBMISSION_RECEIVED: "SUBMISSION_RECEIVED",
  VERIFICATION_DECISION_MADE: "VERIFICATION_DECISION_MADE",
  ACTIVATED_TRANSACTION_STATE_ISSUED: "ACTIVATED_TRANSACTION_STATE_ISSUED",
  REFUSAL_ARTIFACT_ISSUED: "REFUSAL_ARTIFACT_ISSUED",
  HUMAN_REVIEW_REQUIRED: "HUMAN_REVIEW_REQUIRED",
  EVIDENCE_PACKAGE_BOUND: "EVIDENCE_PACKAGE_BOUND",
} as const;

export type GTISState = (typeof GTIS_STATES)[keyof typeof GTIS_STATES];

export type VerificationClassification = "VALID" | "REFUSED" | "REVIEW_REQUIRED";

export type RefusalCode =
  | "OBLIGATION_INVALID"
  | "INSTRUCTION_MUTATED"
  | "TIMING_EXPIRED"
  | "TIMING_OUTSIDE_WINDOW"
  | "STALE_SUBMISSION"
  | "AMOUNT_MISMATCH"
  | "DESTINATION_MISMATCH"
  | "DUPLICATE_SUBMISSION"
  | "REPLAY_DETECTED"
  | "AMBIGUOUS_STATE";

export type ReviewReason =
  | "POLICY_AMBIGUITY"
  | "RISK_THRESHOLD_EXCEEDED"
  | "CONTRADICTORY_SIGNAL"
  | "MANUAL_OVERRIDE_REQUIRED";

export interface Obligation {
  obligationId: ObligationId;
  correlationId: CorrelationId;
  actorId: ActorId;
  merchantId: string;
  amountMinor: number;
  currency: CurrencyCode;
  destinationRef: string;
  createdAt: string;
  expiresAt: string;
  purpose: string;
  policyVersion: string;
  obligationHash: string;
}

export interface Instruction {
  instructionId: InstructionId;
  obligationId: ObligationId;
  correlationId: CorrelationId;
  actorId: ActorId;
  amountMinor: number;
  currency: CurrencyCode;
  destinationRef: string;
  createdAt: string;
  expiresAt: string;
  nonce: string;
  integritySeal: string;
}

export interface Submission {
  submissionId: SubmissionId;
  instructionId: InstructionId;
  correlationId: CorrelationId;
  processorEventId: string;
  receivedAt: string;
  amountMinor: number;
  currency: CurrencyCode;
  destinationRef: string;
  idempotencyKey: string;
  processorStatus: "initiated" | "callback_received" | "charge_succeeded" | "charge_failed";
  payloadDigest: string;
}

export interface VerificationDecision {
  approved: boolean;
  refusalCode?: RefusalCode;
  reasons: string[];
  classification: VerificationClassification;
  confidence: number;
}

export interface ActivatedTransactionStatePayload {
  obligationId: ObligationId;
  instructionId: InstructionId;
  submissionId: SubmissionId;
  processorEventId: string;
  activationReason: "VERIFIED_TRUSTED_STATE";
}

export interface RefusalPayload {
  obligationId: ObligationId;
  instructionId: InstructionId;
  submissionId: SubmissionId;
  refusalCode: RefusalCode;
  reasons: string[];
}

export interface HumanReviewRequestedPayload {
  obligationId: ObligationId;
  instructionId: InstructionId;
  submissionId: SubmissionId;
  reviewReason: ReviewReason;
  reasons: string[];
}

export interface EvidencePackage {
  evidenceId: ArtifactId;
  correlationId: CorrelationId;
  artifactIds: ArtifactId[];
  boundAt: string;
  packageHash: string;
}

export interface BaseArtifact<TType extends string, TPayload> {
  artifactId: ArtifactId;
  type: TType;
  correlationId: CorrelationId;
  state: GTISState;
  issuedAt: string;
  previousArtifactHash: string | null;
  payload: TPayload;
  artifactHash: string;
}

export type ObligationArtifact = BaseArtifact<"ObligationArtifact", Obligation>;
export type InstructionArtifact = BaseArtifact<"InstructionArtifact", Instruction>;
export type SubmissionArtifact = BaseArtifact<"SubmissionArtifact", Submission>;
export type VerificationArtifact = BaseArtifact<"VerificationArtifact", VerificationDecision>;
export type ActivatedTransactionStateArtifact = BaseArtifact<
  "ActivatedTransactionStateArtifact",
  ActivatedTransactionStatePayload
>;
export type RefusalArtifact = BaseArtifact<"RefusalArtifact", RefusalPayload>;
export type HumanReviewRequestedArtifact = BaseArtifact<
  "HumanReviewRequestedArtifact",
  HumanReviewRequestedPayload
>;
export type EvidenceArtifact = BaseArtifact<"EvidenceArtifact", EvidencePackage>;

export type GTISArtifact =
  | ObligationArtifact
  | InstructionArtifact
  | SubmissionArtifact
  | VerificationArtifact
  | ActivatedTransactionStateArtifact
  | RefusalArtifact
  | HumanReviewRequestedArtifact
  | EvidenceArtifact;

export interface GTISMetrics {
  validFirstPassCount: number;
  replayRefusalCount: number;
  duplicateRefusalCount: number;
  staleSubmissionRefusalCount: number;
  mutationRefusalCount: number;
  humanReviewCount: number;
  activationCount: number;
  refusalCount: number;
}

export function emptyMetrics(): GTISMetrics {
  return {
    validFirstPassCount: 0,
    replayRefusalCount: 0,
    duplicateRefusalCount: 0,
    staleSubmissionRefusalCount: 0,
    mutationRefusalCount: 0,
    humanReviewCount: 0,
    activationCount: 0,
    refusalCount: 0,
  };
}

export interface GTISPolicy {
  clockSkewMs: number;
  staleSubmissionWindowMs: number;
}

export const DEFAULT_GTIS_POLICY: GTISPolicy = {
  clockSkewMs: 30_000,
  staleSubmissionWindowMs: 5 * 60_000,
};

export interface FinTechionAnomaly {
  anomalyId: ArtifactId;
  correlationId: CorrelationId;
  severity: "low" | "medium" | "high" | "critical";
  posture: "observe" | "review" | "hold" | "escalate";
  sourceArtifactType: "RefusalArtifact" | "HumanReviewRequestedArtifact";
  sourceState: GTISState;
  reason: string;
  exposureSignals: string[];
  createdAt: string;
}
