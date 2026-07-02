import type { NormalizedPaymentRailArtifact } from "../../payment-rail-abstraction-layer/src/index.js";

export type QuoteStatus =
  | "LIVE"
  | "EXPIRED"
  | "REQUOTE_REQUIRED"
  | "TIMED_OUT";

export interface QuoteExpirationInput {
  subjectId: string;
  paymentRail: NormalizedPaymentRailArtifact;
  referenceRate: number;
  quoteWindowSeconds: number;
  createdAtIso?: string;
  evaluationAtIso?: string;
  paymentCompleted?: boolean;
  underpaymentDetected?: boolean;
}

export interface QuoteExpirationArtifact {
  quoteId: string;
  subjectId: string;
  sourcePaymentRailId: string;
  quotedAsset: string;
  quotedCurrency: string;
  referenceRate: number;
  quoteWindowSeconds: number;
  quotedAt: string;
  expiresAt: string;
  quoteStatus: QuoteStatus;
  requoteRequired: boolean;
  policyReason: string;
  createdAt: string;
}

export interface QuoteExpirationRefusal {
  refusalCode:
    | "MISSING_PAYMENT_RAIL"
    | "SUBJECT_MISMATCH"
    | "INVALID_RATE"
    | "INVALID_WINDOW";
  refusalReason: string;
}

export interface QuoteExpirationResult {
  ok: boolean;
  artifact: QuoteExpirationArtifact | null;
  refusal: QuoteExpirationRefusal | null;
}