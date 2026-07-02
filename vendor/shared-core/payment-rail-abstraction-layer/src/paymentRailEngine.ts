import type {
  NormalizedPaymentRailArtifact,
  PaymentRailRequest,
  PaymentRailResult,
} from "./paymentRailTypes.js";
import {
  makePaymentRailId,
  normalizeLower,
  normalizeUpper,
  nowIso,
} from "./paymentRailUtils.js";

export function runPaymentRailAbstraction(
  input: PaymentRailRequest,
): PaymentRailResult {
  if (!input.provider || input.provider.trim() === "") {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_PROVIDER",
        refusalReason: "Payment rail abstraction refused because provider is missing.",
      },
    };
  }

  if (input.amount <= 0) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "INVALID_AMOUNT",
        refusalReason: "Payment rail abstraction refused because amount must be positive.",
      },
    };
  }

  if (input.enabled === false) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "DISABLED_RAIL",
        refusalReason: "Payment rail abstraction refused because this rail is disabled.",
      },
    };
  }

  const normalizedRail = normalizeLower(input.railType);
  let railType: "card" | "bank" | "crypto" | "stablecoin";
  let routeClass: "traditional" | "digital_asset";

  switch (normalizedRail) {
    case "card":
      railType = "card";
      routeClass = "traditional";
      break;
    case "bank":
      railType = "bank";
      routeClass = "traditional";
      break;
    case "crypto":
      railType = "crypto";
      routeClass = "digital_asset";
      break;
    case "stablecoin":
      railType = "stablecoin";
      routeClass = "digital_asset";
      break;
    default:
      return {
        ok: false,
        artifact: null,
        refusal: {
          refusalCode: "UNSUPPORTED_RAIL",
          refusalReason: `Payment rail abstraction refused because rail '${input.railType}' is unsupported.`,
        },
      };
  }

  const artifact: NormalizedPaymentRailArtifact = {
    paymentRailId: makePaymentRailId(input.subjectId, normalizeLower(input.provider), railType),
    subjectId: input.subjectId,
    railType,
    provider: normalizeLower(input.provider),
    asset: normalizeUpper(input.asset),
    amount: input.amount,
    currency: normalizeUpper(input.currency),
    region: normalizeUpper(input.region),
    environment: input.environment,
    routeClass,
    sourceRequestAccepted: true,
    reason: "Payment rail request normalized into governed payment-entry form.",
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}