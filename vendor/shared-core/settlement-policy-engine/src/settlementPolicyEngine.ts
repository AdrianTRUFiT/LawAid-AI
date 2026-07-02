import type {
  SettlementPolicyArtifact,
  SettlementPolicyInput,
  SettlementPolicyResult,
} from "./settlementPolicyTypes.js";
import {
  includesIgnoreCase,
  makeSettlementPolicyId,
  nowIso,
} from "./settlementPolicyUtils.js";

export function runSettlementPolicyEngine(
  input: SettlementPolicyInput,
): SettlementPolicyResult {
  if (!input.paymentRail) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_PAYMENT_RAIL",
        refusalReason: "Settlement policy refused because payment rail artifact is missing.",
      },
    };
  }

  if (input.subjectId !== input.paymentRail.subjectId) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "Settlement policy refused because subjectId does not match payment rail subjectId.",
      },
    };
  }

  if (includesIgnoreCase(input.restrictedRegions, input.paymentRail.region)) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "REGION_RESTRICTED",
        refusalReason: `Settlement policy refused because region '${input.paymentRail.region}' is restricted.`,
      },
    };
  }

  const asset = input.paymentRail.asset.toUpperCase();
  const amount = input.paymentRail.amount;
  const preferredStablecoin = (input.preferredStablecoin ?? "USDC").toUpperCase();

  let settlementDecision:
    | "RETAIN_ASSET"
    | "CONVERT_TO_FIAT"
    | "CONVERT_TO_STABLECOIN"
    | "HOLD_FOR_REVIEW"
    | "REFUSE";

  let settlementAsset: string | null = null;
  let reviewRequired = false;
  let policyReason = "";

  if ((input.reviewAboveAmount ?? Number.POSITIVE_INFINITY) <= amount) {
    settlementDecision = "HOLD_FOR_REVIEW";
    settlementAsset = null;
    reviewRequired = true;
    policyReason = "Settlement held for review because amount exceeds configured review threshold.";
  } else if ((input.forceFiatThreshold ?? Number.POSITIVE_INFINITY) <= amount) {
    settlementDecision = "CONVERT_TO_FIAT";
    settlementAsset = input.paymentRail.currency.toUpperCase();
    policyReason = "Settlement converted to fiat because amount exceeds force-fiat threshold.";
  } else if (input.paymentRail.railType === "stablecoin") {
    settlementDecision = "RETAIN_ASSET";
    settlementAsset = asset;
    policyReason = "Stablecoin rail retained as governed settlement asset.";
  } else if (input.paymentRail.railType === "crypto") {
    if (includesIgnoreCase(input.allowedRetainAssets, asset)) {
      settlementDecision = "RETAIN_ASSET";
      settlementAsset = asset;
      policyReason = "Crypto asset retained because treasury policy explicitly allows it.";
    } else if (asset === "BTC") {
      settlementDecision = "CONVERT_TO_FIAT";
      settlementAsset = input.paymentRail.currency.toUpperCase();
      policyReason = "BTC converted to fiat under treasury policy.";
    } else if (asset === "ETH") {
      settlementDecision = "CONVERT_TO_STABLECOIN";
      settlementAsset = preferredStablecoin;
      policyReason = "ETH converted to preferred stablecoin under treasury policy.";
    } else {
      return {
        ok: false,
        artifact: null,
        refusal: {
          refusalCode: "UNSUPPORTED_ASSET",
          refusalReason: `Settlement policy refused because asset '${asset}' is unsupported.`,
        },
      };
    }
  } else {
    settlementDecision = "CONVERT_TO_FIAT";
    settlementAsset = input.paymentRail.currency.toUpperCase();
    policyReason = "Traditional rail settled to fiat.";
  }

  const artifact: SettlementPolicyArtifact = {
    settlementPolicyId: makeSettlementPolicyId(input.paymentRail.paymentRailId),
    subjectId: input.subjectId,
    sourcePaymentRailId: input.paymentRail.paymentRailId,
    receivedAsset: asset,
    receivedAmount: amount,
    receivedCurrency: input.paymentRail.currency.toUpperCase(),
    settlementDecision,
    settlementAsset,
    reviewRequired,
    policyReason,
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}