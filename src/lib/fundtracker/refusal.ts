import type { VerificationDecision, VerificationStatus, PaymentStatus, RefusalReason } from "./types";

export function buildHeldDecision(
  reasons: RefusalReason[],
  evaluatedAt: string = new Date().toISOString(),
): VerificationDecision {
  return {
    allowed: false,
    paymentStatus: "held",
    verificationStatus: "held",
    reasons,
    evaluatedAt,
  };
}

export function buildRefusedDecision(
  reasons: RefusalReason[],
  evaluatedAt: string = new Date().toISOString(),
): VerificationDecision {
  return {
    allowed: false,
    paymentStatus: "refused",
    verificationStatus: "refused",
    reasons,
    evaluatedAt,
  };
}

export function isTerminalVerificationStatus(
  status: VerificationStatus,
): boolean {
  return status === "verified" || status === "refused";
}

export function isTerminalPaymentStatus(
  status: PaymentStatus,
): boolean {
  return (
    status === "activated" ||
    status === "refused" ||
    status === "failed" ||
    status === "canceled" ||
    status === "refunded" ||
    status === "disputed"
  );
}

export function refusalSummary(reasons: RefusalReason[]): string {
  if (reasons.length === 0) {
    return "No refusal reasons recorded.";
  }

  return reasons.map((reason) => `${reason.code}: ${reason.message}`).join(" | ");
}
