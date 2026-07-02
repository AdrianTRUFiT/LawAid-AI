import type {
  BillingTruthArtifact,
  BillingTruthResult,
  RawBillingEvent,
} from "./billingTruthTypes.js";
import { normalizeCurrency, normalizeEventType, nowIso } from "./billingTruthUtils.js";

function makeTruthId(eventId: string): string {
  return `billing_truth_${eventId}`;
}

export function runBillingTruthNormalization(
  raw: RawBillingEvent,
): BillingTruthResult {
  if (!raw.customerId || raw.customerId.trim() === "") {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_CUSTOMER_ID",
        refusalReason: "Billing truth normalization refused because customerId is missing.",
      },
    };
  }

  if (!raw.eventId || !raw.occurredAt) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MALFORMED_EVENT",
        refusalReason: "Billing truth normalization refused because required event fields are missing.",
      },
    };
  }

  if (typeof raw.amount === "number" && raw.amount < 0) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "INVALID_AMOUNT",
        refusalReason: "Billing truth normalization refused because amount cannot be negative.",
      },
    };
  }

  const eventType = normalizeEventType(raw.eventType);

  let normalizedStatus:
    | "ACTIVE"
    | "PAST_DUE"
    | "PENDING"
    | "CANCELLED"
    | "REFUNDED"
    | "REFUSED";

  let billingAction:
    | "PROVISION_OK"
    | "HOLD_PROVISION"
    | "CANCEL_ACCESS"
    | "RECORD_REFUND"
    | "REVIEW_REQUIRED";

  let confidence = 0.9;
  let reason = "";

  switch (eventType) {
    case "checkout.session.completed":
    case "invoice.paid":
    case "customer.subscription.created":
    case "customer.subscription.updated":
      normalizedStatus = "ACTIVE";
      billingAction = "PROVISION_OK";
      reason = "Billing event normalized into active subscription truth.";
      break;

    case "invoice.payment_failed":
      normalizedStatus = "PAST_DUE";
      billingAction = "HOLD_PROVISION";
      confidence = 0.95;
      reason = "Payment failure normalized into past-due subscription truth.";
      break;

    case "customer.subscription.deleted":
      normalizedStatus = "CANCELLED";
      billingAction = "CANCEL_ACCESS";
      confidence = 0.95;
      reason = "Subscription deletion normalized into cancellation truth.";
      break;

    case "charge.refunded":
      normalizedStatus = "REFUNDED";
      billingAction = "RECORD_REFUND";
      confidence = 0.95;
      reason = "Refund event normalized into refund truth.";
      break;

    default:
      return {
        ok: false,
        artifact: null,
        refusal: {
          refusalCode: "UNKNOWN_EVENT_TYPE",
          refusalReason: `Billing truth normalization refused because eventType '${eventType}' is not mapped.`,
        },
      };
  }

  const artifact: BillingTruthArtifact = {
    truthId: makeTruthId(raw.eventId),
    sourceEventId: raw.eventId,
    customerId: raw.customerId,
    subscriptionId: raw.subscriptionId ?? null,
    normalizedStatus,
    billingAction,
    amount: typeof raw.amount === "number" ? raw.amount : null,
    currency: normalizeCurrency(raw.currency),
    confidence,
    reason,
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}