function mask(value: unknown): string {
  const raw = String(value ?? "");
  if (raw.length <= 4) {
    return "****";
  }
  return `${raw.slice(0, 2)}****${raw.slice(-2)}`;
}

export function sanitizeVerifiedOpportunityPreview(
  payload: Record<string, unknown>,
) {
  return {
    verifiedOpportunityId: payload.verifiedOpportunityId ?? null,
    sourceSystem: payload.sourceSystem ?? null,
    merchantId: mask(payload.merchantId),
    customerId: mask(payload.customerId),
    productId: payload.productId ?? null,
    amount: payload.amount ?? null,
    currency: payload.currency ?? null,
    destinationType: payload.destinationType ?? null,
  };
}

export function sanitizeReviewQueuePreview(
  payload: Record<string, unknown>,
) {
  return {
    reviewId: payload.reviewId ?? null,
    transactionId: payload.transactionId ?? null,
    merchantId: mask(payload.merchantId),
    customerId: mask(payload.customerId),
    status: payload.status ?? null,
    source: payload.source ?? null,
    reasonSummary: payload.reasonSummary ?? null,
  };
}

export function sanitizeReviewAuditPreview(
  payload: Record<string, unknown>,
) {
  return {
    auditId: payload.auditId ?? null,
    reviewId: payload.reviewId ?? null,
    transactionId: payload.transactionId ?? null,
    action: payload.action ?? null,
    reviewerId: mask(payload.reviewerId),
    createdAt: payload.createdAt ?? null,
  };
}

export function sanitizePermanentRefusalPreview(
  payload: Record<string, unknown>,
) {
  return {
    transactionId: payload.transactionId ?? null,
    reviewId: payload.reviewId ?? null,
    reviewerId: mask(payload.reviewerId),
    refusedAt: payload.refusedAt ?? null,
    reasonCount: Array.isArray(payload.reasons) ? payload.reasons.length : 0,
  };
}

export function sanitizeApprovedReviewPreview(
  payload: Record<string, unknown>,
) {
  return {
    reviewId: payload.reviewId ?? null,
    transactionId: payload.transactionId ?? null,
    reviewerId: mask(payload.reviewerId),
    approvedAt: payload.approvedAt ?? null,
  };
}

export function sanitizeByArtifactType(
  artifactType: string,
  payload: Record<string, unknown>,
) {
  switch (artifactType) {
    case "VerifiedOpportunity":
      return sanitizeVerifiedOpportunityPreview(payload);
    case "ReviewQueueItem":
      return sanitizeReviewQueuePreview(payload);
    case "ReviewAuditRecord":
      return sanitizeReviewAuditPreview(payload);
    case "PermanentRefusalRecord":
      return sanitizePermanentRefusalPreview(payload);
    case "ApprovedReviewRecord":
      return sanitizeApprovedReviewPreview(payload);
    default:
      return payload;
  }
}
