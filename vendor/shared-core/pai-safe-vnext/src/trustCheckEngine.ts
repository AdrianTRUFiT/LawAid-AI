import type {
  PaiSafeRiskCode,
  PaiSafeTransactionRequest,
  PaiSafeTrustCheck
} from "./contracts.js";
import { deterministicHash, isBlank, isValidDestinationFormat } from "./integrityUtils.js";

const REVIEW_AMOUNT_CENTS = 50000;

export function runAdvisoryTrustCheck(
  request: PaiSafeTransactionRequest,
  checkedAt = new Date().toISOString()
): PaiSafeTrustCheck {
  const risks: PaiSafeRiskCode[] = [];
  const requestHash = deterministicHash({
    transactionId: request.transactionId,
    merchant: request.merchant,
    consumer: request.consumer,
    amountCents: request.amountCents,
    currency: request.currency,
    purpose: request.purpose,
    paymentDestination: request.paymentDestination,
    expectedDestination: request.expectedDestination,
    destinationType: request.destinationType,
    termsText: request.termsText,
    refundPolicyText: request.refundPolicyText,
    metadata: request.metadata,
    duplicateOfTransactionId: request.duplicateOfTransactionId,
    createdAt: request.createdAt
  });

  if (isBlank(request.transactionId)) {
    risks.push("MISSING_TRANSACTION_ID");
  }

  if (!request.merchant || isBlank(request.merchant.merchantId)) {
    risks.push("MISSING_MERCHANT_IDENTITY");
  }

  if (request.merchant && request.merchant.verifiedIdentity === false && !isBlank(request.merchant.merchantId)) {
    risks.push("INVALID_MERCHANT_IDENTITY");
  }

  if (
    !request.merchant ||
    isBlank(request.merchant.displayName) ||
    typeof request.merchant.verifiedIdentity !== "boolean" ||
    typeof request.merchant.knownProcessorAccount !== "boolean"
  ) {
    risks.push("INCOMPLETE_MERCHANT_PROFILE");
  }

  if (!request.merchant?.verifiedIdentity || !request.merchant?.knownProcessorAccount) {
    risks.push("UNKNOWN_VENDOR");
  }

  if (
    request.merchant?.expectedProcessorAccount &&
    request.paymentDestination.trim() !== request.merchant.expectedProcessorAccount.trim()
  ) {
    risks.push("MERCHANT_DESTINATION_MISMATCH");
  }

  if (request.merchant?.riskFlag && request.merchant?.verifiedIdentity) {
    risks.push("MERCHANT_RISK_CONTRADICTION");
  }

  if (!request.merchant?.knownProcessorAccount) {
    risks.push("UNKNOWN_PROCESSOR_ACCOUNT");
  }

  if (request.paymentDestination.trim() !== request.expectedDestination.trim()) {
    risks.push("DESTINATION_MISMATCH");
  }

  if (isBlank(request.paymentDestination) || !isValidDestinationFormat(request.paymentDestination)) {
    risks.push("INVALID_DESTINATION_FORMAT");
  }

  if (request.metadata?.routeLocked === true && request.metadata?.routeOverride === true) {
    risks.push("CONFLICTING_TRANSACTION_ROUTING");
  }

  if (request.destinationType && request.destinationType !== "processor_account" && request.destinationType !== "bank_account") {
    risks.push("UNSUPPORTED_DESTINATION_TYPE");
  }

  if (!request.termsText || request.termsText.trim().length < 10) {
    risks.push("MISSING_TERMS");
  }

  if (!request.refundPolicyText || request.refundPolicyText.trim().length < 10) {
    risks.push("MISSING_REFUND_POLICY");
  }

  if (!request.consumer?.acknowledgedTerms) {
    risks.push("CONSUMER_ACK_MISSING");
  }

  if (!request.consumer || isBlank(request.consumer.consumerId) || isBlank(request.consumer.displayName)) {
    risks.push("INCOMPLETE_TRANSACTION_ACKNOWLEDGMENT");
  }

  if (request.consumer?.consentContradiction === true) {
    risks.push("CONTRADICTORY_TRANSACTION_CONSENT");
  }

  if (
    !request ||
    typeof request.amountCents !== "number" ||
    !Number.isFinite(request.amountCents) ||
    request.amountCents <= 0 ||
    request.currency !== "USD" ||
    isBlank(request.purpose) ||
    isBlank(request.createdAt)
  ) {
    risks.push("MALFORMED_TRANSACTION_REQUEST");
    risks.push("INVALID_TRANSACTION_STRUCTURE");
  }

  if (
    isBlank(request.transactionId) ||
    isBlank(request.purpose) ||
    isBlank(request.paymentDestination) ||
    isBlank(request.expectedDestination)
  ) {
    risks.push("MISSING_REQUIRED_FIELDS");
  }

  if (request.amountCents >= REVIEW_AMOUNT_CENTS) {
    risks.push("AMOUNT_REVIEW_REQUIRED");
  }

  if (request.metadata?.unusualPattern === true) {
    risks.push("UNUSUAL_TRANSACTION_PATTERN");
  }

  if (request.metadata?.sellerClaimsRefundable === true && request.metadata?.termsClaimFinalSale === true) {
    risks.push("CONFLICTING_TRANSACTION_METADATA");
  }

  if (!isBlank(request.duplicateOfTransactionId)) {
    risks.push("DUPLICATE_TRANSACTION_ATTEMPT");
  }

  const contradictionRisk =
    risks.includes("DESTINATION_MISMATCH") ||
    risks.includes("MERCHANT_DESTINATION_MISMATCH") ||
    risks.includes("CONFLICTING_TRANSACTION_ROUTING") ||
    risks.includes("CONTRADICTORY_TRANSACTION_CONSENT") ||
    risks.includes("CONFLICTING_TRANSACTION_METADATA") ||
    (risks.includes("UNKNOWN_VENDOR") && risks.includes("MISSING_TERMS"));

  if (contradictionRisk) {
    risks.push("HIGH_CONTRADICTION_RISK");
  }

  const uniqueRisks = [...new Set(risks)];

  if (uniqueRisks.filter((risk) => risk !== "NO_BLOCKING_RISK").length >= 3) {
    uniqueRisks.push("MULTIPLE_RISK_COMBINATION");
  }

  if (uniqueRisks.length === 0) {
    uniqueRisks.push("NO_BLOCKING_RISK");
  }

  const decision =
    hasRefusalRisk(uniqueRisks)
      ? "REFUSED"
      : hasHoldRisk(uniqueRisks)
        ? "HOLD"
        : "SAFE";

  const decisionHash = deterministicHash({
    transactionId: request.transactionId,
    decision,
    riskCodes: uniqueRisks,
    requestHash,
    checkedAt
  });

  return {
    transactionId: request.transactionId,
    decision,
    riskCodes: uniqueRisks,
    reviewRequired: decision === "HOLD",
    explanation: buildExplanation(decision, uniqueRisks),
    requestHash,
    decisionHash,
    checkedAt
  };
}

function hasRefusalRisk(risks: PaiSafeRiskCode[]): boolean {
  return risks.some((risk) =>
    [
      "MISSING_TRANSACTION_ID",
      "MISSING_MERCHANT_IDENTITY",
      "INVALID_MERCHANT_IDENTITY",
      "MERCHANT_DESTINATION_MISMATCH",
      "MERCHANT_RISK_CONTRADICTION",
      "DESTINATION_MISMATCH",
      "INVALID_DESTINATION_FORMAT",
      "CONFLICTING_TRANSACTION_ROUTING",
      "UNSUPPORTED_DESTINATION_TYPE",
      "CONTRADICTORY_TRANSACTION_CONSENT",
      "MALFORMED_TRANSACTION_REQUEST",
      "MISSING_REQUIRED_FIELDS",
      "INVALID_TRANSACTION_STRUCTURE",
      "CONFLICTING_TRANSACTION_METADATA",
      "DUPLICATE_TRANSACTION_ATTEMPT",
      "HIGH_CONTRADICTION_RISK",
      "PROOF_CONSISTENCY_FAILURE"
    ].includes(risk)
  );
}

function hasHoldRisk(risks: PaiSafeRiskCode[]): boolean {
  return risks.some((risk) =>
    [
      "INCOMPLETE_MERCHANT_PROFILE",
      "UNKNOWN_VENDOR",
      "UNKNOWN_PROCESSOR_ACCOUNT",
      "MISSING_TERMS",
      "MISSING_REFUND_POLICY",
      "CONSUMER_ACK_MISSING",
      "INCOMPLETE_TRANSACTION_ACKNOWLEDGMENT",
      "AMOUNT_REVIEW_REQUIRED",
      "UNUSUAL_TRANSACTION_PATTERN",
      "MULTIPLE_RISK_COMBINATION"
    ].includes(risk)
  );
}

function buildExplanation(decision: "SAFE" | "HOLD" | "REFUSED", risks: PaiSafeRiskCode[]): string {
  if (decision === "SAFE") {
    return "Transaction is advisory-safe based on available merchant, consumer, destination, terms, and policy signals.";
  }

  if (decision === "HOLD") {
    return `Transaction requires review before fulfillment or payment confidence. Risk codes: ${risks.join(", ")}.`;
  }

  return `Transaction is refused for this advisory pass because blocking contradiction, integrity failure, or destination risk was detected. Risk codes: ${risks.join(", ")}.`;
}